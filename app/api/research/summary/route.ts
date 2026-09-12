import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { questions, STUDY_VERSION, trailImages } from "@/config/study";

export const runtime = "nodejs";

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
function increment(map: Record<string, number>, key: string | null | undefined) {
  if (!key) return;
  map[key] = (map[key] ?? 0) + 1;
}
function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

type Marker = { id?: string; x: number; y: number };
function parseMarkers(value: unknown): Marker[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => ({ id: typeof row?.id === "string" ? row.id : undefined, x: Number(row?.x), y: Number(row?.y) }))
      .filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y) && row.x >= 0 && row.x <= 1 && row.y >= 0 && row.y <= 1)
      .slice(0, 3);
  } catch { return []; }
}

export async function GET(request: Request) {
  const expected = process.env.RESEARCH_DASHBOARD_KEY;
  const provided = request.headers.get("x-research-key");
  if (!expected || !provided || provided !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("submissions")
      .select("id,completion_status,selected_trail_id,started_at,completed_at,language_selected,created_at")
      .eq("questionnaire_version", STUDY_VERSION)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw error;

    const rows = data ?? [];
    const completed = rows.filter((row: any) => row.completion_status === "completed");
    const completedIds = completed.map((row: any) => row.id);
    const submissionMap = new Map(completed.map((row: any) => [row.id, row]));
    const trailCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};
    const durations: number[] = [];

    completed.forEach((row: any) => {
      increment(trailCounts, row.selected_trail_id);
      increment(languageCounts, row.language_selected);
      if (row.started_at && row.completed_at) {
        const duration = new Date(row.completed_at).getTime() - new Date(row.started_at).getTime();
        if (Number.isFinite(duration) && duration >= 0) durations.push(Math.round(duration / 1000));
      }
    });

    const likertQuestions = questions.filter((question) => question.type === "likert");
    const likertIds = new Set(likertQuestions.map((question) => question.id));
    const wantedIds = [...likertIds, "TRAIL_IMAGE_FEATURES"];
    const answerRows: any[] = [];

    for (const idChunk of chunks(completedIds, 100)) {
      const PAGE = 1000;
      for (let start = 0; ; start += PAGE) {
        const { data: answerPage, error: answerError } = await supabase
          .from("answers")
          .select("submission_id,question_id,answer_value,answer_meta,answered_at")
          .in("submission_id", idChunk)
          .in("question_id", wantedIds)
          .order("submission_id", { ascending: true })
          .range(start, start + PAGE - 1);
        if (answerError) throw answerError;
        const page = answerPage ?? [];
        answerRows.push(...page);
        if (page.length < PAGE) break;
      }
    }

    const itemStats: Record<string, { n: number; mean: number | null; counts: Record<string, number> }> = {};
    for (const question of likertQuestions) itemStats[question.id] = { n: 0, mean: null, counts: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } };
    const sums: Record<string, number> = {};
    const annotations: Array<{ submission_id: string; selected_trail_id: string | null; completed_at: string | null; language_selected: string | null; image_id: string | null; image_src: string | null; markers: Marker[] }> = [];

    for (const answer of answerRows) {
      if (likertIds.has(answer.question_id)) {
        const value = Number(answer.answer_value);
        if (Number.isFinite(value) && value >= 1 && value <= 5) {
          const stat = itemStats[answer.question_id];
          stat.n += 1;
          stat.counts[String(value)] = (stat.counts[String(value)] ?? 0) + 1;
          sums[answer.question_id] = (sums[answer.question_id] ?? 0) + value;
        }
      }
      if (answer.question_id === "TRAIL_IMAGE_FEATURES") {
        const submission: any = submissionMap.get(answer.submission_id);
        if (!submission) continue;
        const markers = parseMarkers(answer.answer_value);
        const configuredImage = trailImages.find((image) => image.trailId === submission.selected_trail_id);
        annotations.push({
          submission_id: answer.submission_id,
          selected_trail_id: submission.selected_trail_id ?? null,
          completed_at: submission.completed_at ?? null,
          language_selected: submission.language_selected ?? null,
          image_id: typeof answer.answer_meta?.image_id === "string" ? answer.answer_meta.image_id : configuredImage?.id ?? null,
          image_src: typeof answer.answer_meta?.image_src === "string" ? answer.answer_meta.image_src : configuredImage?.src ?? null,
          markers,
        });
      }
    }
    Object.entries(itemStats).forEach(([id, stat]) => { stat.mean = stat.n ? Number(((sums[id] ?? 0) / stat.n).toFixed(3)) : null; });
    annotations.sort((a, b) => String(b.completed_at ?? "").localeCompare(String(a.completed_at ?? "")));

    return NextResponse.json({
      total: rows.length,
      completed: completed.length,
      incomplete: rows.length - completed.length,
      medianCompletionSeconds: median(durations),
      trailCounts,
      languageCounts,
      recent: rows.slice(0, 50),
      itemStats,
      annotations,
      version: STUDY_VERSION,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
