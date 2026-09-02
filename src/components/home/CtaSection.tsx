import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CtaSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-tr from-sky-900 via-slate-900 to-blue-950 text-white">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sky-300 text-xs font-bold backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{language === 'vi' ? 'Kết nối & Giao lưu' : 'Connect & Exchange'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
          {t('home.ctaTitle')}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('home.ctaDesc')}
        </p>
        <div className="pt-4">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40 transition-all transform hover:-translate-y-0.5"
          >
            <Mail className="w-4 h-4" />
            <span>{t('hero.ctaContact')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
