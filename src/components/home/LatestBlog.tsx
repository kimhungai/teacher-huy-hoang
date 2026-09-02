import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { BlogPost } from '../../types';
import { Badge } from '../common/Badge';
import { getBlogCategoryLabel } from '../../utils/blogUtils';

export const LatestBlog: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  const { t, language } = useLanguage();
  const today = new Date().toISOString().split('T')[0];

  const visiblePosts = posts
    .filter(p => p.status === 'published' || (p.status === 'scheduled' && p.scheduledDate && p.scheduledDate <= today))
    .slice(0, 4);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
              <Newspaper className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Góc Chia Sẻ Bài Viết' : 'Educational Blog'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('home.latestBlogTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('home.latestBlogSub')}
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
          >
            <span>{t('home.viewAllBlog')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className="group bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={post.featuredImage}
                    alt={language === 'vi' ? post.titleVi : post.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="emerald">{getBlogCategoryLabel(post.categoryName, post.categoryEn, language)}</Badge>
                  </div>
                </div>

                <div className="p-6 text-left space-y-3">
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-500" />
                      {post.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {language === 'vi' ? post.readingTimeVi : post.readingTimeEn}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                    {language === 'vi' ? post.titleVi : post.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {language === 'vi' ? post.excerptVi : post.excerptEn}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 text-left">
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors"
                >
                  <span>{language === 'vi' ? 'Xem chi tiết' : 'View Details'}</span>
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
