import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/serverSupabase";

export const runtime = "nodejs";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isObject(body) || !isObject(body.submission) || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Invalid submission payload." }, { status: 400 });
    }
    const submissionId = body.submission.id;
    if (typeof submissionId !== "string" || !submissionId) {
      return NextResponse.json({ error: "Missing submission ID." }, { status: 400 });
    }
    const answers = body.answers.filter(isObject);
    if (answers.some((row) => row.submission_id !== submissionId)) {
      return NextResponse.json({ error: "Answer/submission ID mismatch." }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { error: submissionError } = await supabase.from("submissions").upsert(body.submission, { onConflict: "id" });
    if (submissionError) throw submissionError;

    if (answers.length) {
      const { error: answerError } = await supabase.from("answers").upsert(answers, { onConflict: "submission_id,question_id" });
      if (answerError) throw answerError;
    }

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
