"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { conditionalFoodQuestionIds, questions, STORAGE_KEY, STUDY_VERSION, trails, trailImages } from "@/config/study";
import { ChoiceQuestion } from "@/components/ChoiceQuestion";
import { ExperientialScale } from "@/components/ExperientialScale";
import { StageProgress } from "@/components/StageProgress";
import { TrailQuestion } from "@/components/TrailQuestion";
import { ImageFeatureTask } from "@/components/ImageFeatureTask";
import { buildSubmissionPayload } from "@/lib/payload";
import { flushQueue, getQueuedPayloads, postPayload, queuePayload, removeQueuedPayload } from "@/lib/offlineQueue";
import type { FeatureMarker, Language, Question, QuestionTheme } from "@/types/questionnaire";

const FINAL_V24_RUNTIME_MARKER = "FINAL_V24_RUNTIME_MARKER";
void FINAL_V24_RUNTIME_MARKER;

type Stage = "start" | "language" | "consent" | "survey" | "image" | "complete";
type SaveStatus = "idle" | "saving" | "saved" | "queued" | "error";

type SavedSession = {
  stage: Stage;
  language: Language;
  consentAccepted: boolean;
  submissionId: string;
  currentGroupIndex: number;
  answers: Record<string, string>;
  answeredAt: Record<string, string>;
  responseMs: Record<string, number>;
  timestamps: Record<string, string>;
  featureMarkers: FeatureMarker[];
};

type SurveyGroup = {
  id: string;
  title: { en: string; ar: string };
  prompt: { en: string; ar: string };
  theme: QuestionTheme;
  questions: Question[];
};

const groupMeta: Record<string, { title: { en: string; ar: string }; prompt: { en: string; ar: string }; theme: QuestionTheme }> = {
  trail: {
    title: { en: "Trail identification", ar: "تحديد المسار" },
    prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." },
    theme: "profile",
  },
  profile: {
    title: { en: "About you", ar: "عنك" },
    prompt: { en: "Please answer the following field-record questions.", ar: "يرجى الإجابة عن أسئلة السجل الميداني التالية." },
    theme: "profile",
  },
  visual: {
    title: { en: "Visual experience", ar: "التجربة البصرية" },
    prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." },
    theme: "visual",
  },
  auditory: {
    title: { en: "Auditory experience", ar: "التجربة السمعية" },
    prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." },
    theme: "auditory",
  },
  olfactory: {
    title: { en: "Olfactory experience", ar: "التجربة الشمية" },
    prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." },
    theme: "olfactory",
  },
  tactile: {
    title: { en: "Tactile and walking-surface experience", ar: "تجربة اللمس وسطح المشي" },
    prompt: { en: "Rate the performance you experienced; do not rate importance.", ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية." },
    theme: "tactile",
  },
  gustatory: {
    title: { en: "Food and drink", ar: "الطعام والشراب" },
    prompt: { en: "Answer about opportunities or food/drink encountered on this trail today.", ar: "أجب عن فرص أو تجارب الطعام والشراب على هذا المسار اليوم." },
    theme: "gustatory",
  },
  contextual: {
    title: { en: "Contextual conditions", ar: "الظروف السياقية" },
    prompt: { en: "Context only · not Fuzzy-AHP weighted.", ar: "للسياق فقط · غير مُرجّح ضمن Fuzzy-AHP." },
    theme: "contextual",
  },
  satisfaction: {
    title: { en: "Satisfaction", ar: "الرضا" },
    prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." },
    theme: "satisfaction",
  },
  memory: {
    title: { en: "Memory", ar: "الذاكرة" },
    prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." },
    theme: "memory",
  },
  security: {
    title: { en: "Perceived security", ar: "الأمان المدرك" },
    prompt: { en: "Think only about the trail or trail segment you have just experienced.", ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو." },
    theme: "security",
  },
  place_identity: {
    title: { en: "Place identity", ar: "هوية المكان" },
    prompt: { en: "Think about what this trail means to you.", ar: "فكّر فيما يعنيه هذا المسار بالنسبة لك." },
    theme: "place_identity",
  },
  place_dependence: {
    title: { en: "Place dependence", ar: "الاعتماد على المكان" },
    prompt: { en: "Think about how well this trail supports the activities you want to do here.", ar: "فكّر في مدى ملاءمة هذا المسار للأنشطة التي تريد القيام بها هنا." },
    theme: "place_dependence",
  },
};

const groupOrder = ["trail", "profile", "visual", "auditory", "olfactory", "tactile", "gustatory", "contextual", "satisfaction", "memory", "security", "place_identity", "place_dependence"];

function nowIso() { return new Date().toISOString(); }
function scoreValue(value?: string) { const n = Number(value); return Number.isFinite(n) ? n : null; }
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
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredAt, setAnsweredAt] = useState<Record<string, string>>({});
  const [responseMs, setResponseMs] = useState<Record<string, number>>({});
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const [featureMarkers, setFeatureMarkers] = useState<FeatureMarker[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const groupStartedAtRef = useRef(Date.now());

  const isArabic = language === "ar";
  const t = (en: string, ar: string) => isArabic ? ar : en;

  const surveyGroups = useMemo<SurveyGroup[]>(() => {
    return groupOrder.map((id) => {
      let groupQuestions: Question[];
      if (id === "trail") groupQuestions = questions.filter((question) => question.id === "P1");
      else if (id === "profile") groupQuestions = questions.filter((question) => question.section === "profile" && question.id !== "P1");
      else groupQuestions = questions.filter((question) => question.section === id);
      if (id === "gustatory" && answers.G_CONSUMED !== "yes") {
        groupQuestions = groupQuestions.filter((question) => !conditionalFoodQuestionIds.has(question.id));
      }
      const meta = groupMeta[id];
      return { id, title: meta.title, prompt: meta.prompt, theme: meta.theme, questions: groupQuestions };
    });
  }, [answers.G_CONSUMED]);

  const currentGroup = surveyGroups[currentGroupIndex];
  const selectedTrail = trails.find((trail) => trail.id === answers.P1);
  const selectedTrailImage = trailImages.find((image) => image.trailId === answers.P1);

  const progressQuestions = useMemo(
    () => questions.filter((question) => !(conditionalFoodQuestionIds.has(question.id) && answers.G_CONSUMED === "no")),
    [answers.G_CONSUMED]
  );
  const progressPercent = useMemo(() => {
    if (stage === "complete") return 100;
    const answeredCount = progressQuestions.filter((question) => Boolean(answers[question.id])).length;
    const imageCount = Math.min(3, featureMarkers.length);
    return Math.round(((answeredCount + imageCount) / (progressQuestions.length + 3)) * 100);
  }, [stage, progressQuestions, answers, featureMarkers.length]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedSession;
        setStage(saved.stage ?? "start");
        setLanguage(saved.language ?? "en");
        setConsentAccepted(saved.consentAccepted ?? false);
        setSubmissionId(saved.submissionId || crypto.randomUUID());
        setCurrentGroupIndex(saved.currentGroupIndex ?? 0);
        setAnswers(saved.answers ?? {});
        setAnsweredAt(saved.answeredAt ?? {});
        setResponseMs(saved.responseMs ?? {});
        setTimestamps(saved.timestamps ?? {});
        setFeatureMarkers(saved.featureMarkers ?? []);
      } else setSubmissionId(crypto.randomUUID());
    } catch { setSubmissionId(crypto.randomUUID()); }
    finally { setHydrated(true); }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (currentGroupIndex >= surveyGroups.length) setCurrentGroupIndex(Math.max(0, surveyGroups.length - 1));
  }, [hydrated, currentGroupIndex, surveyGroups.length]);

  useEffect(() => {
    if (!hydrated) return;
    const saved: SavedSession = { stage, language, consentAccepted, submissionId, currentGroupIndex, answers, answeredAt, responseMs, timestamps, featureMarkers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [hydrated, stage, language, consentAccepted, submissionId, currentGroupIndex, answers, answeredAt, responseMs, timestamps, featureMarkers]);

  useEffect(() => {
    if (!hydrated) return;
    const persistBeforeLeave = () => {
      const saved: SavedSession = { stage, language, consentAccepted, submissionId, currentGroupIndex, answers, answeredAt, responseMs, timestamps, featureMarkers };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* best effort */ }
    };
    window.addEventListener("pagehide", persistBeforeLeave);
    window.addEventListener("beforeunload", persistBeforeLeave);
    return () => {
      window.removeEventListener("pagehide", persistBeforeLeave);
      window.removeEventListener("beforeunload", persistBeforeLeave);
    };
  }, [hydrated, stage, language, consentAccepted, submissionId, currentGroupIndex, answers, answeredAt, responseMs, timestamps, featureMarkers]);

  useEffect(() => { groupStartedAtRef.current = Date.now(); }, [stage, currentGroupIndex]);

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
    const now = nowIso();
    setAnswers((previous) => {
      const next = { ...previous, [questionId]: value };
      if (questionId === "G_CONSUMED" && value === "no") {
        for (const id of conditionalFoodQuestionIds) delete next[id];
      }
      return next;
    });
    setAnsweredAt((previous) => {
      const next = { ...previous, [questionId]: now };
      if (questionId === "G_CONSUMED" && value === "no") {
        for (const id of conditionalFoodQuestionIds) delete next[id];
      }
      return next;
    });
    setResponseMs((previous) => {
      const next = { ...previous, [questionId]: previous[questionId] ?? Math.max(0, Date.now() - groupStartedAtRef.current) };
      if (questionId === "G_CONSUMED" && value === "no") {
        for (const id of conditionalFoodQuestionIds) delete next[id];
      }
      return next;
    });
    if (questionId === "P1") setFeatureMarkers([]);
  }

  function groupComplete(group: SurveyGroup) {
    return group.questions.every((question) => Boolean(answers[question.id]));
  }

  function goNextGroup() {
    if (!currentGroup || !groupComplete(currentGroup)) return;
    if (currentGroupIndex < surveyGroups.length - 1) {
      setCurrentGroupIndex((previous) => previous + 1);
      return;
    }
    const now = nowIso();
    setTimestamps((previous) => ({ ...previous, core_completed_at: previous.core_completed_at ?? now }));
    setSaveStatus("idle");
    if (selectedTrail && selectedTrailImage) setStage("image");
    else {
      setTimestamps((previous) => ({ ...previous, completed_at: previous.completed_at ?? now }));
      setStage("complete");
    }
  }

  function addFeatureMarker(x: number, y: number) {
    setFeatureMarkers((previous) => {
      if (previous.length >= 3) return previous;
      return [...previous, { id: crypto.randomUUID(), x, y }];
    });
  }

  function finishImageTask() {
    if (featureMarkers.length !== 3) return;
    const now = nowIso();
    setTimestamps((previous) => ({ ...previous, image_completed_at: previous.image_completed_at ?? now, completed_at: previous.completed_at ?? now }));
    setSaveStatus("idle");
    setStage("complete");
  }

  async function persistSubmission() {
    if (!submissionId || saveStatus === "saving" || saveStatus === "saved" || saveStatus === "queued") return;
    setSaveStatus("saving");
    const payload = buildSubmissionPayload({
      submissionId,
      language,
      selectedTrailId: answers.P1 ?? "",
      answers,
      answeredAt,
      responseMs,
      timestamps,
      featureMarkers,
      selectedTrailImage,
    });
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
    setCurrentGroupIndex(0);
    setAnswers({});
    setAnsweredAt({});
    setResponseMs({});
    setTimestamps({});
    setFeatureMarkers([]);
    setSaveStatus("idle");
    setSaveMessage("");
    setResetConfirmOpen(false);
  }

  function renderTopBar() {
    return <header className="topbar"><div className="topbar__inner">
      <div className="brand"><span className="brand__mark">M</span><span><b>MPA-Index</b><small>{t("Madaba Heritage Walking Trails", "مسارات مادبا التراثية")}</small></span></div>
      {(stage === "survey" || stage === "image" || stage === "complete") && <div className="topbar__progress"><StageProgress language={language} percent={progressPercent} /></div>}
      <div className="topbar__actions"><span className="final-build-badge">THESIS QUESTIONNAIRE · FINAL v24</span>{queueCount > 0 && <span className="queue-pill">{queueCount} ⟳</span>}{stage !== "start" && <button type="button" className="reset-session-button" onClick={() => setResetConfirmOpen(true)}>{t("Reset", "إعادة البدء")}</button>}<button type="button" className="language-button" onClick={() => setLanguage((previous) => previous === "en" ? "ar" : "en")}>{language === "en" ? "العربية" : "English"}</button></div>
    </div></header>;
  }

  function renderScaleLegend() {
    const opts = questions.find((question) => question.type === "likert")?.options ?? [];
    return <div className="likert-group-legend" aria-label={t("Agreement scale", "مقياس الموافقة")}><div className="likert-group-legend__spacer">{t("Statement", "العبارة")}</div><div className="likert-group-legend__scale">{opts.map((option) => <div key={option.value}><b>{option.value}</b><span>{option.label[language]}</span></div>)}</div></div>;
  }

  function renderLikertRows(groupQuestions: Question[]) {
    return <div className="likert-group-rows">
      {groupQuestions.map((question) => <div className="likert-group-row" key={question.id}>
        <div className="likert-group-row__statement">{question.label[language]}</div>
        <ExperientialScale question={question} language={language} value={answers[question.id]} onChange={(next) => recordAnswer(question.id, next)} />
      </div>)}
    </div>;
  }

  function renderProfileGroup(group: SurveyGroup) {
    return <div className="profile-group-grid">{group.questions.map((question) => <div className="profile-group-item" key={question.id}>
      <h3>{question.label[language]}</h3>
      <ChoiceQuestion question={question} language={language} value={answers[question.id]} onChange={(next) => recordAnswer(question.id, next)} />
    </div>)}</div>;
  }

  function renderGustatoryGroup(group: SurveyGroup) {
    const g1 = group.questions.find((question) => question.id === "G1");
    const consumed = group.questions.find((question) => question.id === "G_CONSUMED");
    const followups = group.questions.filter((question) => conditionalFoodQuestionIds.has(question.id));
    return <>
      {renderScaleLegend()}
      {g1 && renderLikertRows([g1])}
      {consumed && <div className="conditional-choice-block"><h3>{consumed.label[language]}</h3><p>{consumed.helper?.[language]}</p><ChoiceQuestion question={consumed} language={language} value={answers[consumed.id]} onChange={(next) => recordAnswer(consumed.id, next)} /></div>}
      {followups.length > 0 && <div className="conditional-followups">{renderLikertRows(followups)}</div>}
    </>;
  }

  function renderSurvey() {
    if (!currentGroup) return null;
    const isTrail = currentGroup.id === "trail";
    const isProfile = currentGroup.id === "profile";
    const isGustatory = currentGroup.id === "gustatory";
    const likertOnly = currentGroup.questions.every((question) => question.type === "likert");
    const canContinue = groupComplete(currentGroup);

    return <section className={`question-card grouped-question-card theme-${currentGroup.theme}`}>
      <div className="grouped-question-card__heading">
        <div><p className="eyebrow">{currentGroup.title[language]}</p><h1>{currentGroup.title[language]}</h1></div>
      </div>
      <p className="question-prompt">{currentGroup.prompt[language]}</p>

      {isTrail && currentGroup.questions[0] && <TrailQuestion language={language} trails={trails} images={trailImages} value={answers.P1} onChange={(next) => recordAnswer("P1", next)} />}
      {isProfile && renderProfileGroup(currentGroup)}
      {likertOnly && <>{renderScaleLegend()}{renderLikertRows(currentGroup.questions)}</>}
      {isGustatory && renderGustatoryGroup(currentGroup)}

      <div className="question-nav compact-group-nav">
        <button type="button" className="secondary-button" disabled={currentGroupIndex === 0} onClick={() => setCurrentGroupIndex((previous) => Math.max(0, previous - 1))}>{t("Back", "رجوع")}</button>
        <button type="button" className="primary-button" disabled={!canContinue} onClick={goNextGroup}>{currentGroupIndex === surveyGroups.length - 1 ? t("Continue to image task", "المتابعة إلى مهمة الصورة") : t("Continue", "متابعة")}</button>
      </div>
    </section>;
  }

  function renderImageStage() {
    if (!selectedTrail || !selectedTrailImage) return null;
    return <>
      <ImageFeatureTask language={language} trail={selectedTrail} image={selectedTrailImage} markers={featureMarkers} onAddMarker={addFeatureMarker} onClearMarkers={() => setFeatureMarkers([])} />
      <div className="task-card narrow-task"><div className="task-footer">
        <span>{t("Mark exactly three points on the image. No other entry is required.", "حدّد ثلاث نقاط بالضبط على الصورة. لا يلزم أي إدخال آخر.")}</span>
        <button type="button" className="secondary-button" onClick={() => { setCurrentGroupIndex(surveyGroups.length - 1); setStage("survey"); }}>{t("Back to questionnaire", "العودة إلى الاستبيان")}</button>
        <button type="button" className="primary-button" disabled={featureMarkers.length !== 3} onClick={finishImageTask}>{t("Submit questionnaire", "إرسال الاستبيان")}</button>
      </div></div>
    </>;
  }

  function renderSummary() {
    const rows = [
      { label: t("Visual experience", "التجربة البصرية"), value: mean(["V1","V2","V3","V4","V5","V6"].map((id) => scoreValue(answers[id]))) },
      { label: t("Auditory experience", "التجربة السمعية"), value: mean(["AUD1","AUD2","AUD3","AUD4","AUD5","AUD6"].map((id) => scoreValue(answers[id]))) },
      { label: t("Olfactory experience", "التجربة الشمية"), value: mean(["O1","O2","O3","O4"].map((id) => scoreValue(answers[id]))) },
      { label: t("Tactile / walking surface", "اللمس / سطح المشي"), value: mean(["T1","T2","T3","T4","T5"].map((id) => scoreValue(answers[id]))) },
      { label: t("Satisfaction", "الرضا"), value: mean(["SAT1","SAT2","SAT3"].map((id) => scoreValue(answers[id]))) },
      { label: t("Place attachment", "الارتباط بالمكان"), value: mean(["PI1","PI2","PI3","PD1","PD2","PD3"].map((id) => scoreValue(answers[id]))) },
    ];
    return <div className="participant-summary"><div className="summary-heading"><div><p className="eyebrow">{t("Your responses at a glance", "نظرة سريعة على إجاباتك")}</p><h2>{selectedTrail?.name[language] ?? t("Your Madaba walk", "جولتك في مادبا")}</h2></div><span className="summary-note">{t("Descriptive only · not an assessment score", "وصفي فقط · ليس نتيجة تقييم")}</span></div><div className="summary-bars">{rows.map((row) => <div className="summary-row" key={row.label}><span>{row.label}</span><div><i style={{ width: `${((row.value ?? 0) / 5) * 100}%` }} /></div><b>{row.value ? row.value.toFixed(1) : "—"}/5</b></div>)}</div>{featureMarkers.length === 3 && <p className="summary-note">{t("Three trail-image points were recorded for research analysis.", "تم تسجيل ثلاث نقاط على صورة المسار للتحليل البحثي.")}</p>}</div>;
  }

  if (!hydrated) return <main className="loading-screen">MPA-Index</main>;

  return <div dir={isArabic ? "rtl" : "ltr"} lang={language} className="app-shell">{renderTopBar()}<main className="main-area">
    {stage === "start" && <section className="hero-card hero-card--v7"><div className="hero-card__content"><p className="eyebrow">MPA-Index · Field Questionnaire</p><h1>{t("Multisensory perception, psychological mediators, and place attachment", "الإدراك متعدد الحواس والوسائط النفسية والارتباط بالمكان")}</h1><p>{t("A field questionnaire about Madaba's heritage walking trails. Think only about the trail or trail segment you have just experienced.", "استبيان ميداني حول مسارات المشي التراثية في مادبا. فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو.")}</p><div className="hero-chips"><span>3 {t("study trails", "مسارات للدراسة")}</span><span>{t("Grouped question screens", "شاشات أسئلة مجمّعة")}</span><span>{t("Three-point image task", "مهمة ثلاث نقاط على الصورة")}</span><span>{t("Refresh-safe progress", "يحفظ التقدم عند التحديث")}</span></div><button className="primary-button hero-button" type="button" onClick={() => { mark("started_at"); setStage("language"); }}>{t("Begin", "ابدأ")}</button></div><div className="hero-card__media"><figure className="hero-photo-frame"><img src="/hero-madaba-sharp.jpg" alt={t("Madaba heritage walking street", "شارع مشي تراثي في مادبا")} /><figcaption><span>{t("Madaba heritage walking environment", "بيئة مشي تراثية في مادبا")}</span><b>MPA · INDEX</b></figcaption></figure></div></section>}
    {stage === "language" && <section className="simple-card"><p className="eyebrow">Language · اللغة</p><h1>{t("Choose your questionnaire language", "اختر لغة الاستبيان")}</h1><div className="language-choice"><button type="button" onClick={() => { setLanguage("en"); setStage("consent"); }}>English<span>Continue in English →</span></button><button type="button" onClick={() => { setLanguage("ar"); setStage("consent"); }}>العربية<span>المتابعة باللغة العربية ←</span></button></div></section>}
    {stage === "consent" && <section className="simple-card consent-card"><p className="eyebrow">{t("Eligibility and consent", "الأهلية والموافقة")}</p><h1>{t("Before you begin", "قبل أن تبدأ")}</h1><div className="consent-copy"><p>{t("Complete this questionnaire only if you are 18 years or older and have walked on this trail for at least 10 minutes today. Participation is voluntary and anonymous.", "أكمل هذا الاستبيان فقط إذا كان عمرك 18 عاماً أو أكثر، وإذا كنت قد مشيت على هذا المسار لمدة لا تقل عن 10 دقائق اليوم. المشاركة طوعية ومجهولة الهوية.")}</p><p>{t("The approved participant information and consent procedure must be provided separately before this questionnaire.", "يجب تقديم معلومات المشارك وإجراء الموافقة المعتمدين بشكل منفصل قبل هذا الاستبيان.")}</p></div><label className="consent-check"><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /><span>{t("I confirm that I meet the eligibility criteria and agree to participate.", "أؤكد أنني أستوفي معايير الأهلية وأوافق على المشاركة.")}</span></label><button className="primary-button full-button" type="button" disabled={!consentAccepted} onClick={() => { mark("consent_accepted_at"); mark("core_started_at"); setStage("survey"); }}>{t("Start questionnaire", "بدء الاستبيان")}</button></section>}
    {stage === "survey" && renderSurvey()}
    {stage === "image" && renderImageStage()}
    {stage === "complete" && <section className="complete-card"><div className="complete-icon">✓</div><h1>{t("Thank you", "شكراً لك")}</h1><p>{t("You have completed the MPA-Index field questionnaire.", "لقد أكملت استبيان MPA-Index الميداني.")}</p><div className={`save-box save-${saveStatus}`}>{saveStatus === "saving" && <b>{t("Saving…", "جارٍ الحفظ…")}</b>}{saveStatus === "saved" && <b>{t("Saved to the research database.", "تم الحفظ في قاعدة بيانات البحث.")}</b>}{saveStatus === "queued" && <b>{t("Stored locally and queued for synchronization.", "تم الحفظ محلياً ووضعه في قائمة انتظار المزامنة.")}</b>}{saveStatus === "error" && <b>{t("Could not save to the server or local queue.", "تعذّر الحفظ على الخادم أو في قائمة الانتظار المحلية.")}</b>}{saveMessage && <small>{saveMessage}</small>}{saveStatus === "error" && <button type="button" className="secondary-button" onClick={() => setSaveStatus("idle")}>{t("Retry", "إعادة المحاولة")}</button>}</div>{renderSummary()}<div className="complete-actions"><span className="session-id">Session {submissionId.slice(0,8)} · v{STUDY_VERSION}</span><button type="button" className="primary-button" disabled={saveStatus === "saving" || saveStatus === "error"} onClick={resetSession}>{t("Start next participant", "بدء مشارك جديد")}</button></div></section>}
  </main>{resetConfirmOpen && <div className="reset-modal-backdrop" role="presentation" onMouseDown={() => setResetConfirmOpen(false)}><div className="reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={(event) => event.stopPropagation()}><span className="reset-modal__icon">↺</span><h2 id="reset-title">{t("Reset questionnaire?", "إعادة الاستبيان من البداية؟")}</h2><p>{t("This will clear the current participant's locally saved progress and return to the beginning. It does not delete responses already submitted to the research database.", "سيؤدي ذلك إلى مسح تقدم المشارك الحالي المحفوظ محلياً والعودة إلى البداية. ولن يحذف الاستجابات التي تم إرسالها مسبقاً إلى قاعدة بيانات البحث.")}</p><div className="reset-modal__actions"><button type="button" className="secondary-button" onClick={() => setResetConfirmOpen(false)}>{t("Cancel", "إلغاء")}</button><button type="button" className="danger-button" onClick={resetSession}>{t("Reset to beginning", "إعادة البدء")}</button></div></div></div>}<footer className="footer"><span>{t("MPA-Index · Madaba heritage field study", "MPA-Index · دراسة مادبا التراثية الميدانية")}</span><span>{t("Progress is saved on this device as you answer", "يتم حفظ تقدمك على هذا الجهاز أثناء الإجابة")}</span></footer></div>;
}
