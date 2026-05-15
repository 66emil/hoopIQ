import React, { createContext, useContext, useState } from 'react';
import { STRINGS, Lang } from '../i18n';

type LocalizationCtx = {
  t: (key: string) => string;
  language: Lang;
  setLanguage: (l: Lang) => void;
};

const LocalizationContext = createContext<LocalizationCtx>({
  t: k => k,
  language: 'en',
  setLanguage: () => {},
});

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLang] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'en',
  );

  const setLanguage = (l: Lang) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: string): string =>
    STRINGS[language]?.[key] ?? STRINGS.en[key] ?? key;

  return React.createElement(
    LocalizationContext.Provider,
    { value: { t, language, setLanguage } },
    children,
  );
};

export const useLocalization = () => useContext(LocalizationContext);
export type { Lang };
