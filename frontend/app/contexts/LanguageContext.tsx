'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en' | 'vi-en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  vi: {
    welcome: 'Chào mừng',
    dashboard: 'Bảng điều khiển',
    ideas: 'Ý tưởng',
    briefs: 'Briefs',
    content: 'Nội dung',
    analytics: 'Phân tích',
    settings: 'Cài đặt',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    grid: 'Lưới',
    table: 'Bảng',
    generateIdea: 'Tạo ý tưởng',
    createBrief: 'Tạo brief',
    generateContent: 'Tạo nội dung',
    status: 'Trạng thái',
    format: 'Định dạng',
    industry: 'Ngành',
    persona: 'Persona',
    all: 'Tất cả',
    draft: 'Bản nháp',
    review: 'Đang xem xét',
    published: 'Đã xuất bản',
    generated: 'Đã tạo',
    shortlisted: 'Đã chọn lọc',
    approved: 'Đã phê duyệt',
    archived: 'Đã lưu trữ',
  },
  en: {
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    ideas: 'Ideas',
    briefs: 'Briefs',
    content: 'Content',
    analytics: 'Analytics',
    settings: 'Settings',
    search: 'Search',
    filter: 'Filter',
    grid: 'Grid',
    table: 'Table',
    generateIdea: 'Generate Idea',
    createBrief: 'Create Brief',
    generateContent: 'Generate Content',
    status: 'Status',
    format: 'Format',
    industry: 'Industry',
    persona: 'Persona',
    all: 'All',
    draft: 'Draft',
    review: 'Review',
    published: 'Published',
    generated: 'Generated',
    shortlisted: 'Shortlisted',
    approved: 'Approved',
    archived: 'Archived',
  },
  'vi-en': {
    welcome: 'Welcome / Chào mừng',
    dashboard: 'Dashboard / Bảng điều khiển',
    ideas: 'Ideas / Ý tưởng',
    briefs: 'Briefs',
    content: 'Content / Nội dung',
    analytics: 'Analytics / Phân tích',
    settings: 'Settings / Cài đặt',
    search: 'Search / Tìm kiếm',
    filter: 'Filter / Lọc',
    grid: 'Grid / Lưới',
    table: 'Table / Bảng',
    generateIdea: 'Generate Idea / Tạo ý tưởng',
    createBrief: 'Create Brief / Tạo brief',
    generateContent: 'Generate Content / Tạo nội dung',
    status: 'Status / Trạng thái',
    format: 'Format / Định dạng',
    industry: 'Industry / Ngành',
    persona: 'Persona',
    all: 'All / Tất cả',
    draft: 'Draft / Bản nháp',
    review: 'Review / Đang xem xét',
    published: 'Published / Đã xuất bản',
    generated: 'Generated / Đã tạo',
    shortlisted: 'Shortlisted / Đã chọn lọc',
    approved: 'Approved / Đã phê duyệt',
    archived: 'Archived / Đã lưu trữ',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('app-language');
        if (saved && ['vi', 'en', 'vi-en'].includes(saved)) {
          setLanguageState(saved as Language);
        }
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-language', lang);
      }
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Render with default language until mounted to avoid blank screen
  // This prevents hydration mismatch while keeping the UI visible
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
