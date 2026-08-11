"use client";

import type { Language, Trail, TrailImage } from "@/types/questionnaire";

export function TrailQuestion({ language, trails, images, value, onChange }: { language: Language; trails: Trail[]; images: TrailImage[]; value?: string; onChange: (value: string) => void }) {
  return (
    <div className="route-selection-shell">
      <div className="route-selection-header">
        <p>{language === "ar" ? "المسارات الثلاثة المعتمدة" : "Three study routes"}</p>
        <h3>{language === "ar" ? "اختر المسار الذي مشيت فيه" : "Choose the route you walked"}</h3>
      </div>
      <div className="route-card-grid">
        {trails.map((trail) => {
          const image = images.find((item) => item.trailId === trail.id);
          const selected = value === trail.id;
          return (
            <button key={trail.id} type="button" className={`route-card ${selected ? "is-selected" : ""}`} onClick={() => onChange(trail.id)} aria-label={`${trail.name[language]} — ${trail.descriptor[language]}`}>
              {image && <img src={image.src} alt={trail.name[language]} className="route-card__image" />}
              <div className="route-card__scrim" />
              <div className="route-card__content">
                <span className="route-card__eyebrow">{language === "ar" ? "مسار الدراسة" : "Study route"}</span>
                <strong>{trail.name[language]}</strong>
                <small>{trail.descriptor[language]}</small>
              </div>
              {selected && <span className="route-card__status">{language === "ar" ? "✓ تم الاختيار" : "✓ Selected"}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
