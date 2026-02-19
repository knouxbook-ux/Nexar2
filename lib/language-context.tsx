// Copyright © Knoux. All rights reserved.
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language, getTranslation } from "./i18n";
import { I18nManager } from "react-native";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: ReturnType<typeof getTranslation>;
  isArabic: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        const lang = (savedLanguage as Language) || "en";
        setLanguageState(lang);
        applyLanguage(lang);
      } catch (error) {
        console.error("Failed to load language:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  const applyLanguage = (lang: Language) => {
    // Set RTL for Arabic
    const isRTL = lang === "ar";
    I18nManager.forceRTL(isRTL);
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      applyLanguage(newLanguage);
      await AsyncStorage.setItem("appLanguage", newLanguage);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: getTranslation(language),
    isArabic: language === "ar",
    isEnglish: language === "en",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
