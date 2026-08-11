import type { Question, QuestionOption, Trail, TrailImage } from "@/types/questionnaire";

export const STUDY_VERSION = "22.0.0-thesis-open-feedback";
export const STORAGE_KEY = "mpa_index_questionnaire_final_v22";

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
  identity: { en: "D4 · Heritage identity resonance", ar: "D4 · صدى الهوية التراثية" },
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
  likert("V2", "V2", "visual", sections.visual, "visual", "Buildings, signs, colors, and public-space elements form a coherent visual setting.", "تشكّل المباني واللافتات والألوان وعناصر الفضاء العام مشهداً بصرياً متماسكاً.", sensoryHelper),
  likert("V3", "V3", "visual", sections.visual, "visual", "Important heritage features and landmarks are easy to notice and recognize.", "من السهل ملاحظة السمات والمعالم التراثية المهمة والتعرّف إليها.", sensoryHelper),
  likert("V4", "V4", "visual", sections.visual, "visual", "The trail looks well cared for, without excessive clutter or deterioration.", "يبدو المسار معتنى به جيداً، من دون فوضى أو تدهور مفرط.", sensoryHelper),
  likert("V5", "V5", "visual", sections.visual, "visual", "Sunlight, shade, and shadow patterns enhance the appearance of this trail.", "تعزز أنماط ضوء الشمس والظل والظلال مظهر هذا المسار.", sensoryHelper),
  likert("V6", "V6", "visual", sections.visual, "visual", "Trees, planting, and other natural elements are well integrated into this trail's streetscape.", "تتكامل الأشجار والزراعة والعناصر الطبيعية الأخرى جيداً مع مشهد الشارع في هذا المسار.", sensoryHelper),

  likert("AUD1", "A1", "auditory", sections.auditory, "auditory", "The overall sound environment is pleasant.", "البيئة الصوتية العامة ممتعة.", sensoryHelper),
  likert("AUD2", "A2", "auditory", sections.auditory, "auditory", "The sounds present fit the heritage character of this place.", "تتناسب الأصوات الموجودة مع الطابع التراثي لهذا المكان.", sensoryHelper),
  likert("AUD3", "A3", "auditory", sections.auditory, "auditory", "Characteristic local sounds enrich the experience.", "تثري الأصوات المحلية المميزة التجربة.", sensoryHelper),
  likert("AUD4", "A4", "auditory", sections.auditory, "auditory", "The trail is largely free from disturbing traffic, horns, machinery, or other noise.", "المسار خالٍ إلى حد كبير من ضوضاء المرور المزعجة أو الأبواق أو الآلات أو غيرها من مصادر الضوضاء.", sensoryHelper),
  likert("AUD5", "A5", "auditory", sections.auditory, "auditory", "The everyday sounds of local life (conversation, commerce, activity) add positively to this trail.", "تضيف أصوات الحياة المحلية اليومية (المحادثات والتجارة والنشاط) بشكل إيجابي إلى هذا المسار.", sensoryHelper),
  likert("AUD6", "A6", "auditory", sections.auditory, "auditory", "Natural sounds (e.g., birds, wind, water) are noticeably present on this trail.", "الأصوات الطبيعية (مثل الطيور والرياح والماء) موجودة بشكل ملحوظ على هذا المسار.", sensoryHelper),

  likert("O1", "O1", "olfactory", sections.olfactory, "olfactory", "The overall smell environment is pleasant.", "البيئة الشمية العامة ممتعة.", sensoryHelper),
  likert("O2", "O2", "olfactory", sections.olfactory, "olfactory", "Characteristic local smells enrich the sense of place.", "تثري الروائح المحلية المميزة الإحساس بالمكان.", sensoryHelper),
  likert("O3", "O3", "olfactory", sections.olfactory, "olfactory", "The smells are appropriate to the heritage and everyday character of this place.", "تتناسب الروائح مع الطابع التراثي واليومي لهذا المكان.", sensoryHelper),
  likert("O4", "O4", "olfactory", sections.olfactory, "olfactory", "The trail is largely free from disturbing waste, drain, smoke, or exhaust odors.", "المسار خالٍ إلى حد كبير من روائح النفايات أو المصارف أو الدخان أو العوادم المزعجة.", sensoryHelper),

  likert("T1", "T1", "tactile", sections.tactile, "tactile", "The walking surfaces are physically comfortable.", "أسطح المشي مريحة جسدياً.", sensoryHelper),
  likert("T2", "T2", "tactile", sections.tactile, "tactile", "Traditional materials and textures strengthen the trail's heritage character.", "تعزز المواد والملامس التقليدية الطابع التراثي للمسار.", sensoryHelper),
  likert("T3", "T3", "tactile", sections.tactile, "tactile", "The walking surfaces are even and sufficiently maintained.", "أسطح المشي مستوية ومصانة بشكل كافٍ.", sensoryHelper),
  likert("T4", "T4", "tactile", sections.tactile, "tactile", "The materials and textures underfoot feel authentic to this heritage place.", "تبدو المواد والملامس تحت القدمين أصيلة بالنسبة لهذا المكان التراثي.", sensoryHelper),
  likert("T5", "T5", "tactile", sections.tactile, "tactile", "I can move along this trail smoothly, without physical obstructions or interruptions.", "يمكنني التحرك على طول هذا المسار بسلاسة، من دون عوائق أو انقطاعات جسدية.", sensoryHelper),

  likert("G1", "G1", "gustatory", sections.gustatory, "gustatory", "There were good opportunities to encounter local food or drink on or beside this trail.", "كانت هناك فرص جيدة لمصادفة طعام أو شراب محلي على هذا المسار أو بجانبه.", sensoryHelper),
  {
    id: "G_CONSUMED",
    displayCode: undefined,
    section: "gustatory",
    sectionLabel: sections.gustatory,
    type: "single_choice",
    required: true,
    label: { en: "Today, did you consume any food or drink obtained on or immediately beside this trail?", ar: "هل تناولت اليوم أي طعام أو شراب حصلت عليه من هذا المسار أو من مكان ملاصق له؟" },
    helper: { en: "If Yes, complete G2–G5. If No, the questionnaire will skip directly to the next section.", ar: "إذا كانت الإجابة نعم، أكمل G2–G5. وإذا كانت لا، سينتقل الاستبيان مباشرة إلى القسم التالي." },
    options: yesNoOptions,
    theme: "gustatory",
  },
  likert("G2", "G2", "gustatory", sections.gustatory, "gustatory", "The food or drink I tried had distinctive and authentic local flavors.", "كان للطعام أو الشراب الذي جربته نكهات محلية مميزة وأصيلة.", sensoryHelper),
  likert("G3", "G3", "gustatory", sections.gustatory, "gustatory", "Trying the food or drink helped me experience Madaba's local culture.", "ساعدني تجربة الطعام أو الشراب على اختبار الثقافة المحلية لمادبا.", sensoryHelper),
  likert("G4", "G4", "gustatory", sections.gustatory, "gustatory", "The food or drink I tried was of high sensory quality (taste, freshness, presentation).", "كان الطعام أو الشراب الذي جربته ذا جودة حسية عالية (الطعم، الطزاجة، التقديم).", sensoryHelper),
  likert("G5", "G5", "gustatory", sections.gustatory, "gustatory", "The food and drink available reflected a diverse and representative range of Madaba's local cuisine.", "عكس الطعام والشراب المتاحان تنوعاً وتمثيلاً مناسباً للمطبخ المحلي في مادبا.", sensoryHelper),

  likert("CTX1", "CTX1", "contextual", sections.contextual, "contextual", "Overall, the temperature, sun, shade, and airflow are comfortable for walking now.", "بشكل عام، درجة الحرارة والشمس والظل وتدفق الهواء مريحة للمشي الآن.", contextHelper),
  likert("CTX2", "CTX2", "contextual", sections.contextual, "contextual", "The presence and everyday activities of local people add positively to this trail.", "يضيف وجود السكان المحليين وأنشطتهم اليومية بشكل إيجابي إلى هذا المسار.", contextHelper),

  likert("SAT1", "SAT1", "satisfaction", sections.satisfaction, "satisfaction", "Overall, I am satisfied with my experience on this trail.", "بشكل عام، أنا راضٍ عن تجربتي في هذا المسار."),
  likert("SAT2", "SAT2", "satisfaction", sections.satisfaction, "satisfaction", "Walking on this trail has been worthwhile.", "كان المشي في هذا المسار تجربة تستحق الوقت والجهد."),

  likert("MEM1", "MEM1", "memory", sections.memory, "memory", "This trail brings Madaba's stories, traditions, or history to mind.", "يستحضر هذا المسار في ذهني قصص مادبا أو تقاليدها أو تاريخها."),
  likert("MEM2", "MEM2", "memory", sections.memory, "memory", "My experience on this trail is likely to remain memorable.", "من المرجح أن تبقى تجربتي في هذا المسار عالقة في الذاكرة."),

  likert("SEC1", "SEC1", "security", sections.security, "security", "I feel personally safe while walking on this trail.", "أشعر بالأمان الشخصي أثناء المشي في هذا المسار."),
  likert("SEC2", "SEC2", "security", sections.security, "security", "I feel adequately protected from moving vehicles and other traffic risks.", "أشعر بأنني محمي بشكل كافٍ من المركبات المتحركة ومخاطر المرور الأخرى."),

  likert("ID1", "ID1", "identity", sections.identity, "identity", "This trail clearly expresses Madaba's distinctive cultural identity.", "يعبّر هذا المسار بوضوح عن الهوية الثقافية المميزة لمادبا."),
  likert("ID2", "ID2", "identity", sections.identity, "identity", "The heritage represented on this trail feels personally or culturally meaningful to me.", "يبدو التراث المتمثل في هذا المسار ذا معنى شخصي أو ثقافي بالنسبة لي."),

  likert("PI1", "PI1", "place_identity", sections.placeIdentity, "place_identity", "This trail is a special place to me.", "هذا المسار مكان مميز بالنسبة لي."),
  likert("PI2", "PI2", "place_identity", sections.placeIdentity, "place_identity", "I identify strongly with this trail and what it represents.", "أشعر بتماهٍ قوي مع هذا المسار وما يمثله."),
  likert("PI3", "PI3", "place_identity", sections.placeIdentity, "place_identity", "Being here says something about who I am or the places I value.", "وجودي هنا يعبّر عن شيء يتعلق بمن أكون أو بالأماكن التي أقدّرها."),

  likert("PD1", "PD1", "place_dependence", sections.placeDependence, "place_dependence", "This trail is a good place for the activities I want to do here.", "هذا المسار مكان جيد للأنشطة التي أرغب في القيام بها هنا."),
  likert("PD2", "PD2", "place_dependence", sections.placeDependence, "place_dependence", "For these activities, I would prefer this trail to other available places.", "بالنسبة لهذه الأنشطة، أفضل هذا المسار على الأماكن الأخرى المتاحة."),
  likert("PD3", "PD3", "place_dependence", sections.placeDependence, "place_dependence", "It would be difficult to find another place that provides the same experience for me.", "سيكون من الصعب العثور على مكان آخر يوفر لي التجربة نفسها."),
];

export const conditionalFoodQuestionIds = new Set(["G2", "G3", "G4", "G5"]);
