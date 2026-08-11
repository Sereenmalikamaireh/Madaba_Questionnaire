"use client";

import type { Language } from "@/types/questionnaire";

export type JourneyStage = "about" | "sensory" | "context" | "psychological" | "attachment" | "street" | "feedback";

const stages = [
  { id: "about", en: "About You", ar: "عنك" },
  { id: "sensory", en: "Sensory", ar: "الحواس" },
  { id: "context", en: "Context", ar: "السياق" },
  { id: "psychological", en: "Responses", ar: "الاستجابات" },
  { id: "attachment", en: "Attachment", ar: "الارتباط" },
  { id: "street", en: "Your Street", ar: "شارعك" },
  { id: "feedback", en: "Feedback", ar: "ملاحظات" },
] as const;

export function StageProgress({ language, active, percent }: { language: Language; active: JourneyStage; percent: number }) {
  const activeIndex = stages.findIndex((stage) => stage.id === active);
  return (
    <div className="stage-progress" aria-label={language === "ar" ? "تقدم الاستبيان" : "Questionnaire progress"}>
      <div className="stage-progress__labels stage-progress__labels--seven">
        {stages.map((stage, index) => (
          <div key={stage.id} className={`stage-progress__item ${index < activeIndex ? "is-done" : ""} ${index === activeIndex ? "is-active" : ""}`}>
            <span className="stage-progress__dot">{index < activeIndex ? "✓" : index + 1}</span>
            <span>{language === "ar" ? stage.ar : stage.en}</span>
          </div>
        ))}
      </div>
      <div className="stage-progress__track"><div style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>
    </div>
  );
}
