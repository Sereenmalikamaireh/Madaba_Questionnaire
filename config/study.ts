import type { Question, QuestionOption, Trail, TrailImage } from "@/types/questionnaire";

export const STUDY_VERSION = "24.0.0-final-grouped-image-clicks";
export const STORAGE_KEY = "mpa_index_questionnaire_final_v24";

export const likertAgreementOptions: QuestionOption[] = [
  { value: "1", label: { en: "Strongly disagree", ar: "لا أوافق بشدة" } },
  { value: "2", label: { en: "Disagree", ar: "لا أوافق" } },
  { value: "3", label: { en: "Neutral", ar: "محايد" } },
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
    label: { en: "Please identify which trail you are evaluating.", ar: "المسار" },
    helper: standardHelper,
    theme: "profile",
    options: trails.map((trail) => ({ value: trail.id, label: trail.name })),
  },
  choice("P2", "A1", "profile", sections.profile, "Status", "فئة المستخدم", [
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
  choice("P5", "A4", "profile", sections.profile, "Previous use of this trail", "عدد مرات استخدامك السابق لهذا المسار", [
    { value: "first_visit", label: { en: "First visit", ar: "الزيارة الأولى" } },
    { value: "2_5_visits", label: { en: "2-5 visits", ar: "2-5 زيارات" } },
    { value: "6_plus_visits", label: { en: "6+ visits", ar: "6 زيارات أو أكثر" } },
    { value: "monthly", label: { en: "Monthly", ar: "شهرياً" } },
    { value: "weekly_plus", label: { en: "Weekly+", ar: "أسبوعياً أو أكثر" } },
  ]),
  choice("P6", "A5", "profile", sections.profile, "Main purpose today", "الغرض الرئيس اليوم", [
    { value: "sightseeing", label: { en: "Sightseeing", ar: "زيارة / مشاهدة المعالم" } },
    { value: "shopping_services", label: { en: "Shopping/services", ar: "التسوق / الخدمات" } },
    { value: "work_study", label: { en: "Work/study", ar: "العمل / الدراسة" } },
    { value: "social_family", label: { en: "Social/family", ar: "اجتماعي / عائلي" } },
    { value: "passing_through", label: { en: "Passing through", ar: "المرور عبر المسار" } },
  ]),
  choice("P7", "A6", "profile", sections.profile, "Walking with", "مع مَن تمشي؟ اختر كل ما ينطبق", [
    { value: "alone", label: { en: "Alone", ar: "بمفردي" } },
    { value: "adults_only", label: { en: "Adults only", ar: "بالغون فقط" } },
    { value: "children", label: { en: "Child/children", ar: "طفل / أطفال" } },
    { value: "organized_tour", label: { en: "Organized tour group", ar: "مجموعة سياحية منظمة" } },
  ]),
  choice("P8", "A7", "profile", sections.profile, "Time spent on this trail today", "الوقت الذي قضيته في هذا المسار اليوم", [
    { value: "10_19", label: { en: "10–19 min", ar: "10–19 دقيقة" } },
    { value: "20_39", label: { en: "20–39 min", ar: "20–39 دقيقة" } },
    { value: "40_59", label: { en: "40–59 min", ar: "40–59 دقيقة" } },
    { value: "60_plus", label: { en: "60+ min", ar: "60 دقيقة أو أكثر" } },
  ]),

  likert("V1", "V1", "visual", sections.visual, "visual", "Heritage landmarks were easy to see, and the trail's layout was easy to understand.", "كان من السهل رؤية المعالم التراثية، وكان من السهل فهم تخطيط المسار.", sensoryHelper),
  likert("V2", "V2", "visual", sections.visual, "visual", "The quality of light and shade enhanced my visual experience of the trail.", "عزّزت جودة الإضاءة والظل تجربتي البصرية في المسار.", sensoryHelper),
  likert("V3", "V3", "visual", sections.visual, "visual", "Natural elements, such as trees and plants, were visibly present and well integrated into the trail.", "كانت العناصر الطبيعية، مثل الأشجار والنباتات، ظاهرة بوضوح ومندمجة جيدًا في المسار.", sensoryHelper),
  likert("V4", "V4", "visual", sections.visual, "visual", "Buildings, signs, colours, and public spaces formed a visually coherent scene that suited Madaba's local heritage character.", "شكّلت المباني واللافتات والألوان والأماكن العامة مشهدًا متناسقًا بصريًا يلائم الطابع التراثي المحلي لمادبا.", sensoryHelper),
  likert("V5", "V5", "visual", sections.visual, "visual", "Visible heritage buildings and materials appeared authentic and well preserved.", "بدت المباني والمواد التراثية الظاهرة أصيلة ومحفوظة جيدًا.", sensoryHelper),
  likert("V6", "V6", "visual", sections.visual, "visual", "My view of the trail was free from intrusive visual clutter, such as excessive signs, wires, vehicles, or unrelated objects.", "كان المشهد على طول المسار خاليًا من عناصر التشويش البصري المزعجة، مثل كثرة اللافتات أو الأسلاك أو المركبات أو العناصر غير المرتبطة بالمكان.", sensoryHelper),

  likert("AUD1", "A1", "auditory", sections.auditory, "auditory", "Overall, the sound environment along this trail was pleasant.", "بوجه عام، كانت البيئة الصوتية على طول هذا المسار ممتعة.", sensoryHelper),
  likert("AUD2", "A2", "auditory", sections.auditory, "auditory", "The sounds I heard were appropriate to the setting and activities along the trail.", "كانت الأصوات التي سمعتها ملائمة للمكان والأنشطة على طول المسار.", sensoryHelper),
  likert("AUD3", "A3", "auditory", sections.auditory, "auditory", "Sounds associated with Madaba's local culture and heritage enriched my experience.", "أغنت الأصوات المرتبطة بثقافة مادبا المحلية وتراثها تجربتي.", sensoryHelper),
  likert("AUD4", "A4", "auditory", sections.auditory, "auditory", "Everyday human sounds, such as conversation, footsteps, and local activity, contributed positively to my experience.", "أسهمت الأصوات البشرية اليومية، مثل الحديث وخطوات المشاة والنشاط المحلي، بصورة إيجابية في تجربتي.", sensoryHelper),
  likert("AUD5", "A5", "auditory", sections.auditory, "auditory", "A variety of natural sounds, such as birds and wind, was noticeable along the trail.", "كان من الملحوظ وجود تنوع في الأصوات الطبيعية، مثل أصوات الطيور والرياح، على طول المسار.", sensoryHelper),
  likert("AUD6", "A6", "auditory", sections.auditory, "auditory", "Traffic and mechanical sounds did not disturb my experience of the trail.", "لم تُزعجني أصوات حركة المرور والأصوات الميكانيكية أثناء تجربتي في المسار.", sensoryHelper),

  likert("O1", "O1", "olfactory", sections.olfactory, "olfactory", "Overall, the smell environment along this trail was pleasant.", "بوجه عام، كانت الروائح المحيطة على طول هذا المسار ممتعة.", sensoryHelper),
  likert("O2", "O2", "olfactory", sections.olfactory, "olfactory", "Odours characteristic of Madaba's local culture and everyday life enriched my experience.", "أغنت الروائح المميزة لثقافة مادبا المحلية وحياتها اليومية تجربتي.", sensoryHelper),
  likert("O3", "O3", "olfactory", sections.olfactory, "olfactory", "The odours I encountered were appropriate to the setting and activities along the trail.", "كانت الروائح التي صادفتها ملائمة للمكان والأنشطة على طول المسار.", sensoryHelper),

  likert("T1", "T1", "tactile", sections.tactile, "tactile", "The materials and surfaces along the trail had a noticeable tactile character when I walked or touched them.", "كان للمواد والأسطح على طول المسار طابع لمسي واضح أثناء المشي عليها أو لمسها.", sensoryHelper),
  likert("T2", "T2", "tactile", sections.tactile, "tactile", "The ground surface felt comfortable and sufficiently even underfoot.", "شعرت بأن سطح الأرض مريح ومستوي بما يكفي أثناء المشي.", sensoryHelper),
  likert("T3", "T3", "tactile", sections.tactile, "tactile", "I could move easily and continuously along the trail without physical obstructions.", "تمكنت من الحركة بسهولة ودون انقطاع على طول المسار من غير عوائق مادية.", sensoryHelper),
  likert("T4", "T4", "tactile", sections.tactile, "tactile", "The textures of heritage materials felt authentic to Madaba's local character.", "شعرت بأن ملمس المواد التراثية أصيل ويتوافق مع الطابع المحلي لمادبا.", sensoryHelper),

  likert("G1", "G1", "gustatory", sections.gustatory, "gustatory", "The food or drink I consumed had flavours that felt authentic to Madaba.", "كانت نكهات الطعام أو الشراب الذي تناولته أصيلة ومرتبطة بمادبا.", sensoryHelper),
  {
    id: "G_CONSUMED",
    displayCode: undefined,
    section: "gustatory",
    sectionLabel: sections.gustatory,
    type: "single_choice",
    required: true,
    label: { en: "Did you consume any food or drink obtained on or immediately beside this trail today?", ar: "هل تناولت اليوم أي طعام أو شراب حصلت عليه من هذا المسار أو من مكان ملاصق له مباشرة؟" },
    helper: { en: "If Yes, complete G1 and G2 below. If No, skip to Section C.", ar: "إذا كانت الإجابة نعم، أكمل البندين G1 وG2 أدناه. وإذا كانت الإجابة لا، انتقل إلى القسم ج." },
    options: yesNoOptions,
    theme: "gustatory",
  },
  likert("G2", "G2", "gustatory", sections.gustatory, "gustatory", "The food or drink experience helped me connect with Madaba's local culture.", "ساعدتني تجربة الطعام أو الشراب على الشعور بالارتباط بالثقافة المحلية لمادبا.", sensoryHelper),

  likert("MIC1", "MIC1", "contextual", sections.contextual, "contextual", "The level of heat or coolness felt comfortable during my walk.", "كان مستوى الحرارة أو البرودة مريحًا أثناء مشيي.", contextHelper),
  likert("MIC2", "MIC2", "contextual", sections.contextual, "contextual", "The amount of shade available was comfortable for my walk.", "كان مقدار الظل المتاح مريحًا أثناء مشيي.", contextHelper),
  likert("MIC3", "MIC3", "contextual", sections.contextual, "contextual", "The wind or airflow felt comfortable during my walk.", "كانت الرياح أو حركة الهواء مريحة أثناء مشيي.", contextHelper),
  likert("MIC4", "MIC4", "contextual", sections.contextual, "contextual", "The humidity level felt comfortable during my walk.", "كان مستوى الرطوبة مريحًا أثناء مشيي.", contextHelper),
  likert("SOC1", "SOC1", "contextual", sections.contextual, "contextual", "The level of crowding felt comfortable during my walk.", "شعرت بالارتياح تجاه مستوى الازدحام أثناء مشيي.", contextHelper),
  likert("SOC2", "SOC2", "contextual", sections.contextual, "contextual", "Everyday activities and interactions among local people added positively to my experience.", "أضافت الأنشطة اليومية والتفاعلات بين السكان المحليين جانبًا إيجابيًا إلى تجربتي.", contextHelper),

  likert("SAT1", "SAT1", "satisfaction", sections.satisfaction, "satisfaction", "Overall, I was satisfied with my experience along this trail.", "بوجه عام، شعرت بالرضا عن تجربتي على طول هذا المسار."),
  likert("SAT2", "SAT2", "satisfaction", sections.satisfaction, "satisfaction", "Walking along this trail was worthwhile.", "كان المشي على طول هذا المسار تجربة تستحق العناء."),
  likert("SAT3", "SAT3", "satisfaction", sections.satisfaction, "satisfaction", "The experience along this trail met my expectations for a heritage walking experience.", "لبّت تجربتي على طول هذا المسار توقعاتي بشأن تجربة المشي في مسار تراثي."),

  likert("MEM1", "MEM1", "memory", sections.memory, "memory", "Walking along this trail brought Madaba’s stories, traditions or history to mind.", "أثار المشي على طول هذا المسار في ذهني قصص مادبا أو تقاليدها أو تاريخها."),
  likert("MEM2", "MEM2", "memory", sections.memory, "memory", "This trail experience is likely to remain memorable to me.", "من المرجح أن تبقى تجربة هذا المسار عالقة في ذاكرتي."),
  likert("MEM3", "MEM3", "memory", sections.memory, "memory", "I expect to remember specific heritage or sensory features from this trail.", "أتوقع أن أتذكر عناصر تراثية أو حسية محددة من هذا المسار."),

  likert("SEC1", "SEC1", "security", sections.security, "security", "I felt safe throughout my walk along this trail.", "شعرت بالأمان طوال فترة مشيي على طول هذا المسار."),
  likert("SEC2", "SEC2", "security", sections.security, "security", "I could walk along this trail without worrying about safety risks.", "تمكنت من المشي على طول هذا المسار دون القلق بشأن مخاطر تتعلق بسلامتي."),
  likert("SEC3", "SEC3", "security", sections.security, "security", "I would feel safe walking this trail again under similar conditions.", "سأشعر بالأمان إذا مشيت في هذا المسار مرة أخرى في ظروف مماثلة."),

  likert("PI1", "PI1", "place_identity", sections.placeIdentity, "place_identity", "This trail is a special place to me.", "يمثل هذا المسار مكانًا مميزًا بالنسبة لي."),
  likert("PI2", "PI2", "place_identity", sections.placeIdentity, "place_identity", "I identify strongly with this trail and what it represents.", "أشعر بارتباط قوي بهذا المسار وبما يمثله."),
  likert("PI3", "PI3", "place_identity", sections.placeIdentity, "place_identity", "Being here says something about who I am or the places I value.", "وجودي هنا يعكس شيئًا عن هويتي أو عن الأماكن التي أقدّرها."),

  likert("PD1", "PD1", "place_dependence", sections.placeDependence, "place_dependence", "This trail is a good place for the activities I want to do here.", "هذا المسار مكان مناسب للأنشطة التي أرغب في القيام بها هنا."),
  likert("PD2", "PD2", "place_dependence", sections.placeDependence, "place_dependence", "For these activities, I would prefer this trail to other available places.", "بالنسبة إلى هذه الأنشطة، أفضل هذا المسار على الأماكن الأخرى المتاحة."),
  likert("PD3", "PD3", "place_dependence", sections.placeDependence, "place_dependence", "It would be difficult to find another place that provides the same experience for me.", "سيكون من الصعب العثور على مكان آخر يوفر لي التجربة نفسها."),
];

export const conditionalFoodQuestionIds = new Set(["G2", "G3", "G4", "G5"]);
