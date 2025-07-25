import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { languages, defaultLang, LanguageCode } from '../i18n/languages';

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): LanguageCode => {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('language') as LanguageCode;
        if (storedLang && languages[storedLang]) {
            return storedLang;
        }
        const browserLang = navigator.language.split('-')[0] as LanguageCode;
        if (languages[browserLang]) {
            return browserLang;
        }
    }
    return defaultLang;
};


export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleSetLanguage = useCallback((lang: LanguageCode) => {
    if (languages[lang]) {
      setLanguage(lang);
    }
  }, []);

  const t = useCallback((key: TranslationKey, replacements: Record<string, string | number> = {}) => {
    const langTranslations = translations[language] || translations[defaultLang];
    let translation = langTranslations[key] || translations[defaultLang][key] || key;
    
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
    });

    return translation;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
  }), [language, handleSetLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
