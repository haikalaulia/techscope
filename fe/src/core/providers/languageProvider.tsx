"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  defaultLanguage,
  Language,
  LANGUAGE_STORAGE_KEY,
  languages,
} from "@/configs/i18n.config";

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (newLang: Language) => void;
  languages: readonly Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(defaultLanguage);

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && languages.includes(saved)) {
      setCurrentLanguage(saved);
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    if (!languages.includes(newLang)) return;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    setCurrentLanguage(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, changeLanguage, languages }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
};
