import { getServerSupabase } from "@/lib/serverSupabase";
import { STUDY_VERSION, trailImages } from "@/config/study";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}
function parseMarkers(value?: string) {
  if (!value) return [] as Array<{ x: number; y: number }>;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => ({ x: Number(row?.x), y: Number(row?.y) })).filter((row) => Number.isFinite(row.x) && Number.isFinite(row.y)).slice(0, 3);
  } catch { return []; }
}

export async function GET(request: Request) {
  const expected = process.env.RESEARCH_DASHBOARD_KEY;
  const provided = request.headers.get("x-research-key");
  if (!expected || !provided || provided !== expected) return new Response("Unauthorized", { status: 401 });

  try {
    const supabase = getServerSupabase();
    const { data: submissions, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("questionnaire_version", STUDY_VERSION)
      .order("created_at", { ascending: true })
      .limit(5000);
    if (submissionError) throw submissionError;

    const rows = submissions ?? [];
    const ids = rows.map((row: any) => row.id);
    const allAnswers: any[] = [];
    for (const idChunk of chunks(ids, 100)) {
      const PAGE = 1000;
      for (let start = 0; ; start += PAGE) {
        const { data, error } = await supabase
          .from("answers")
          .select("submission_id,question_id,answer_value,answered_at,response_ms,answer_meta")
          .in("submission_id", idChunk)
          .order("submission_id", { ascending: true })
          .range(start, start + PAGE - 1);
        if (error) throw error;
        const page = data ?? [];
        allAnswers.push(...page);
        if (page.length < PAGE) break;
      }
    }

    const answerMap = new Map<string, Record<string, string>>();
    const imageMetaMap = new Map<string, Record<string, any>>();
    allAnswers.forEach((answer) => {
      const record = answerMap.get(answer.submission_id) ?? {};
      record[answer.question_id] = answer.answer_value ?? "";
      answerMap.set(answer.submission_id, record);
      if (answer.question_id === "TRAIL_IMAGE_FEATURES") imageMetaMap.set(answer.submission_id, answer.answer_meta ?? {});
    });

    const baseColumns = [
      "id", "questionnaire_version", "language_selected", "completion_status", "started_at", "consent_accepted_at",
      "core_started_at", "core_completed_at", "completed_at", "selected_trail_id", "created_at", "updated_at",
    ];
    const coreOrder = [
      "P1","P2","P3","P4","P5","P6","P7","P8",
      "V1","V2","V3","V4","V5","V6",
      "AUD1","AUD2","AUD3","AUD4","AUD5","AUD6",
      "O1","O2","O3","O4",
      "T1","T2","T3","T4","T5",
      "G1","G_CONSUMED","G2","G3","G4","G5",
      "CTX1","CTX2","CTX3",
      "SAT1","SAT2","SAT3","MEM1","MEM2","MEM3","SEC1","SEC2","SEC3",
      "PI1","PI2","PI3","PD1","PD2","PD3"
    ];
    const imageColumns = ["trail_image_id","trail_image_src","point_1_x","point_1_y","point_2_x","point_2_y","point_3_x","point_3_y"];
    const header = [...baseColumns, ...coreOrder, ...imageColumns];
    const lines = [header.map(csvCell).join(",")];

    rows.forEach((submission: any) => {
      const answers = answerMap.get(submission.id) ?? {};
      const markers = parseMarkers(answers.TRAIL_IMAGE_FEATURES);
      const meta = imageMetaMap.get(submission.id) ?? {};
      const configuredImage = trailImages.find((image) => image.trailId === submission.selected_trail_id);
      const extra: Record<string, unknown> = {
        trail_image_id: meta.image_id ?? configuredImage?.id ?? "",
        trail_image_src: meta.image_src ?? configuredImage?.src ?? "",
        point_1_x: markers[0]?.x ?? "", point_1_y: markers[0]?.y ?? "",
        point_2_x: markers[1]?.x ?? "", point_2_y: markers[1]?.y ?? "",
        point_3_x: markers[2]?.x ?? "", point_3_y: markers[2]?.y ?? "",
      };
      lines.push(header.map((column) => csvCell(column in submission ? submission[column] : column in extra ? extra[column] : answers[column] ?? "")).join(","));
    });

    const filename = `mpa-index-final-v24-export-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : String(error), { status: 500 });
  }
}
