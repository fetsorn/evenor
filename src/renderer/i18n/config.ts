import { use } from "i18next";
import en from "./en/translation.json";
import ru from "./ru/translation.json";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
} as const;

use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    detection: {
      order: ["navigator"],
    },
    resources,
  });
