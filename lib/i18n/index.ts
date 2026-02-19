// Copyright © Knoux. All rights reserved.
import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";

export type Language = "en" | "ar" | "fr";

export const translations = {
  en,
  ar,
  fr,
};

export const getTranslation = (language: Language) => {
  return translations[language] || translations.en;
};

export const isArabic = (language: Language) => language === "ar";
export const isEnglish = (language: Language) => language === "en";
