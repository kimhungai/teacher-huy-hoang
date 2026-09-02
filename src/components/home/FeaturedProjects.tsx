import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, ArrowRight, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Project } from '../../types';
import { Badge } from '../common/Badge';

export const FeaturedProjects: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const { t, language } = useLanguage();

  const featured = projects.filter(p => p.isFeatured && p.isPublished).slice(0, 3);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold mb-2">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Dự Án Nổi Bật' : 'Teaching Highlights'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('home.featuredProjectsTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('home.featuredProjectsSub')}
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
          >
            <span>{t('home.viewAllProjects')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((item) => (
            <div
              key={item.id}
              className="group bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={item.thumbnailUrl}
                    alt={language === 'vi' ? item.titleVi : item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="sky">{item.grade}</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-400" />
                    <span>{item.year}</span>
                  </div>
                </div>

                <div className="p-6 text-left space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {item.categoryName}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                    {language === 'vi' ? item.titleVi : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 text-left">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/projects/${item.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                >
                  <span>{t('btn.viewDetails')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
