"use client";

import type { Language, Question } from "@/types/questionnaire";

const symbols: Record<string, string> = {
  madaba_resident: "⌂",
  visitor_jordan: "↗",
  international_visitor: "◎",
  female: "F",
  male: "M",
  prefer_not: "—",
  first_visit: "1",
  "2_5_visits": "2–5",
  "6_plus_visits": "6+",
  monthly: "M",
  weekly_plus: "W+",
  sightseeing: "◉",
  shopping_services: "◇",
  work_study: "▣",
  social_family: "●●",
  passing_through: "→",
  alone: "●",
  adults_only: "●●",
  children: "●○",
  organized_tour: "≋",
  "10_19": "10",
  "20_39": "20",
  "40_59": "40",
  "60_plus": "60+",
  yes: "✓",
  no: "—",
};

function Cards({ question, language, value, onChange, className = "" }: { question: Question; language: Language; value?: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className={`choice-grid thesis-choice-grid ${className}`} role="radiogroup" aria-label={question.label[language]}>
      {question.options.map((option) => {
        const active = value === option.value;
        return (
          <button key={option.value} type="button" role="radio" aria-checked={active} className={`choice-card thesis-choice-card ${active ? "is-selected" : ""}`} onClick={() => onChange(option.value)}>
            <span className="choice-card__symbol">{symbols[option.value] ?? "◇"}</span>
            <span className="choice-card__copy"><strong>{option.label[language]}</strong></span>
          </button>
        );
      })}
    </div>
  );
}

function AgeTimeline({ question, language, value, onChange }: { question: Question; language: Language; value?: string; onChange: (value: string) => void }) {
  const selectedIndex = question.options.findIndex((option) => option.value === value);
  const denominator = Math.max(1, question.options.length - 1);
  return (
    <div className="age-timeline age-timeline--six" role="radiogroup" aria-label={question.label[language]}>
      <div className="age-timeline__track" aria-hidden="true"><i style={{ width: `${selectedIndex >= 0 ? (selectedIndex / denominator) * 100 : 0}%` }} /></div>
      {question.options.map((option, index) => {
        const active = value === option.value;
        return (
          <button key={option.value} type="button" role="radio" aria-checked={active} className={`age-stop ${active ? "is-selected" : ""}`} onClick={() => onChange(option.value)}>
            <span className="age-stop__dot">{index + 1}</span>
            <strong>{option.label[language]}</strong>
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceQuestion({ question, language, value, onChange }: { question: Question; language: Language; value?: string; onChange: (value: string) => void }) {
  if (question.id === "P3") return <AgeTimeline question={question} language={language} value={value} onChange={onChange} />;
  if (question.id === "G_CONSUMED") return <Cards question={question} language={language} value={value} onChange={onChange} className="thesis-choice-grid--binary" />;
  return <Cards question={question} language={language} value={value} onChange={onChange} />;
}
