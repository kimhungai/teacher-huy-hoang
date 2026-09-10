import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DB } from '../../services/db';
import type { SiteSettings } from '../../types';
import { ThemeToggle } from './ThemeToggle';
import { LangToggle } from './LangToggle';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    try {
      const cached = localStorage.getItem('db_site_settings');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const loadSettings = () => {
    DB.getSiteSettings().then(setSettings);
  };

  useEffect(() => {
    loadSettings();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('site-settings-updated', loadSettings);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('site-settings-updated', loadSettings);
    };
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/teaching', label: t('nav.teaching') },
    ...(settings?.showProjectsMenu !== false ? [{ path: '/projects', label: t('nav.projects') }] : []),
    { path: '/courses', label: t('nav.courses') },
    { path: '/resources', label: t('nav.resources') },
    ...(settings?.showBlogMenu !== false ? [{ path: '/blog', label: t('nav.blog') }] : []),
    ...(settings?.showAchievementsMenu !== false ? [{ path: '/achievements', label: t('nav.achievements') }] : []),
    ...(settings?.showGalleryMenu !== false ? [{ path: '/gallery', label: t('nav.gallery') }] : []),
    { path: '/contact', label: t('nav.contact') }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderLogoText = () => {
    const rawText = settings?.logoText || 'HUY HOÀNG';
    if (rawText.includes('/')) {
      const parts = rawText.split('/');
      return (
        <div className="text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 leading-none">
            {parts[0].trim()}
          </div>
          <div className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight mt-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {parts[1].trim()}
          </div>
        </div>
      );
    }

    return (
      <div className="text-left">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 leading-none">
          TEACHER
        </div>
        <div className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight mt-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {rawText}
        </div>
      </div>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Dynamic render */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 z-10">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
            )}
            {renderLogoText()}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-xs lg:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive(link.path)
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <LangToggle />
            <ThemeToggle />
          </div>

          {/* Mobile & Tablet Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-4 mt-2 space-y-2 shadow-xl animate-in slide-in-from-top duration-200 text-left">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive(link.path)
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
