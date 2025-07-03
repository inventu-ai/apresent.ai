"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Language, translations, Translations } from '@/lib/i18n/translations';
import { getUserProfile } from '@/app/_actions/profile/updateProfile';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>('pt-BR');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's preferred language from database
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (session?.user?.id) {
        try {
          const result = await getUserProfile(session.user.id);
          if (result.success && result.user?.language) {
            const userLang = result.user.language as Language;
            // Validate that the language is supported
            if (translations[userLang]) {
              setLanguageState(userLang);
            }
          }
        } catch (error) {
          console.error('Error loading user language:', error);
          // Fall back to browser language or default
          const browserLang = getBrowserLanguage();
          setLanguageState(browserLang);
        }
      } else {
        // If no user session, try to get from browser
        const browserLang = getBrowserLanguage();
        setLanguageState(browserLang);
      }
      setIsLoading(false);
    };

    loadUserLanguage();
  }, [session?.user?.id]);

  // Function to get browser language and map to supported languages
  const getBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'pt-BR';
    
    const browserLang = navigator.language || navigator.languages?.[0] || 'pt-BR';
    
    // Map browser language to supported languages
    if (browserLang.startsWith('en')) return 'en-US';
    if (browserLang.startsWith('es')) return 'es-ES';
    if (browserLang.startsWith('pt')) return 'pt-BR';
    
    // Default to Portuguese (Brazil)
    return 'pt-BR';
  };

  const setLanguage = (lang: Language) => {
    // Ensure the language is valid
    if (!translations[lang]) {
      console.error(`Invalid language: ${lang}`);
      return;
    }
    
    // Update the language state
    setLanguageState(lang);
    
    // Log for debugging
    console.log(`Language changed to: ${lang}`);
    
    // If user is logged in, we'll handle database update in the profile settings component
    // This is just to update the local state immediately
  };

  const currentTranslations = translations[language] || translations['pt-BR'];

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: currentTranslations,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for easier access to translations
export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
