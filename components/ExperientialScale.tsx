"use client";

import { useRef } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import type { Language, Question } from "@/types/questionnaire";

type Props = {
  question: Question;
  language: Language;
  value?: string;
  onChange: (value: string) => void;
};

export function ExperientialScale({ question, language, value, onChange }: Props) {
  const isRtl = language === "ar";
  const selectedIndex = value ? Math.max(0, Math.min(4, Number(value) - 1)) : -1;
  const draggingRef = useRef(false);

  function chooseIndex(index: number) {
    onChange(String(Math.max(0, Math.min(4, index)) + 1));
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
    if (draggingRef.current) chooseFromPointer(event);
  }
  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (draggingRef.current) chooseFromPointer(event);
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
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
    <div className="compact-likert-control">
      <div
        className="compact-likert-slider"
        role="slider"
        tabIndex={0}
        aria-label={question.label[language]}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={selectedIndex >= 0 ? selectedIndex + 1 : undefined}
        aria-valuetext={selectedIndex >= 0 ? question.options[selectedIndex]?.label[language] : undefined}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {question.options.map((option, index) => (
          <span key={option.value} className={`compact-likert-segment shade-${index + 1} ${value === option.value ? "is-selected" : ""}`}>
            <b>{option.value}</b>
          </span>
        ))}
      </div>
      <div className={`compact-likert-selected ${selectedIndex >= 0 ? "has-value" : ""}`} aria-live="polite">
        {selectedIndex >= 0 ? question.options[selectedIndex]?.label[language] : (language === "ar" ? "اختر إجابة" : "Select a response")}
      </div>
    </div>
  );
}
