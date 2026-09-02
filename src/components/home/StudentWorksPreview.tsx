import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, UserX, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { StudentWork } from '../../types';
import { Badge } from '../common/Badge';

export const StudentWorksPreview: React.FC<{ works: StudentWork[] }> = ({ works }) => {
  const { t, language } = useLanguage();

  const publicWorks = works
    .filter(w => w.isPublished && w.privacyMode !== 'private')
    .slice(0, 3);

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Sản Phẩm Học Viên' : 'Student Creations'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('home.studentWorksTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('home.studentWorksSub')}
            </p>
          </div>
          <Link
            to="/student-works"
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
          >
            <span>{t('home.viewAllStudentWorks')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {publicWorks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left"
            >
              <div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 relative">
                  <img
                    src={item.imageUrl}
                    alt={language === 'vi' ? item.titleVi : item.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="indigo">{item.category}</Badge>
                    <Badge variant="sky">{item.grade}</Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                    {item.privacyMode === 'anonymous' && (
                      <>
                        <UserX className="w-3 h-3 text-amber-400" />
                        <span>{language === 'vi' ? 'Ẩn danh' : 'Anonymous'}</span>
                      </>
                    )}
                    {item.privacyMode === 'group' && (
                      <>
                        <Users className="w-3 h-3 text-sky-400" />
                        <span>{language === 'vi' ? 'Dự án nhóm' : 'Group Work'}</span>
                      </>
                    )}
                    {item.privacyMode === 'public' && (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{item.studentName || 'Student'}</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {language === 'vi' ? item.titleVi : item.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
