"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { conditionalFoodQuestionIds, questions, STORAGE_KEY, STUDY_VERSION, trails, trailImages } from "@/config/study";
import { ChoiceQuestion } from "@/components/ChoiceQuestion";
import { ExperientialScale } from "@/components/ExperientialScale";
import { StageProgress, type JourneyStage } from "@/components/StageProgress";
import { TrailQuestion } from "@/components/TrailQuestion";
import { ImageFeatureTask } from "@/components/ImageFeatureTask";
import { buildSubmissionPayload } from "@/lib/payload";
import { flushQueue, getQueuedPayloads, postPayload, queuePayload, removeQueuedPayload } from "@/lib/offlineQueue";
import type { FeatureMarker, FeatureTag, Language, QuestionTheme } from "@/types/questionnaire";

const FINAL_V22_RUNTIME_MARKER = "FINAL_V22_RUNTIME_MARKER";
void FINAL_V22_RUNTIME_MARKER;

type Stage = "start" | "language" | "consent" | "survey" | "image" | "feedback" | "complete";
type SaveStatus = "idle" | "saving" | "saved" | "queued" | "error";

type SavedSession = {
  stage: Stage;
  language: Language;
  consentAccepted: boolean;
  submissionId: string;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  answeredAt: Record<string, string>;
  responseMs: Record<string, number>;
  timestamps: Record<string, string>;
  featureMarkers: FeatureMarker[];
  activeMarkerId: string | null;
  dominantMarkerId: string | null;
};

const themeMeta: Record<QuestionTheme, { icon: string; kicker: { en: string; ar: string }; prompt: { en: string; ar: string } }> = {
  profile: { icon: "⌖", kicker: { en: "About you", ar: "عنك" }, prompt: { en: "Instructions and field record", ar: "التعليمات والسجل الميداني" } },
  visual: { icon: "◉", kicker: { en: "Visual experience", ar: "التجربة البصرية" }, prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." } },
  auditory: { icon: "≈", kicker: { en: "Auditory experience", ar: "التجربة السمعية" }, prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." } },
  olfactory: { icon: "∿", kicker: { en: "Olfactory experience", ar: "التجربة الشمية" }, prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." } },
  tactile: { icon: "▦", kicker: { en: "Tactile / walking surface", ar: "اللمس / سطح المشي" }, prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." } },
  gustatory: { icon: "◌", kicker: { en: "Food and drink", ar: "الطعام والشراب" }, prompt: { en: "Answer about opportunities or food/drink encountered on this trail today.", ar: "أجب عن فرص أو تجارب الطعام والشراب على هذا المسار اليوم." } },
  contextual: { icon: "☼", kicker: { en: "Contextual conditions", ar: "الظروف السياقية" }, prompt: { en: "Context only · not Fuzzy-AHP weighted.", ar: "للسياق فقط · غير مُرجّح ضمن Fuzzy-AHP." } },
  satisfaction: { icon: "✓", kicker: { en: "Satisfaction", ar: "الرضا" }, prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." } },
  memory: { icon: "◇", kicker: { en: "Memory", ar: "الذاكرة" }, prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." } },
  security: { icon: "⌂", kicker: { en: "Perceived security", ar: "الأمان المدرك" }, prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." } },
  identity: { icon: "◫", kicker: { en: "Heritage identity resonance", ar: "صدى الهوية التراثية" }, prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." } },
  place_identity: { icon: "◆", kicker: { en: "Place identity", ar: "هوية المكان" }, prompt: { en: "Think about what this trail means to you.", ar: "فكّر فيما يعنيه هذا المسار بالنسبة لك." } },
  place_dependence: { icon: "↔", kicker: { en: "Place dependence", ar: "الاعتماد على المكان" }, prompt: { en: "Think about how well this trail supports the activities you want to do here.", ar: "فكّر في مدى ملاءمة هذا المسار للأنشطة التي تريد القيام بها هنا." } },
};

function nowIso() { return new Date().toISOString(); }

function journeyForSection(section: string): JourneyStage {
  if (section === "profile") return "about";
  if (["visual", "auditory", "olfactory", "tactile", "gustatory"].includes(section)) return "sensory";
  if (section === "contextual") return "context";
  if (["satisfaction", "memory", "security", "identity"].includes(section)) return "psychological";
  if (["place_identity", "place_dependence"].includes(section)) return "attachment";
  return "about";
}

function scoreValue(value?: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mean(values: Array<number | null>) {
  const valid = values.filter((value): value is number => value !== null);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<Stage>("start");
  const [language, setLanguage] = useState<Language>("en");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredAt, setAnsweredAt] = useState<Record<string, string>>({});
  const [responseMs, setResponseMs] = useState<Record<string, number>>({});
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const [featureMarkers, setFeatureMarkers] = useState<FeatureMarker[]>([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [dominantMarkerId, setDominantMarkerId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const questionStartedAtRef = useRef(Date.now());
  const feedbackStartedAtRef = useRef(Date.now());

  const visibleQuestions = useMemo(
    () => questions.filter((question) => !(conditionalFoodQuestionIds.has(question.id) && answers.G_CONSUMED !== "yes")),
    [answers.G_CONSUMED]
  );
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const selectedTrail = trails.find((trail) => trail.id === answers.P1);
  const selectedTrailImage = trailImages.find((image) => image.trailId === answers.P1);
  const isArabic = language === "ar";
  const t = (en: string, ar: string) => isArabic ? ar : en;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedSession;
        setStage(saved.stage ?? "start");
        setLanguage(saved.language ?? "en");
        setConsentAccepted(saved.consentAccepted ?? false);
        setSubmissionId(saved.submissionId || crypto.randomUUID());
        setCurrentQuestionIndex(saved.currentQuestionIndex ?? 0);
        setAnswers(saved.answers ?? {});
        setAnsweredAt(saved.answeredAt ?? {});
        setResponseMs(saved.responseMs ?? {});
        setTimestamps(saved.timestamps ?? {});
        setFeatureMarkers(saved.featureMarkers ?? []);
        setActiveMarkerId(saved.activeMarkerId ?? null);
        setDominantMarkerId(saved.dominantMarkerId ?? null);
      } else setSubmissionId(crypto.randomUUID());
    } catch { setSubmissionId(crypto.randomUUID()); }
    finally { setHydrated(true); }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (currentQuestionIndex >= visibleQuestions.length) setCurrentQuestionIndex(Math.max(0, visibleQuestions.length - 1));
  }, [hydrated, currentQuestionIndex, visibleQuestions.length]);

  useEffect(() => {
    if (!hydrated) return;
    const saved: SavedSession = { stage, language, consentAccepted, submissionId, currentQuestionIndex, answers, answeredAt, responseMs, timestamps, featureMarkers, activeMarkerId, dominantMarkerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [hydrated, stage, language, consentAccepted, submissionId, currentQuestionIndex, answers, answeredAt, responseMs, timestamps, featureMarkers, activeMarkerId, dominantMarkerId]);

  useEffect(() => {
    if (!hydrated) return;
    const persistBeforeLeave = () => {
      const saved: SavedSession = { stage, language, consentAccepted, submissionId, currentQuestionIndex, answers, answeredAt, responseMs, timestamps, featureMarkers, activeMarkerId, dominantMarkerId };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* best-effort local persistence */ }
    };
    window.addEventListener("pagehide", persistBeforeLeave);
    window.addEventListener("beforeunload", persistBeforeLeave);
    return () => {
      window.removeEventListener("pagehide", persistBeforeLeave);
      window.removeEventListener("beforeunload", persistBeforeLeave);
    };
  }, [hydrated, stage, language, consentAccepted, submissionId, currentQuestionIndex, answers, answeredAt, responseMs, timestamps, featureMarkers, activeMarkerId, dominantMarkerId]);

  useEffect(() => { questionStartedAtRef.current = Date.now(); }, [stage, currentQuestionIndex]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    async function refreshQueue() {
      try { const queued = await getQueuedPayloads(); if (!cancelled) setQueueCount(queued.length); } catch { /* ignore */ }
    }
    void refreshQueue();
    const handleOnline = async () => {
      try {
        const result = await flushQueue();
        if (!cancelled) {
          setQueueCount(result.remaining);
          if (result.synced > 0) setSaveMessage(t(`${result.synced} queued record(s) synchronized.`, `تمت مزامنة ${result.synced} سجل/سجلات معلّقة.`));
        }
      } catch { /* keep queued */ }
    };
    window.addEventListener("online", handleOnline);
    if (navigator.onLine) void handleOnline();
    return () => { cancelled = true; window.removeEventListener("online", handleOnline); };
  }, [hydrated, language]);

  function mark(name: string, at = nowIso()) { setTimestamps((previous) => ({ ...previous, [name]: previous[name] ?? at })); }

  function recordAnswer(questionId: string, value: string) {
    setAnswers((previous) => {
      const next = { ...previous, [questionId]: value };
      if (questionId === "G_CONSUMED" && value === "no") {
        for (const id of conditionalFoodQuestionIds) delete next[id];
      }
      return next;
    });
    setAnsweredAt((previous) => {
      const next = { ...previous, [questionId]: nowIso() };
      if (questionId === "G_CONSUMED" && value === "no") {
        for (const id of conditionalFoodQuestionIds) delete next[id];
      }
      return next;
    });
    if (questionId === "G_CONSUMED" && value === "no") {
      setResponseMs((previous) => {
        const next = { ...previous };
        for (const id of conditionalFoodQuestionIds) delete next[id];
        return next;
      });
    }
  }

  function goNextQuestion() {
    if (!currentQuestion || !answers[currentQuestion.id]) return;
    setResponseMs((previous) => ({ ...previous, [currentQuestion.id]: Math.max(0, Date.now() - questionStartedAtRef.current) }));
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex((previous) => previous + 1);
      return;
    }
    const now = nowIso();
    setTimestamps((previous) => ({ ...previous, core_completed_at: previous.core_completed_at ?? now }));
    setSaveStatus("idle");
    if (selectedTrail && selectedTrailImage) setStage("image");
    else {
      feedbackStartedAtRef.current = Date.now();
      setStage("feedback");
    }
  }

  function addFeatureMarker(x: number, y: number) {
    setFeatureMarkers((previous) => {
      if (previous.length >= 3) return previous;
      const marker = { id: crypto.randomUUID(), x, y } satisfies FeatureMarker;
      setActiveMarkerId(marker.id);
      return [...previous, marker];
    });
  }

  function removeFeatureMarker(id: string) {
    setFeatureMarkers((previous) => previous.filter((marker) => marker.id !== id));
    setActiveMarkerId((previous) => previous === id ? null : previous);
    setDominantMarkerId((previous) => previous === id ? null : previous);
  }

  function tagFeatureMarker(id: string, tag: FeatureTag) {
    setFeatureMarkers((previous) => previous.map((marker) => marker.id === id ? { ...marker, tag } : marker));
  }

  function finishImageTask() {
    const now = nowIso();
    setTimestamps((previous) => ({ ...previous, image_completed_at: previous.image_completed_at ?? now, feedback_started_at: previous.feedback_started_at ?? now }));
    feedbackStartedAtRef.current = Date.now();
    setStage("feedback");
  }

  function finishFeedback() {
    const now = nowIso();
    const feedback = answers.OPEN1?.trim() ?? "";
    if (feedback) {
      setAnsweredAt((previous) => ({ ...previous, OPEN1: previous.OPEN1 ?? now }));
      setResponseMs((previous) => ({ ...previous, OPEN1: previous.OPEN1 ?? Math.max(0, Date.now() - feedbackStartedAtRef.current) }));
    }
    setTimestamps((previous) => ({ ...previous, feedback_completed_at: previous.feedback_completed_at ?? now, completed_at: previous.completed_at ?? now }));
    setSaveStatus("idle");
    setStage("complete");
  }

  async function persistSubmission() {
    if (!submissionId || saveStatus === "saving" || saveStatus === "saved" || saveStatus === "queued") return;
    setSaveStatus("saving");
    const payload = buildSubmissionPayload({ submissionId, language, selectedTrailId: answers.P1 ?? "", answers, answeredAt, responseMs, timestamps, featureMarkers, dominantMarkerId });
    try {
      await postPayload(payload);
      await removeQueuedPayload(submissionId).catch(() => undefined);
      setSaveStatus("saved");
      setSaveMessage(t("Responses saved securely.", "تم حفظ الإجابات بأمان."));
      setQueueCount((await getQueuedPayloads().catch(() => [])).length);
    } catch (networkError) {
      try {
        await queuePayload(submissionId, payload);
        setSaveStatus("queued");
        setSaveMessage(t("No reliable connection. The completed questionnaire is stored on this device and will synchronize when online.", "لا يوجد اتصال موثوق. تم حفظ الاستبيان المكتمل على هذا الجهاز وسيتم مزامنته عند توفر الاتصال."));
        setQueueCount((await getQueuedPayloads()).length);
      } catch (queueError) {
        setSaveStatus("error");
        setSaveMessage(`${networkError instanceof Error ? networkError.message : String(networkError)} | ${queueError instanceof Error ? queueError.message : String(queueError)}`);
      }
    }
  }

  useEffect(() => {
    if (stage === "complete" && hydrated && saveStatus === "idle") void persistSubmission();
  }, [stage, hydrated, saveStatus]);

  function resetSession() {
    localStorage.removeItem(STORAGE_KEY);
    setStage("start");
    setLanguage("en");
    setConsentAccepted(false);
    setSubmissionId(crypto.randomUUID());
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAnsweredAt({});
    setResponseMs({});
    setTimestamps({});
    setFeatureMarkers([]);
    setActiveMarkerId(null);
    setDominantMarkerId(null);
    setSaveStatus("idle");
    setSaveMessage("");
    setResetConfirmOpen(false);
  }

  function renderTopBar() {
    const percent = stage === "survey"
      ? Math.round(((currentQuestionIndex + 1) / (visibleQuestions.length + 1)) * 100)
      : stage === "image" ? 95 : stage === "feedback" ? 99 : stage === "complete" ? 100 : 0;
    const activeStage: JourneyStage = stage === "feedback" || stage === "complete"
      ? "feedback"
      : stage === "image"
        ? "street"
        : journeyForSection(currentQuestion?.section ?? "profile");
    return <header className="topbar"><div className="topbar__inner">
      <div className="brand"><span className="brand__mark">M</span><span><b>MPA-Index</b><small>{t("Madaba Heritage Walking Trails", "مسارات مادبا التراثية")}</small></span></div>
      {(stage === "survey" || stage === "image" || stage === "feedback" || stage === "complete") && <div className="topbar__progress"><StageProgress language={language} active={activeStage} percent={percent} /></div>}
      <div className="topbar__actions"><span className="final-build-badge">THESIS QUESTIONNAIRE · FINAL v22</span>{queueCount > 0 && <span className="queue-pill">{queueCount} ⟳</span>}{stage !== "start" && <button type="button" className="reset-session-button" onClick={() => setResetConfirmOpen(true)}>{t("Reset", "إعادة البدء")}</button>}<button type="button" className="language-button" onClick={() => setLanguage((previous) => previous === "en" ? "ar" : "en")}>{language === "en" ? "العربية" : "English"}</button></div>
    </div></header>;
  }

  function renderSurvey() {
    if (!currentQuestion) return null;
    const meta = themeMeta[currentQuestion.theme];
    const value = answers[currentQuestion.id];
    return <section className={`question-card experiential-question theme-${currentQuestion.theme}`}>
      <div className="question-card__heading">
        <span className="question-card__icon">{meta.icon}</span>
        <div>
          <p className="eyebrow">{meta.kicker[language]}{currentQuestion.displayCode ? ` · ${currentQuestion.displayCode}` : ""}</p>
          <p className="question-counter">{t(`Item ${currentQuestionIndex + 1} of ${visibleQuestions.length}`, `البند ${currentQuestionIndex + 1} من ${visibleQuestions.length}`)}</p>
        </div>
      </div>
      <p className="question-prompt">{meta.prompt[language]}</p>
      <h1>{currentQuestion.label[language]}</h1>
      {currentQuestion.helper && <p className="question-helper">{currentQuestion.helper[language]}</p>}
      <div className="question-control">
        {currentQuestion.id === "P1"
          ? <TrailQuestion language={language} trails={trails} images={trailImages} value={value} onChange={(next) => recordAnswer(currentQuestion.id, next)} />
          : currentQuestion.type === "likert"
            ? <ExperientialScale question={currentQuestion} language={language} value={value} onChange={(next) => recordAnswer(currentQuestion.id, next)} />
            : <ChoiceQuestion question={currentQuestion} language={language} value={value} onChange={(next) => recordAnswer(currentQuestion.id, next)} />}
      </div>
      <div className="question-nav">
        <button type="button" className="secondary-button" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex((previous) => Math.max(0, previous - 1))}>{t("Back", "رجوع")}</button>
        <button type="button" className="primary-button" disabled={!value} onClick={goNextQuestion}>{currentQuestionIndex === visibleQuestions.length - 1 ? t("Continue to image task", "المتابعة إلى مهمة الصورة") : t("Continue", "متابعة")}</button>
      </div>
    </section>;
  }

  function renderImageStage() {
    if (!selectedTrail || !selectedTrailImage) return null;
    const allAssigned = featureMarkers.length > 0 && featureMarkers.every((marker) => Boolean(marker.tag));
    const canFinish = allAssigned && Boolean(dominantMarkerId);
    return <>
      <ImageFeatureTask language={language} trail={selectedTrail} image={selectedTrailImage} markers={featureMarkers} activeMarkerId={activeMarkerId} dominantMarkerId={dominantMarkerId} onAddMarker={addFeatureMarker} onActivateMarker={setActiveMarkerId} onRemoveMarker={removeFeatureMarker} onTagMarker={tagFeatureMarker} onSetDominant={setDominantMarkerId} />
      <div className="task-card narrow-task"><div className="task-footer">
        <span>{t("Add at least one element, assign each a meaning, then choose the most influential one.", "أضف عنصراً واحداً على الأقل، وحدد معنى كل عنصر، ثم اختر الأكثر تأثيراً.")}</span>
        <button type="button" className="secondary-button" onClick={() => { setCurrentQuestionIndex(visibleQuestions.length - 1); setStage("survey"); }}>{t("Back to last question", "العودة إلى آخر سؤال")}</button>
        <button type="button" className="primary-button" disabled={!canFinish} onClick={finishImageTask}>{t("Continue to final feedback", "المتابعة إلى الملاحظات النهائية")}</button>
      </div></div>
    </>;
  }

  function renderFeedbackStage() {
    const value = answers.OPEN1 ?? "";
    return <section className="question-card feedback-card theme-feedback">
      <div className="question-card__heading">
        <span className="question-card__icon">✎</span>
        <div>
          <p className="eyebrow">{t("Final feedback · Open-ended", "ملاحظات نهائية · سؤال مفتوح")}</p>
          <p className="question-counter">{t("Optional final question", "سؤال نهائي اختياري")}</p>
        </div>
      </div>
      <p className="question-prompt">{t("Your comments can help improve the questionnaire before wider use.", "يمكن أن تساعد ملاحظاتك في تحسين الاستبيان قبل استخدامه على نطاق أوسع.")}</p>
      <h1>{t(
        "Based on your experience completing this questionnaire, were any questions, instructions, or response options unclear, difficult, repetitive, irrelevant, or missing? Please describe any changes or additions you recommend.",
        "بناءً على تجربتك في إكمال هذا الاستبيان، هل كانت أي أسئلة أو تعليمات أو خيارات إجابة غير واضحة، أو صعبة، أو متكررة، أو غير ذات صلة، أو هل شعرت بأن شيئاً ما كان مفقوداً؟ يرجى وصف أي تعديلات أو إضافات تقترحها."
      )}</h1>
      <p className="question-helper">{t("This question is optional. You may leave it blank and submit the questionnaire.", "هذا السؤال اختياري. يمكنك تركه فارغاً وإرسال الاستبيان.")}</p>
      <div className="open-feedback-wrap">
        <textarea
          className="open-feedback-textarea"
          value={value}
          maxLength={3000}
          rows={8}
          placeholder={t("Write your comments or recommendations here…", "اكتب ملاحظاتك أو توصياتك هنا…")}
          onFocus={() => { if (!timestamps.feedback_started_at) mark("feedback_started_at"); }}
          onChange={(event) => recordAnswer("OPEN1", event.target.value)}
          aria-label={t("Final questionnaire feedback", "الملاحظات النهائية حول الاستبيان")}
        />
        <div className="open-feedback-meta">
          <span>{t("Optional", "اختياري")}</span>
          <span>{value.length}/3000</span>
        </div>
      </div>
      <div className="question-nav">
        <button type="button" className="secondary-button" onClick={() => {
          if (selectedTrail && selectedTrailImage) setStage("image");
          else { setCurrentQuestionIndex(visibleQuestions.length - 1); setStage("survey"); }
        }}>{t("Back", "رجوع")}</button>
        <button type="button" className="primary-button" onClick={finishFeedback}>{t("Submit questionnaire", "إرسال الاستبيان")}</button>
      </div>
    </section>;
  }

  function renderSummary() {
    const rows = [
      { label: t("Visual experience", "التجربة البصرية"), value: mean(["V1","V2","V3","V4","V5","V6"].map((id) => scoreValue(answers[id]))) },
      { label: t("Auditory experience", "التجربة السمعية"), value: mean(["AUD1","AUD2","AUD3","AUD4","AUD5","AUD6"].map((id) => scoreValue(answers[id]))) },
      { label: t("Olfactory experience", "التجربة الشمية"), value: mean(["O1","O2","O3","O4"].map((id) => scoreValue(answers[id]))) },
      { label: t("Tactile / walking surface", "اللمس / سطح المشي"), value: mean(["T1","T2","T3","T4","T5"].map((id) => scoreValue(answers[id]))) },
      { label: t("Satisfaction", "الرضا"), value: mean(["SAT1","SAT2"].map((id) => scoreValue(answers[id]))) },
      { label: t("Place attachment", "الارتباط بالمكان"), value: mean(["PI1","PI2","PI3","PD1","PD2","PD3"].map((id) => scoreValue(answers[id]))) },
    ];
    return <div className="participant-summary"><div className="summary-heading"><div><p className="eyebrow">{t("Your responses at a glance", "نظرة سريعة على إجاباتك")}</p><h2>{selectedTrail?.name[language] ?? t("Your Madaba walk", "جولتك في مادبا")}</h2></div><span className="summary-note">{t("Descriptive only · not an assessment score", "وصفي فقط · ليس نتيجة تقييم")}</span></div><div className="summary-bars">{rows.map((row) => <div className="summary-row" key={row.label}><span>{row.label}</span><div><i style={{ width: `${((row.value ?? 0) / 5) * 100}%` }} /></div><b>{row.value ? row.value.toFixed(1) : "—"}/5</b></div>)}</div>{featureMarkers.length > 0 && <p className="summary-note">{t(`${featureMarkers.length} influential street element(s) were marked.`, `تم تحديد ${featureMarkers.length} عنصر/عناصر مؤثرة في الشارع.`)}</p>}</div>;
  }

  if (!hydrated) return <main className="loading-screen">MPA-Index</main>;

  return <div dir={isArabic ? "rtl" : "ltr"} lang={language} className="app-shell">{renderTopBar()}<main className="main-area">
    {stage === "start" && <section className="hero-card hero-card--v7"><div className="hero-card__content"><p className="eyebrow">MPA-Index · Field Questionnaire</p><h1>{t("Multisensory Perception, Psychological Mediators & Place Attachment", "الإدراك متعدد الحواس والوسائط النفسية والارتباط بالمكان")}</h1><p>{t("A field questionnaire about Madaba's heritage walking trails. Think only about the trail or trail segment you have just experienced.", "استبيان ميداني حول مسارات المشي التراثية في مادبا. فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو.")}</p><div className="hero-chips"><span>3 {t("study trails", "مسارات للدراسة")}</span><span>{t("Conditional food/drink block", "قسم شرطي للطعام والشراب")}</span><span>{t("Street image task", "مهمة صورة الشارع")}</span><span>{t("Optional final feedback", "ملاحظات نهائية اختيارية")}</span><span>{t("Refresh-safe progress", "يحفظ التقدم عند التحديث")}</span></div><button className="primary-button hero-button" type="button" onClick={() => { mark("started_at"); setStage("language"); }}>{t("Begin", "ابدأ")}</button></div><div className="hero-card__media"><figure className="hero-photo-frame"><img src="/hero-madaba-sharp.jpg" alt={t("Madaba heritage walking street", "شارع مشي تراثي في مادبا")} /><figcaption><span>{t("Madaba heritage walking environment", "بيئة مشي تراثية في مادبا")}</span><b>MPA · INDEX</b></figcaption></figure></div></section>}
    {stage === "language" && <section className="simple-card"><p className="eyebrow">Language · اللغة</p><h1>{t("Choose your questionnaire language", "اختر لغة الاستبيان")}</h1><div className="language-choice"><button type="button" onClick={() => { setLanguage("en"); setStage("consent"); }}>English<span>Continue in English →</span></button><button type="button" onClick={() => { setLanguage("ar"); setStage("consent"); }}>العربية<span>المتابعة باللغة العربية ←</span></button></div></section>}
    {stage === "consent" && <section className="simple-card consent-card"><p className="eyebrow">{t("Eligibility and consent", "الأهلية والموافقة")}</p><h1>{t("Before you begin", "قبل أن تبدأ")}</h1><div className="consent-copy"><p>{t("Complete this questionnaire only if you are 18 years or older and have walked on this trail for at least 10 minutes today. Participation is voluntary and anonymous.", "أكمل هذا الاستبيان فقط إذا كان عمرك 18 عاماً أو أكثر، وإذا كنت قد مشيت على هذا المسار لمدة لا تقل عن 10 دقائق اليوم. المشاركة طوعية ومجهولة الهوية.")}</p><p>{t("The approved participant information and consent procedure must be provided separately before this questionnaire.", "يجب تقديم معلومات المشارك وإجراء الموافقة المعتمدين بشكل منفصل قبل هذا الاستبيان.")}</p></div><label className="consent-check"><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /><span>{t("I confirm that I meet the eligibility criteria and agree to participate.", "أؤكد أنني أستوفي معايير الأهلية وأوافق على المشاركة.")}</span></label><button className="primary-button full-button" type="button" disabled={!consentAccepted} onClick={() => { mark("consent_accepted_at"); mark("core_started_at"); setStage("survey"); }}>{t("Start questionnaire", "بدء الاستبيان")}</button></section>}
    {stage === "survey" && renderSurvey()}
    {stage === "image" && renderImageStage()}
    {stage === "feedback" && renderFeedbackStage()}
    {stage === "complete" && <section className="complete-card"><div className="complete-icon">✓</div><h1>{t("Thank you", "شكراً لك")}</h1><p>{t("You have completed the MPA-Index field questionnaire.", "لقد أكملت استبيان MPA-Index الميداني.")}</p><div className={`save-box save-${saveStatus}`}>{saveStatus === "saving" && <b>{t("Saving…", "جارٍ الحفظ…")}</b>}{saveStatus === "saved" && <b>{t("Saved to the research database.", "تم الحفظ في قاعدة بيانات البحث.")}</b>}{saveStatus === "queued" && <b>{t("Stored locally and queued for synchronization.", "تم الحفظ محلياً ووضعه في قائمة انتظار المزامنة.")}</b>}{saveStatus === "error" && <b>{t("Could not save to the server or local queue.", "تعذّر الحفظ على الخادم أو في قائمة الانتظار المحلية.")}</b>}{saveMessage && <small>{saveMessage}</small>}{saveStatus === "error" && <button type="button" className="secondary-button" onClick={() => setSaveStatus("idle")}>{t("Retry", "إعادة المحاولة")}</button>}</div>{renderSummary()}<div className="complete-actions"><span className="session-id">Session {submissionId.slice(0,8)} · v{STUDY_VERSION}</span><button type="button" className="primary-button" disabled={saveStatus === "saving" || saveStatus === "error"} onClick={resetSession}>{t("Start next participant", "بدء مشارك جديد")}</button></div></section>}
  </main>{resetConfirmOpen && <div className="reset-modal-backdrop" role="presentation" onMouseDown={() => setResetConfirmOpen(false)}><div className="reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={(event) => event.stopPropagation()}><span className="reset-modal__icon">↺</span><h2 id="reset-title">{t("Reset questionnaire?", "إعادة الاستبيان من البداية؟")}</h2><p>{t("This will clear the current participant's locally saved progress and return to the beginning. It does not delete responses already submitted to the research database.", "سيؤدي ذلك إلى مسح تقدم المشارك الحالي المحفوظ محلياً والعودة إلى البداية. ولن يحذف الاستجابات التي تم إرسالها مسبقاً إلى قاعدة بيانات البحث.")}</p><div className="reset-modal__actions"><button type="button" className="secondary-button" onClick={() => setResetConfirmOpen(false)}>{t("Cancel", "إلغاء")}</button><button type="button" className="danger-button" onClick={resetSession}>{t("Reset to beginning", "إعادة البدء")}</button></div></div></div>}<footer className="footer"><span>{t("MPA-Index · Madaba heritage field study", "MPA-Index · دراسة مادبا التراثية الميدانية")}</span><span>{t("Progress is saved on this device as you answer", "يتم حفظ تقدمك على هذا الجهاز أثناء الإجابة")}</span></footer></div>;
}
