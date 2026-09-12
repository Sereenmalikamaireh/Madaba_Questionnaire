export type Language = "en" | "ar";

export type BilingualText = {
  en: string;
  ar: string;
};

export type QuestionOption = {
  value: string;
  label: BilingualText;
};

export type QuestionTheme =
  | "profile"
  | "visual"
  | "auditory"
  | "olfactory"
  | "tactile"
  | "gustatory"
  | "contextual"
  | "satisfaction"
  | "memory"
  | "security"
  | "place_identity"
  | "place_dependence";

export type QuestionType = "single_choice" | "likert";

export type Question = {
  id: string;
  displayCode?: string;
  section: string;
  sectionLabel: BilingualText;
  type: QuestionType;
  required: boolean;
  label: BilingualText;
  options: QuestionOption[];
  theme: QuestionTheme;
  helper?: BilingualText;
  reverseScored?: boolean;
};

export type Trail = {
  id: string;
  number: number;
  name: BilingualText;
  descriptor: BilingualText;
  imageFolder: string;
};

export type TrailImage = {
  id: string;
  trailId: string;
  src: string;
  label: BilingualText;
  metadata: {
    latitude: number | null;
    longitude: number | null;
    captureDate: string | null;
    orientationDeg: number | null;
    checksum: string | null;
    note: string;
  };
};

export type FeatureMarker = {
  id: string;
  x: number;
  y: number;
};
