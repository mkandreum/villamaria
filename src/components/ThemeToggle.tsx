import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'vm-theme';

const readInitial = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'light'; // light by default; dark only when the visitor picks it
};

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(readInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0c1a17' : '#1B3B36');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="fixed right-3 top-[calc(env(safe-area-inset-top)+48px)] md:top-auto md:right-auto md:left-6 md:bottom-6 z-40 w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#1B3B36]/85 text-white backdrop-blur-md shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
