"use client";

import { useLanguage } from "@/core/providers/languageProvider";
import enTranslations from "@/pkg/i18n/locales/en/common.json";
import idTranslations from "@/pkg/i18n/locales/id/common.json";

const translations: Record<string, any> = {
  en: enTranslations,
  id: idTranslations,
};

export const useTranslate = () => {
  const { currentLanguage } = useLanguage();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        return key;
      }
    }

    // Handle string interpolation (e.g., {{count}})
    if (typeof value === "string" && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return typeof value === "string" ? value : key;
  };

  return { t, currentLanguage };
};
