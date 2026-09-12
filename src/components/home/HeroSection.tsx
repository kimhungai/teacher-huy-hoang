import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Mail, ArrowRight, Award, FolderKanban } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { HeroSettings, Profile } from '../../types';

interface HeroSectionProps {
  hero: HeroSettings | null;
  profile: Profile | null;
}

const DEFAULT_TEACHER_AVATAR = 'https://ik.imagekit.io/hkh/OK_2.jpg?updatedAt=1787823395938';

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, profile }) => {
  const { t, language } = useLanguage();

  const name = language === 'vi' ? (profile?.fullName || 'Nguyễn Trọng Huy Hoàng') : (profile?.fullNameEn || profile?.fullName || 'Nguyen Trong Huy Hoang');
  const title = language === 'vi' ? profile?.titleVi : profile?.titleEn;
  const headline = language === 'vi' ? hero?.headlineVi : hero?.headlineEn;
  const subtitle = language === 'vi' ? hero?.subtitleVi : hero?.subtitleEn;

  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-28">
      {/* Subtle Educational Background Shapes */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-float-delayed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text Info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Teacher Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{title || t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {headline || t('hero.headline')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {subtitle || t('hero.subtitle')}
            </p>

            {/* Achievements & Projects Quick Nav Pills (Positions 2 & 3) */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/achievements"
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer group"
              >
                <Award className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>{t('hero.achievements')}</span>
              </Link>
              <Link
                to="/projects"
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer group"
              >
                <FolderKanban className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                <span>{t('hero.projects')}</span>
              </Link>
            </div>

            {/* CTA Buttons (Position 1: Explore Courses) */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 hover:shadow-sky-600/35 transition-all transform hover:-translate-y-0.5"
              >
                <span>{t('hero.ctaCourses')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100/80 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-sm border border-amber-200/80 dark:border-amber-500/30 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('hero.ctaResources')}</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100/80 dark:hover:bg-rose-500/30 text-rose-800 dark:text-rose-300 font-bold text-sm border border-rose-200/80 dark:border-rose-500/30 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{t('hero.ctaContact')}</span>
              </Link>
            </div>
          </div>

          {/* Right Column Teacher Portrait Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Card Framing */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500 to-amber-400 rounded-3xl opacity-20 blur-xl animate-pulse" />
              <div className="relative bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative group">
                  <img
                    src={hero?.avatarUrl || profile?.avatarUrl || DEFAULT_TEACHER_AVATAR}
                    alt="Teacher Nguyen Trong Huy Hoang"
                    className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
                    <h3 className="text-xl font-bold">{name}</h3>
                    <p className="text-xs text-sky-300 font-medium">{title || t('hero.badge')}</p>
                    <p className="text-[11px] text-slate-300 mt-2 italic line-clamp-2">
                      "{headline || (language === 'vi' ? profile?.brandMessageVi : profile?.brandMessageEn)}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
