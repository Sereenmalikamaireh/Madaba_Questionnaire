import type { Question, QuestionOption, Trail, TrailImage } from "@/types/questionnaire";

export const STUDY_VERSION = "23.0.0-after-pilot-3-mediators";
export const STORAGE_KEY = "mpa_index_questionnaire_final_v23";

export const likertAgreementOptions: QuestionOption[] = [
  { value: "1", label: { en: "Strongly disagree", ar: "لا أوافق بشدة" } },
  { value: "2", label: { en: "Disagree", ar: "لا أوافق" } },
  { value: "3", label: { en: "Neither", ar: "لا أوافق ولا أعترض" } },
  { value: "4", label: { en: "Agree", ar: "أوافق" } },
  { value: "5", label: { en: "Strongly agree", ar: "أوافق بشدة" } },
];

export const yesNoOptions: QuestionOption[] = [
  { value: "yes", label: { en: "Yes", ar: "نعم" } },
  { value: "no", label: { en: "No", ar: "لا" } },
];

export const trails: Trail[] = [
  {
    id: "trail_2_prince_hasan",
    number: 1,
    name: { en: "Prince Hasan St.", ar: "شارع الأمير حسن" },
    descriptor: { en: "T1 · Prince Hasan St.", ar: "T1 · شارع الأمير حسن" },
    imageFolder: "trail-2-prince-hasan",
  },
  {
    id: "trail_3_al_hussain",
    number: 2,
    name: { en: "Al-Hussain Bin Ali St.", ar: "شارع الحسين بن علي" },
    descriptor: { en: "T2 · Al-Hussain Bin Ali St.", ar: "T2 · شارع الحسين بن علي" },
    imageFolder: "trail-3-al-hussain",
  },
  {
    id: "trail_4_king_talal",
    number: 3,
    name: { en: "King Talal St.", ar: "شارع الملك طلال" },
    descriptor: { en: "T3 · King Talal St.", ar: "T3 · شارع الملك طلال" },
    imageFolder: "trail-4-king-talal",
  },
];

export const trailImages: TrailImage[] = [
  {
    id: "ROUTE_PRINCE_HASSAN",
    trailId: "trail_2_prince_hasan",
    src: "/route-selection/prince-hassan.jpg",
    label: { en: "Prince Hasan St.", ar: "شارع الأمير حسن" },
    metadata: { latitude: null, longitude: null, captureDate: null, orientationDeg: null, checksum: null, note: "Primary route-identification photograph supplied for this study." },
  },
  {
    id: "ROUTE_AL_HUSSAIN",
    trailId: "trail_3_al_hussain",
    src: "/route-selection/al-hussain-bin-ali.jpg",
    label: { en: "Al-Hussain Bin Ali St.", ar: "شارع الحسين بن علي" },
    metadata: { latitude: null, longitude: null, captureDate: null, orientationDeg: null, checksum: null, note: "Primary route-identification photograph supplied for this study." },
  },
  {
    id: "ROUTE_KING_TALAL",
    trailId: "trail_4_king_talal",
    src: "/route-selection/king-talal.jpg",
    label: { en: "King Talal St.", ar: "شارع الملك طلال" },
    metadata: { latitude: null, longitude: null, captureDate: null, orientationDeg: null, checksum: null, note: "Primary route-identification photograph supplied for this study." },
  },
];

const sections = {
  profile: { en: "Section A · About you", ar: "القسم أ · عنك" },
  visual: { en: "B1 · Visual experience", ar: "B1 · التجربة البصرية" },
  auditory: { en: "B2 · Auditory experience", ar: "B2 · التجربة السمعية" },
  olfactory: { en: "B3 · Olfactory experience", ar: "B3 · التجربة الشمية" },
  tactile: { en: "B4 · Tactile and walking-surface experience", ar: "B4 · تجربة اللمس وسطح المشي" },
  gustatory: { en: "B5 · Conditional gustatory block", ar: "B5 · قسم التذوق الشرطي" },
  contextual: { en: "Section C · Contextual conditions", ar: "القسم ج · الظروف السياقية" },
  satisfaction: { en: "D1 · Satisfaction", ar: "D1 · الرضا" },
  memory: { en: "D2 · Memory", ar: "D2 · الذاكرة" },
  security: { en: "D3 · Perceived security", ar: "D3 · الأمان المدرك" },
  placeIdentity: { en: "E1 · Place identity", ar: "E1 · هوية المكان" },
  placeDependence: { en: "E2 · Place dependence", ar: "E2 · الاعتماد على المكان" },
};

const sensoryHelper = {
  en: "Rate the performance you experienced; do not rate importance.",
  ar: "قيّم الأداء الذي اختبرته؛ لا تقيّم الأهمية.",
};

const contextHelper = {
  en: "Context only · not Fuzzy-AHP weighted.",
  ar: "للسياق فقط · غير مُرجّح ضمن Fuzzy-AHP.",
};

const standardHelper = {
  en: "Think only about the trail or trail segment you have just experienced.",
  ar: "فكّر فقط في المسار أو جزء المسار الذي اختبرته للتو.",
};

function likert(id: string, displayCode: string, section: string, sectionLabel: { en: string; ar: string }, theme: Question["theme"], en: string, ar: string, helper = standardHelper): Question {
  return { id, displayCode, section, sectionLabel, type: "likert", required: true, label: { en, ar }, options: likertAgreementOptions, theme, helper };
}

function choice(id: string, displayCode: string | undefined, section: string, sectionLabel: { en: string; ar: string }, en: string, ar: string, options: QuestionOption[], helper?: { en: string; ar: string }): Question {
  return { id, displayCode, section, sectionLabel, type: "single_choice", required: true, label: { en, ar }, options, theme: "profile", helper };
}

export const questions: Question[] = [
  {
    id: "P1",
    displayCode: "TRAIL",
    section: "profile",
    sectionLabel: sections.profile,
    type: "single_choice",
    required: true,
    label: { en: "Please identify which trail you are evaluating.", ar: "يرجى تحديد المسار الذي تقوم بتقييمه." },
    helper: standardHelper,
    theme: "profile",
    options: trails.map((trail) => ({ value: trail.id, label: trail.name })),
  },
  choice("P2", "A1", "profile", sections.profile, "Status", "الصفة", [
    { value: "madaba_resident", label: { en: "Madaba resident", ar: "مقيم في مادبا" } },
    { value: "visitor_jordan", label: { en: "Visitor from elsewhere in Jordan", ar: "زائر من منطقة أخرى في الأردن" } },
    { value: "international_visitor", label: { en: "International visitor", ar: "زائر دولي" } },
  ]),
  choice("P3", "A2", "profile", sections.profile, "Age", "العمر", ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((value) => ({ value, label: { en: value, ar: value } }))),
  choice("P4", "A3", "profile", sections.profile, "Gender", "الجنس", [
    { value: "female", label: { en: "Female", ar: "أنثى" } },
    { value: "male", label: { en: "Male", ar: "ذكر" } },
    { value: "prefer_not", label: { en: "Prefer not to say", ar: "أفضل عدم الإجابة" } },
  ]),
  choice("P5", "A4", "profile", sections.profile, "Previous use of this trail", "الاستخدام السابق لهذا المسار", [
    { value: "first_visit", label: { en: "First visit", ar: "الزيارة الأولى" } },
    { value: "2_5_visits", label: { en: "2-5 visits", ar: "2-5 زيارات" } },
    { value: "6_plus_visits", label: { en: "6+ visits", ar: "6 زيارات أو أكثر" } },
    { value: "monthly", label: { en: "Monthly", ar: "شهرياً" } },
    { value: "weekly_plus", label: { en: "Weekly+", ar: "أسبوعياً أو أكثر" } },
  ]),
  choice("P6", "A5", "profile", sections.profile, "Main purpose today", "الغرض الرئيسي اليوم", [
    { value: "sightseeing", label: { en: "Sightseeing", ar: "زيارة / مشاهدة المعالم" } },
    { value: "shopping_services", label: { en: "Shopping/services", ar: "التسوق / الخدمات" } },
    { value: "work_study", label: { en: "Work/study", ar: "العمل / الدراسة" } },
    { value: "social_family", label: { en: "Social/family", ar: "اجتماعي / عائلي" } },
    { value: "passing_through", label: { en: "Passing through", ar: "المرور عبر المسار" } },
  ]),
  choice("P7", "A6", "profile", sections.profile, "Walking with", "السير مع", [
    { value: "alone", label: { en: "Alone", ar: "بمفردي" } },
    { value: "adults_only", label: { en: "Adults only", ar: "بالغون فقط" } },
    { value: "children", label: { en: "Child/children", ar: "طفل / أطفال" } },
    { value: "organized_tour", label: { en: "Organized tour group", ar: "مجموعة سياحية منظمة" } },
  ]),
  choice("P8", "A7", "profile", sections.profile, "Time spent on this trail today", "الوقت الذي قضيته على هذا المسار اليوم", [
    { value: "10_19", label: { en: "10–19 min", ar: "10–19 دقيقة" } },
    { value: "20_39", label: { en: "20–39 min", ar: "20–39 دقيقة" } },
    { value: "40_59", label: { en: "40–59 min", ar: "40–59 دقيقة" } },
    { value: "60_plus", label: { en: "60+ min", ar: "60 دقيقة أو أكثر" } },
  ]),

  likert("V1", "V1", "visual", sections.visual, "visual", "The architecture and materials express Madaba's heritage character.", "تعبّر العمارة والمواد عن الطابع التراثي لمادبا.", sensoryHelper),
  likert("V2", "V2", "visual", sections.visual, "visual", "Buildings, signs, colors, and public spaces formed a visually coherent streetscape.", "شكّلت المباني واللافتات والألوان والفضاءات العامة مشهداً بصرياً متماسكاً.", sensoryHelper),
  likert("V3", "V3", "visual", sections.visual, "visual", "Important heritage features and landmarks are easy to notice and recognize.", "من السهل ملاحظة السمات والمعالم التراثية المهمة والتعرّف إليها.", sensoryHelper),
  likert("V4", "V4", "visual", sections.visual, "visual", "The trail was free from intrusive visual clutter, such as excessive signs, wires, vehicles or unrelated objects.", "كان المسار خالياً من التشويش البصري المتطفل، مثل كثرة اللافتات أو الأسلاك أو المركبات أو العناصر غير المرتبطة بالمكان.", sensoryHelper),
  likert("V5", "V5", "visual", sections.visual, "visual", "Sunlight and shade enhanced the trail's visual quality.", "عزّز ضوء الشمس والظل الجودة البصرية للمسار.", sensoryHelper),
  likert("V6", "V6", "visual", sections.visual, "visual", "Natural elements were well integrated into the trail environment.", "كانت العناصر الطبيعية متكاملة جيداً مع بيئة المسار.", sensoryHelper),

  likert("AUD1", "A1", "auditory", sections.auditory, "auditory", "The overall sound environment is pleasant.", "البيئة الصوتية العامة ممتعة.", sensoryHelper),
  likert("AUD2", "A2", "auditory", sections.auditory, "auditory", "The sounds present fit the heritage character of this place.", "تتناسب الأصوات الموجودة مع الطابع التراثي لهذا المكان.", sensoryHelper),
  likert("AUD3", "A3", "auditory", sections.auditory, "auditory", "Characteristic local sounds enriched the experience.", "أثرت الأصوات المحلية المميزة التجربة.", sensoryHelper),
  likert("AUD4", "A4", "auditory", sections.auditory, "auditory", "The trail was free from intrusive traffic and mechanical noise, or other noise.", "كان المسار خالياً من ضوضاء المرور والآلات المتطفلة أو غيرها من الضوضاء.", sensoryHelper),
  likert("AUD5", "A5", "auditory", sections.auditory, "auditory", "The everyday sounds of local life (conversation, commerce, activity) added positively to this trail.", "أضافت أصوات الحياة المحلية اليومية (المحادثات والتجارة والنشاط) بشكل إيجابي إلى هذا المسار.", sensoryHelper),
  likert("AUD6", "A6", "auditory", sections.auditory, "auditory", "Natural sounds (e.g., birds, wind, water) were noticeably present on this trail.", "كانت الأصوات الطبيعية (مثل الطيور والرياح والماء) موجودة بشكل ملحوظ على هذا المسار.", sensoryHelper),

  likert("O1", "O1", "olfactory", sections.olfactory, "olfactory", "Overall, the smell environment along this trail was pleasant.", "بشكل عام، كانت البيئة الشمية على طول هذا المسار ممتعة.", sensoryHelper),
  likert("O2", "O2", "olfactory", sections.olfactory, "olfactory", "Characteristic local smells enrich the sense of place.", "تثري الروائح المحلية المميزة الإحساس بالمكان.", sensoryHelper),
  likert("O3", "O3", "olfactory", sections.olfactory, "olfactory", "The smells I encountered were appropriate to the heritage and everyday character of the trail.", "كانت الروائح التي صادفتها مناسبة للطابع التراثي واليومي للمسار.", sensoryHelper),
  likert("O4", "O4", "olfactory", sections.olfactory, "olfactory", "The trail was free from offensive smells, such as waste, sewage or excessive smoke.", "كان المسار خالياً من الروائح الكريهة، مثل النفايات أو مياه الصرف الصحي أو الدخان المفرط.", sensoryHelper),

  likert("T1", "T1", "tactile", sections.tactile, "tactile", "The walking surface was physically comfortable underfoot.", "كان سطح المشي مريحاً جسدياً تحت القدمين.", sensoryHelper),
  likert("T2", "T2", "tactile", sections.tactile, "tactile", "The textures of materials and surfaces were noticeable through walking or touch.", "كانت ملامس المواد والأسطح ملحوظة من خلال المشي أو اللمس.", sensoryHelper),
  likert("T3", "T3", "tactile", sections.tactile, "tactile", "The walking surfaces are even and sufficiently maintained.", "أسطح المشي مستوية ومصانة بشكل كافٍ.", sensoryHelper),
  likert("T4", "T4", "tactile", sections.tactile, "tactile", "The textures and materials felt authentic to Madaba’s heritage character.", "بدت الملامس والمواد أصيلة بما يتوافق مع الطابع التراثي لمادبا.", sensoryHelper),
  likert("T5", "T5", "tactile", sections.tactile, "tactile", "I could move continuously along the trail without physical obstructions.", "تمكنت من التحرك بشكل متواصل على طول المسار دون عوائق مادية.", sensoryHelper),

  likert("G1", "G1", "gustatory", sections.gustatory, "gustatory", "There were good opportunities to encounter local food or drink on or beside this trail.", "كانت هناك فرص جيدة لمصادفة طعام أو شراب محلي على هذا المسار أو بجانبه.", sensoryHelper),
  {
    id: "G_CONSUMED",
    displayCode: undefined,
    section: "gustatory",
    sectionLabel: sections.gustatory,
    type: "single_choice",
    required: true,
    label: { en: "Today, did you consume any food or drink obtained on or immediately beside this trail?", ar: "هل تناولت اليوم أي طعام أو شراب حصلت عليه من هذا المسار أو من مكان ملاصق له؟" },
    helper: { en: "If Yes, complete G2–G5. If No, skip directly to Section C.", ar: "إذا كانت الإجابة نعم، أكمل G2–G5. وإذا كانت لا، انتقل مباشرة إلى القسم ج." },
    options: yesNoOptions,
    theme: "gustatory",
  },
  likert("G2", "G2", "gustatory", sections.gustatory, "gustatory", "The food or drink had distinctive flavors that felt authentic to Madaba.", "كان للطعام أو الشراب نكهات مميزة بدت أصيلة بالنسبة لمادبا.", sensoryHelper),
  likert("G3", "G3", "gustatory", sections.gustatory, "gustatory", "The food or drink helped me experience Madaba’s local culture.", "ساعدني الطعام أو الشراب على اختبار الثقافة المحلية لمادبا.", sensoryHelper),
  likert("G4", "G4", "gustatory", sections.gustatory, "gustatory", "Overall, the food or drink had high sensory quality. (taste, freshness, presentation).", "بشكل عام، كان الطعام أو الشراب ذا جودة حسية عالية (الطعم، الطزاجة، التقديم).", sensoryHelper),
  likert("G5", "G5", "gustatory", sections.gustatory, "gustatory", "The food or drink choices I encountered represented a diverse range of local cuisine.", "مثّلت خيارات الطعام أو الشراب التي صادفتها مجموعة متنوعة من المأكولات المحلية.", sensoryHelper),

  likert("CTX1", "CTX1", "contextual", sections.contextual, "contextual", "Overall, the temperature, sun, shade, and airflow are comfortable for walking now.", "بشكل عام، درجة الحرارة والشمس والظل وتدفق الهواء مريحة للمشي الآن.", contextHelper),
  likert("CTX2", "CTX2", "contextual", sections.contextual, "contextual", "The presence and everyday activities of local people add positively to this trail.", "يضيف وجود السكان المحليين وأنشطتهم اليومية بشكل إيجابي إلى هذا المسار.", contextHelper),
  likert("CTX3", "CTX3", "contextual", sections.contextual, "contextual", "I felt protected from moving vehicles and traffic-related risks.", "شعرت بأنني محمي من المركبات المتحركة والمخاطر المرتبطة بحركة المرور.", contextHelper),

  likert("SAT1", "SAT1", "satisfaction", sections.satisfaction, "satisfaction", "Overall, I was satisfied with my experience along this trail.", "بشكل عام، كنت راضياً عن تجربتي على طول هذا المسار."),
  likert("SAT2", "SAT2", "satisfaction", sections.satisfaction, "satisfaction", "Walking along this trail was worthwhile.", "كان المشي على طول هذا المسار جديراً بالوقت والجهد."),
  likert("SAT3", "SAT3", "satisfaction", sections.satisfaction, "satisfaction", "The experience along this trail met my expectations for a heritage walking experience.", "لبّت التجربة على طول هذا المسار توقعاتي لتجربة مشي تراثية."),

  likert("MEM1", "MEM1", "memory", sections.memory, "memory", "Walking along this trail brought Madaba’s stories, traditions or history to mind.", "استحضر المشي على طول هذا المسار إلى ذهني قصص مادبا أو تقاليدها أو تاريخها."),
  likert("MEM2", "MEM2", "memory", sections.memory, "memory", "This trail experience is likely to remain memorable to me.", "من المرجح أن تظل تجربة هذا المسار راسخة في ذاكرتي."),
  likert("MEM3", "MEM3", "memory", sections.memory, "memory", "I expect to remember specific heritage or sensory features from this trail.", "أتوقع أن أتذكر سمات تراثية أو حسية محددة من هذا المسار."),

  likert("SEC1", "SEC1", "security", sections.security, "security", "I felt safe throughout my walk along this trail.", "شعرت بالأمان طوال مشيي على طول هذا المسار."),
  likert("SEC2", "SEC2", "security", sections.security, "security", "I could walk along this trail without worrying about safety risks.", "تمكنت من المشي على طول هذا المسار دون القلق بشأن مخاطر السلامة."),
  likert("SEC3", "SEC3", "security", sections.security, "security", "I would feel safe walking this trail again under similar conditions.", "سأشعر بالأمان عند المشي في هذا المسار مرة أخرى في ظروف مماثلة."),

  likert("PI1", "PI1", "place_identity", sections.placeIdentity, "place_identity", "This trail is a special place to me.", "هذا المسار مكان مميز بالنسبة لي."),
  likert("PI2", "PI2", "place_identity", sections.placeIdentity, "place_identity", "I identify strongly with this trail and what it represents.", "أشعر بتماهٍ قوي مع هذا المسار وما يمثله."),
  likert("PI3", "PI3", "place_identity", sections.placeIdentity, "place_identity", "Being here says something about who I am or the places I value.", "وجودي هنا يعبّر عن شيء يتعلق بمن أكون أو بالأماكن التي أقدّرها."),

  likert("PD1", "PD1", "place_dependence", sections.placeDependence, "place_dependence", "This trail is a good place for the activities I want to do here.", "هذا المسار مكان جيد للأنشطة التي أرغب في القيام بها هنا."),
  likert("PD2", "PD2", "place_dependence", sections.placeDependence, "place_dependence", "For these activities, I would prefer this trail to other available places.", "بالنسبة لهذه الأنشطة، أفضل هذا المسار على الأماكن الأخرى المتاحة."),
  likert("PD3", "PD3", "place_dependence", sections.placeDependence, "place_dependence", "It would be difficult to find another place that provides the same experience for me.", "سيكون من الصعب العثور على مكان آخر يوفر لي التجربة نفسها."),
];

export const conditionalFoodQuestionIds = new Set(["G2", "G3", "G4", "G5"]);
