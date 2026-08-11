"use client";

import { useRef } from "react";
import type { FeatureMarker, FeatureTag, Language, Trail, TrailImage } from "@/types/questionnaire";

const tagLabels: Record<FeatureTag, { en: string; ar: string }> = {
  visual_character: { en: "Visual character", ar: "الطابع البصري" },
  sound_source: { en: "Sound source", ar: "مصدر صوتي" },
  smell_source: { en: "Smell source", ar: "مصدر شمي" },
  materials_textures: { en: "Materials / texture", ar: "المواد / الملمس" },
  history_memory: { en: "History / memory", ar: "التاريخ / الذاكرة" },
  cultural_identity: { en: "Cultural identity", ar: "الهوية الثقافية" },
  safety: { en: "Safety", ar: "الأمان" },
  activity_atmosphere: { en: "Activity / atmosphere", ar: "النشاط / الأجواء" },
};

export function ImageFeatureTask({
  language,
  trail,
  image,
  markers,
  activeMarkerId,
  dominantMarkerId,
  onAddMarker,
  onActivateMarker,
  onRemoveMarker,
  onTagMarker,
  onSetDominant,
}: {
  language: Language;
  trail: Trail;
  image: TrailImage;
  markers: FeatureMarker[];
  activeMarkerId: string | null;
  dominantMarkerId: string | null;
  onAddMarker: (x: number, y: number) => void;
  onActivateMarker: (id: string) => void;
  onRemoveMarker: (id: string) => void;
  onTagMarker: (id: string, tag: FeatureTag) => void;
  onSetDominant: (id: string) => void;
}) {
  const activeMarker = markers.find((marker) => marker.id === activeMarkerId) ?? markers[markers.length - 1] ?? null;
  const imageRef = useRef<HTMLImageElement | null>(null);

  function handlePointer(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageRef.current || markers.length >= 3) return;
    const rect = imageRef.current.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    onAddMarker(Number(x.toFixed(5)), Number(y.toFixed(5)));
  }

  return (
    <section className="task-card feature-task-card">
      <div className="task-header">
        <p className="eyebrow">{language === "ar" ? "شارعك" : "Your street"}</p>
        <h1>{language === "ar" ? "اختر العناصر التي أثّرت في تجربتك" : "Choose the elements that influenced your experience"}</h1>
        <p>{language === "ar" ? `هذه صورة المسار الذي اخترته: ${trail.name.ar}. المس الصورة لوضع ما يصل إلى 3 علامات، ثم حدّد سبب أهمية كل عنصر.` : `This is the route you selected: ${trail.name.en}. Touch the image to place up to 3 markers, then identify what made each element important.`}</p>
      </div>

      <div className="feature-layout">
        <div className="feature-image-stage">
          <div className="feature-image-wrap" onPointerDown={handlePointer}>
            <img ref={imageRef} src={image.src} alt={trail.name[language]} draggable={false} />
            {markers.map((marker, index) => (
              <button key={marker.id} type="button" className={`feature-marker ${activeMarker?.id === marker.id ? "is-active" : ""} ${dominantMarkerId === marker.id ? "is-dominant" : ""}`} style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onActivateMarker(marker.id); }}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="feature-panel">
          <div className="feature-panel__section">
            <strong>{language === "ar" ? "العلامات الموضوعة" : "Placed markers"}</strong>
            <p>{language === "ar" ? `يمكنك وضع حتى 3 علامات. المتبقي: ${Math.max(0, 3 - markers.length)}` : `You can place up to 3 markers. Remaining: ${Math.max(0, 3 - markers.length)}`}</p>
            <div className="feature-points-list">
              {markers.map((marker, index) => (
                <span key={marker.id} className={activeMarker?.id === marker.id ? "is-active" : ""}>
                  <button type="button" onClick={() => onActivateMarker(marker.id)}>#{index + 1} {marker.tag ? tagLabels[marker.tag][language] : (language === "ar" ? "بدون تصنيف" : "Unassigned")}</button>
                  <button type="button" className="feature-point-remove" onClick={() => onRemoveMarker(marker.id)}>×</button>
                </span>
              ))}
            </div>
          </div>

          {activeMarker && (
            <div className="feature-panel__section">
              <strong>{language === "ar" ? "ما الذي يمثله هذا العنصر؟" : "What does this element represent?"}</strong>
              <div className="meaning-grid">
                {(Object.entries(tagLabels) as Array<[FeatureTag, { en: string; ar: string }]>).map(([tag, label]) => (
                  <button key={tag} type="button" className={activeMarker.tag === tag ? "is-selected" : ""} onClick={() => onTagMarker(activeMarker.id, tag)}>
                    {label[language]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {markers.length > 0 && (
            <div className="feature-panel__section">
              <strong>{language === "ar" ? "أي عنصر كان الأكثر تأثيراً؟" : "Which element was most influential overall?"}</strong>
              <div className="dominant-grid">
                {markers.map((marker, index) => (
                  <button key={marker.id} type="button" className={dominantMarkerId === marker.id ? "is-selected" : ""} onClick={() => onSetDominant(marker.id)}>
                    #{index + 1} {marker.tag ? tagLabels[marker.tag][language] : (language === "ar" ? "عنصر" : "Element")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
