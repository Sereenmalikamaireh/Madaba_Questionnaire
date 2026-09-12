"use client";

import { useRef } from "react";
import type { FeatureMarker, Language, Trail, TrailImage } from "@/types/questionnaire";

export function ImageFeatureTask({
  language,
  trail,
  image,
  markers,
  onAddMarker,
  onClearMarkers,
}: {
  language: Language;
  trail: Trail;
  image: TrailImage;
  markers: FeatureMarker[];
  onAddMarker: (x: number, y: number) => void;
  onClearMarkers: () => void;
}) {
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
    <section className="task-card image-click-task">
      <div className="task-header image-click-task__header">
        <p className="eyebrow">{language === "ar" ? "مهمة صورة المسار" : "Trail image task"}</p>
        <h1>{language === "ar" ? "حدّد ثلاث نقاط على الصورة" : "Mark three points on the image"}</h1>
        <p>{language === "ar"
          ? `هذه صورة ${trail.name.ar}. اضغط على الصورة لتحديد ثلاث نقاط فقط أثّرت في تجربتك. لا يلزم إدخال أي وصف أو تصنيف.`
          : `This is ${trail.name.en}. Click the image to mark exactly three points that influenced your experience. No description or category is required.`}</p>
      </div>

      <div className="image-click-task__status">
        <strong>{language === "ar" ? `${markers.length} من 3 نقاط` : `${markers.length} of 3 points marked`}</strong>
        {markers.length > 0 && <button type="button" className="secondary-button compact-button" onClick={onClearMarkers}>{language === "ar" ? "مسح النقاط" : "Clear points"}</button>}
      </div>

      <div className="image-click-stage" onPointerDown={handlePointer}>
        <img ref={imageRef} src={image.src} alt={trail.name[language]} draggable={false} />
        {markers.map((marker, index) => (
          <span key={marker.id} className="image-click-marker" style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }} aria-label={`${language === "ar" ? "النقطة" : "Point"} ${index + 1}`}>
            {index + 1}
          </span>
        ))}
      </div>
      <p className="image-click-task__hint">{markers.length < 3
        ? (language === "ar" ? `حدّد ${3 - markers.length} نقطة إضافية.` : `Mark ${3 - markers.length} more point${3 - markers.length === 1 ? "" : "s"}.`)
        : (language === "ar" ? "تم تحديد النقاط الثلاث. يمكنك الآن إرسال الاستبيان." : "All three points are marked. You can now submit the questionnaire.")}</p>
    </section>
  );
}
