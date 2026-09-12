"use client";

import type { Language } from "@/types/questionnaire";

export function StageProgress({ language, percent }: { language: Language; percent: number }) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="completion-progress" aria-label={language === "ar" ? "نسبة إكمال الاستبيان" : "Questionnaire completion"}>
      <div className="completion-progress__text">
        <strong>{safe}%</strong>
        <span>{language === "ar" ? "مكتمل" : "complete"}</span>
      </div>
      <div className="completion-progress__track" aria-hidden="true"><div style={{ width: `${safe}%` }} /></div>
    </div>
  );
}
