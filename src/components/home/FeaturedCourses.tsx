import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Clock, Gift, CreditCard, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Course } from '../../types';

export const FeaturedCourses: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const { t, language } = useLanguage();
  const featured = courses.filter(c => c.isPublished).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              {language === 'vi' ? 'Khóa Học Nổi Bật' : 'Featured Courses'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('home.featuredCoursesTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {t('home.featuredCoursesSub')}
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 font-bold text-sm group shrink-0"
          >
            <span>{t('home.viewAllCourses')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((c) => {
            const discountPrice = language === 'vi' ? c.discountPriceVi : c.discountPriceEn;
            const hasDiscount = c.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

            return (
              <div
                key={c.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 text-left relative"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={c.thumbnailUrl}
                      alt={language === 'vi' ? c.titleVi : c.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    
                    {/* Price Tag Badge (Mũi tên 4) */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
                      {c.priceType === 'free' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                          <Gift className="w-3.5 h-3.5" />
                          {t('course.free')}
                        </span>
                      ) : hasDiscount ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-black shadow-xl ring-2 ring-rose-400/40">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
                            {discountPrice}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] line-through font-semibold border border-white/10">
                            {language === 'vi' ? c.priceVi : c.priceEn}
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                          <CreditCard className="w-3.5 h-3.5" />
                          {language === 'vi' ? c.priceVi : c.priceEn}
                        </span>
                      )}
                    </div>

                    {/* Top Right Sale Tag */}
                    {hasDiscount && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg border border-rose-400/40 animate-pulse">
                          {language === 'vi' ? 'KM ĐẶC BIỆT' : 'HOT SALE'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {c.categoryName} • {c.gradeLevel}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                      {language === 'vi' ? c.titleVi : c.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {language === 'vi' ? c.descriptionVi : c.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>{language === 'vi' ? c.durationVi : c.durationEn}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="p-6 pt-0">
                  <Link
                    to={`/courses/${c.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
                  >
                    <span>{t('btn.viewDetails')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
