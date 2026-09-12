import { questions, STUDY_VERSION } from "@/config/study";
import type { FeatureMarker, Language, TrailImage } from "@/types/questionnaire";

export type SubmissionPayload = {
  submission: Record<string, unknown>;
  answers: Array<Record<string, unknown>>;
};

type AnswerRow = {
  submission_id: string;
  question_id: string;
  answer_value: string;
  answered_at: string;
  response_ms: number | null;
  answer_meta: Record<string, unknown>;
};

export function buildSubmissionPayload(args: {
  submissionId: string;
  language: Language;
  selectedTrailId: string;
  answers: Record<string, string>;
  answeredAt: Record<string, string>;
  responseMs: Record<string, number>;
  timestamps: Record<string, string>;
  featureMarkers?: FeatureMarker[];
  selectedTrailImage?: TrailImage;
}): SubmissionPayload {
  const { submissionId, language, selectedTrailId, answers, answeredAt, responseMs, timestamps, featureMarkers = [], selectedTrailImage } = args;
  const coreMeta = new Map<string, Record<string, unknown>>(questions.map((question) => [question.id, {
    section: question.section,
    theme: question.theme,
    display_code: question.displayCode ?? question.id,
    reverse_scored: Boolean(question.reverseScored),
    fuzzy_ahp_weighted: question.section !== "contextual",
    conditional_gustatory: ["G2", "G3", "G4", "G5"].includes(question.id),
    type: question.type,
    instrument_role: "core_mpa",
  }] as [string, Record<string, unknown>]));

  const answerRows: AnswerRow[] = Object.entries(answers).map(([questionId, answerValue]) => ({
    submission_id: submissionId,
    question_id: questionId,
    answer_value: answerValue,
    answered_at: answeredAt[questionId] ?? timestamps.completed_at ?? new Date().toISOString(),
    response_ms: responseMs[questionId] ?? null,
    answer_meta: coreMeta.get(questionId) ?? { section: "core", type: "unknown", instrument_role: "core_mpa" },
  }));

  if (featureMarkers.length === 3) {
    answerRows.push({
      submission_id: submissionId,
      question_id: "TRAIL_IMAGE_FEATURES",
      answer_value: JSON.stringify(featureMarkers),
      answered_at: timestamps.image_completed_at ?? timestamps.completed_at ?? new Date().toISOString(),
      response_ms: null,
      answer_meta: {
        section: "image_task",
        type: "three_point_annotation",
        instrument_role: "supplemental",
        trail_id: selectedTrailId,
        image_id: selectedTrailImage?.id ?? null,
        image_src: selectedTrailImage?.src ?? null,
        point_count: 3,
      },
    });
  }

  return {
    submission: {
      id: submissionId,
      questionnaire_version: STUDY_VERSION,
      language_selected: language,
      current_stage: "complete",
      completion_status: "completed",
      started_at: timestamps.started_at ?? null,
      consent_accepted_at: timestamps.consent_accepted_at ?? null,
      core_started_at: timestamps.core_started_at ?? null,
      core_completed_at: timestamps.core_completed_at ?? null,
      completed_at: timestamps.completed_at ?? new Date().toISOString(),
      selected_trail_id: selectedTrailId || null,
    },
    answers: answerRows,
  };
}
