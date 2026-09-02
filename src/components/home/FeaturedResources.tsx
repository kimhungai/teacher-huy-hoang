import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Download, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { TeachingResource } from '../../types';
import { Badge } from '../common/Badge';
import { DB } from '../../services/db';

export const FeaturedResources: React.FC<{ resources: TeachingResource[] }> = ({ resources }) => {
  const { t, language } = useLanguage();

  const featured = resources.filter(r => r.isPublished).slice(0, 4);

  const handleDownload = (res: TeachingResource) => {
    DB.incrementResourceDownload(res.id);
    window.open(res.fileUrl, '_blank');
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Kho Học Liệu Nổi Bật' : 'Teaching Materials'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('home.featuredResourcesTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('home.featuredResourcesSub')}
            </p>
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
          >
            <span>{t('home.viewAllResources')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left"
            >
              <div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 relative">
                  <img
                    src={item.previewUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600'}
                    alt={language === 'vi' ? item.titleVi : item.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="amber">{item.fileType}</Badge>
                    <Badge variant="sky">{item.grade}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {language === 'vi' ? item.titleVi : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {item.downloadCount} {language === 'vi' ? 'lượt tải' : 'downloads'}
                </span>
                <button
                  onClick={() => handleDownload(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('btn.download')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
