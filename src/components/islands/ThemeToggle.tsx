import { useEffect, useState } from 'react';
import { t } from '@/i18n/index';
import type { Lang } from '@/i18n/config';

interface Props {
  lang: Lang;
}

const STORAGE_KEY = 'formulo:theme:v1';

export default function ThemeToggle({ lang }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let initial: 'light' | 'dark' = 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initial = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    } catch {
      initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // stockage indisponible : l'appli reste utilisable
    }
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
  };

  useEffect(() => {
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<{ theme: string }>;
      if (ce.detail.theme !== theme) setTheme(ce.detail.theme as 'light' | 'dark');
    };
    window.addEventListener('theme-change', onChange);
    return () => window.removeEventListener('theme-change', onChange);
  }, [theme]);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={t(lang, 'theme.toggle')}
      title={isDark ? t(lang, 'theme.light') : t(lang, 'theme.dark')}
      className="rounded-md p-2 text-text hover:bg-surface-2 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-[2px]"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      <span className="sr-only">{isDark ? t(lang, 'theme.light') : t(lang, 'theme.dark')}</span>
    </button>
  );
}