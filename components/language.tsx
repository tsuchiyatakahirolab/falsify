"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/product/content";

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: "ja", setLocale: () => undefined });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ja");
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return {
    ...context,
    t: (en: string, ja: string) => (context.locale === "ja" ? ja : en),
  };
}
