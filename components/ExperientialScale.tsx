"use client";

import { useRef } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { Language, Question } from "@/types/questionnaire";

const SEGMENTED_SCALE_SYSTEM_V21 = "SEGMENTED_SCALE_SYSTEM_V21";
void SEGMENTED_SCALE_SYSTEM_V21;

type Props = {
  question: Question;
  language: Language;
  value?: string;
  onChange: (value: string) => void;
};

type SectionPalette = {
  label: { en: string; ar: string };
  start: string;
  mid: string;
  end: string;
  ink: string;
};

/*
  The two endpoint shades are deliberately matched in visual weight.
  They distinguish the ends of the scale without using a red=bad / green=good code.
*/
const sectionPalettes: Record<string, SectionPalette> = {
  profile: { label: { en: "About you", ar: "عنك" }, start: "#A58D72", mid: "#EAE1D7", end: "#86705A", ink: "#665342" },
  visual: { label: { en: "Visual experience", ar: "التجربة البصرية" }, start: "#6A92A8", mid: "#E0E9ED", end: "#4E788F", ink: "#355E73" },
  auditory: { label: { en: "Auditory experience", ar: "التجربة السمعية" }, start: "#817EAF", mid: "#E7E5F0", end: "#686B9A", ink: "#52577E" },
  olfactory: { label: { en: "Olfactory experience", ar: "التجربة الشمية" }, start: "#6F9B7D", mid: "#E2EBE4", end: "#537E68", ink: "#3F6853" },
  tactile: { label: { en: "Tactile / walking surface", ar: "اللمس / سطح المشي" }, start: "#B09365", mid: "#EEE7DB", end: "#8D744E", ink: "#6C593D" },
  gustatory: { label: { en: "Food and drink", ar: "الطعام والشراب" }, start: "#C08363", mid: "#F0E4DC", end: "#A16750", ink: "#7C4F3D" },
  contextual: { label: { en: "Contextual conditions", ar: "الظروف السياقية" }, start: "#789899", mid: "#E3EAEB", end: "#607F82", ink: "#4A6669" },
  satisfaction: { label: { en: "Satisfaction", ar: "الرضا" }, start: "#C18862", mid: "#F1E5DA", end: "#A96E4B", ink: "#85583C" },
  memory: { label: { en: "Memory", ar: "الذاكرة" }, start: "#8D7EAF", mid: "#E9E5F0", end: "#756B9D", ink: "#5E5683" },
  security: { label: { en: "Perceived security", ar: "الأمان المدرك" }, start: "#7899AA", mid: "#E4EAED", end: "#587A8E", ink: "#416176" },
  identity: { label: { en: "Heritage identity resonance", ar: "صدى الهوية التراثية" }, start: "#A97B83", mid: "#EEE4E6", end: "#8E626D", ink: "#714D57" },
  place_identity: { label: { en: "Place identity", ar: "هوية المكان" }, start: "#88986F", mid: "#E8EBDD", end: "#6A7D57", ink: "#536344" },
  place_dependence: { label: { en: "Place dependence", ar: "الاعتماد على المكان" }, start: "#6A9690", mid: "#E1EBE9", end: "#527B79", ink: "#3F6260" },
};
export function ExperientialScale({ question, language, value, onChange }: Props) {
  const palette = sectionPalettes[question.section] ?? sectionPalettes.visual;
  const selectedIndex = value ? Math.max(0, Math.min(4, Number(value) - 1)) : -1;
  const selectedOption = selectedIndex >= 0 ? question.options[selectedIndex] : undefined;
  const isRtl = language === "ar";
  const markerPosition = selectedIndex >= 0 ? ((selectedIndex + 0.5) / 5) * 100 : 50;
  const markerLeft = selectedIndex >= 0 ? `${isRtl ? 100 - markerPosition : markerPosition}%` : "50%";
  const draggingRef = useRef(false);

  const style = {
    "--scale-start": palette.start,
    "--scale-mid": palette.mid,
    "--scale-end": palette.end,
    "--scale-ink": palette.ink,
    "--marker-left": markerLeft,
  } as CSSProperties;

  function chooseIndex(index: number) {
    const next = Math.max(0, Math.min(4, index));
    onChange(String(next + 1));
  }

  function chooseFromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(0.999999, (event.clientX - rect.left) / rect.width));
    const visualIndex = Math.min(4, Math.floor(ratio * 5));
    chooseIndex(isRtl ? 4 - visualIndex : visualIndex);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    chooseFromPointer(event);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    chooseFromPointer(event);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (draggingRef.current) chooseFromPointer(event);
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End", "1", "2", "3", "4", "5"].includes(event.key)) return;
    event.preventDefault();
    let next = selectedIndex >= 0 ? selectedIndex : 2;
    if (event.key === "ArrowLeft") next = isRtl ? Math.min(4, next + 1) : Math.max(0, next - 1);
    if (event.key === "ArrowRight") next = isRtl ? Math.max(0, next - 1) : Math.min(4, next + 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 4;
    if (/^[1-5]$/.test(event.key)) next = Number(event.key) - 1;
    chooseIndex(next);
  }

  return (
    <div className="segmented-scale-v21 segmented-scale-v20" style={style}>
      <div className="segmented-scale-v20__head">
        <span className="segmented-scale-v20__section">{palette.label[language]}</span>
        <strong className={`segmented-scale-v20__selected ${selectedOption ? "has-value" : ""}`}>
          {selectedOption
            ? `${selectedOption.value} · ${selectedOption.label[language]}`
            : (language === "ar" ? "اختر إجابة" : "Select one")}
        </strong>
      </div>

      <div
        className="segmented-scale-v20__control"
        role="slider"
        tabIndex={0}
        aria-label={question.label[language]}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={selectedIndex >= 0 ? selectedIndex + 1 : undefined}
        aria-valuetext={selectedOption?.label[language]}
        onKeyDown={handleKeyDown}
      >
        <div className="segmented-scale-v20__labels" aria-hidden="true">
          {question.options.map((option) => <span key={option.value}>{option.label[language]}</span>)}
        </div>

        <div
          className="segmented-scale-v20__bar-wrap"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-hidden="true"
        >
          <div className="segmented-scale-v20__bar">
            {question.options.map((option, index) => <span key={option.value} className={`shade-${index + 1}`} />)}
          </div>
          {selectedIndex >= 0 && (
            <span className="segmented-scale-v20__marker">
              {selectedIndex + 1}
            </span>
          )}
        </div>

        <div className="segmented-scale-v20__choices" role="radiogroup" aria-label={language === "ar" ? "خيارات الإجابة" : "Response choices"}>
          {question.options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              className={value === option.value ? "is-selected" : ""}
              onClick={() => chooseIndex(index)}
            >
              <b>{option.value}</b>
              <span>{option.label[language]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="segmented-scale-v20__hint">
        {language === "ar"
          ? "اسحب المؤشر، أو اضغط على أي موضع في الشريط، أو اختر الإجابة مباشرة. يتوقف المؤشر تلقائياً عند إحدى القيم الخمس."
          : "Drag the marker, tap anywhere on the bar, or choose a response directly. The marker snaps automatically to one of the five values."}
      </p>
    </div>
  );
}
