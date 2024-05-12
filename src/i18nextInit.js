import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEN from "./assets/locals/en/translation.json";
import translationES from "./assets/locals/es/translation.json";
import translationZH from "./assets/locals/zh/translation.json";

const fallbackLng = ["en"];
const availableLanguages = ["en", "es", "zh"];

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  zh: {
    translation: translationZH,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    lng: "en",
    detection: {
      checkWhitelist: true,
    },

    debug: false,

    whitelist: availableLanguages,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
