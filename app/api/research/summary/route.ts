import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";
import { STUDY_VERSION } from "@/config/study";

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

export async function GET(request: Request) {
  const expected = process.env.RESEARCH_DASHBOARD_KEY;
  const provided = request.headers.get("x-research-key");
  if (!expected || !provided || provided !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase.from("submissions").select("id,completion_status,selected_trail_id,started_at,completed_at,language_selected,created_at").eq("questionnaire_version", STUDY_VERSION).order("created_at", { ascending: false }).limit(5000);
    if (error) throw error;
    const rows = data ?? [];
    const completed = rows.filter((row: any) => row.completion_status === "completed");
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
    return NextResponse.json({ total: rows.length, completed: completed.length, incomplete: rows.length - completed.length, medianCompletionSeconds: median(durations), trailCounts, languageCounts, recent: rows.slice(0, 20) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
