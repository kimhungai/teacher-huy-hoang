import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../services/db';
import type { BlogPost } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Newspaper, Search, ArrowRight, Clock, Calendar } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { getBlogCategoryLabel } from '../utils/blogUtils';

import { SEO } from '../components/common/SEO';

export const BlogPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const cached = localStorage.getItem('db_posts');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('db_posts');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    DB.getBlogPosts().then((res) => {
      setPosts(res);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Góc Chia Sẻ Chuyên Môn Sư Phạm & Phương Pháp Dạy Tiếng Anh Tiểu Học'
    : 'Pedagogical Insights & Primary English Teaching Strategies';

  const seoDesc = language === 'vi'
    ? 'Chuyên mục bài viết sư phạm, kinh nghiệm giảng dạy Tiếng Anh Tiểu học, ứng dụng công nghệ EdTech và bí quyết giúp trẻ hào hứng học tiếng Anh của Thầy Nguyễn Trọng Huy Hoàng.'
    : 'Pedagogical articles, primary English teaching insights, EdTech integration tips, and strategies to inspire young learners by Teacher Huy Hoang.';

  const categoryMap: Record<string, { vi: string; en: string }> = {
    'Teaching Tips': { vi: 'Mẹo Giảng Dạy', en: 'Teaching Tips' },
    'English Learning Tips': { vi: 'Kinh Nghiệm Học Tiếng Anh', en: 'English Learning Tips' },
    'Classroom Management': { vi: 'Quản Lý Lớp Học', en: 'Classroom Management' },
    'Educational Technology': { vi: 'Công Nghệ Giáo Dục', en: 'Educational Technology' },
    'AI in Education': { vi: 'Ứng Dụng AI Trong Giảng Dạy', en: 'AI in Education' },
    'Lesson Ideas': { vi: 'Ý Tưởng Bài Giảng', en: 'Lesson Ideas' },
    'Teaching Experiences': { vi: 'Trải Nghiệm Thực Tế', en: 'Teaching Experiences' },
    'Student Activities': { vi: 'Hoạt Động Học Sinh', en: 'Student Activities' }
  };

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { vi: string; en: string }>();
    posts.forEach((p) => {
      const key = p.categoryName;
      if (!map.has(key)) {
        const trans = categoryMap[key] || { vi: key, en: p.categoryEn || key };
        map.set(key, trans);
      }
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      label: language === 'vi' ? `${val.vi} (${key})` : val.en
    }));
  }, [posts, language]);

  const filteredPosts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return posts
      .filter((p) => p.status === 'published' || (p.status === 'scheduled' && p.scheduledDate && p.scheduledDate <= today))
      .filter((p) => {
        const matchesSearch =
          searchQuery === '' ||
          p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.excerptEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.excerptVi.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'all' || p.categoryName === selectedCategory;

        return matchesSearch && matchesCat;
      });
  }, [posts, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/blog"
        type="article"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/blog' }
        ]}
        keywords={language === 'vi'
          ? 'Bài viết sư phạm, Mẹo dạy tiếng Anh trẻ em, Kinh nghiệm giảng dạy tiểu học, EdTech trong lớp học'
          : 'Pedagogical Blog, Primary English Teaching Tips, EdTech Classroom'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Newspaper className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Góc Chia Sẻ Bài Viết' : 'Educational Blog'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi' ? 'Góc Chia Sẻ & Kinh Nghiệm Giáo Dục' : 'Educational Insights & Articles'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'vi'
              ? 'Phương pháp giảng dạy, mẹo quản lý lớp học, ứng dụng AI và câu chuyện truyền cảm hứng từ thầy Hoàng.'
              : 'Classroom strategies, gamification tips, AI tools integration, and personal primary education stories.'}
          </p>
        </div>

        {/* Search & Category Filter Dropdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('label.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-72 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="all">
                {language === 'vi' ? 'Tất cả chuyên mục' : 'All Categories'}
              </option>
              {categoryOptions.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <EmptyState onReset={() => setSelectedCategory('all')} resetText={t('btn.clearFilters')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={post.featuredImage}
                      alt={language === 'vi' ? post.titleVi : post.titleEn}
                      loading="lazy"
                      decoding="async"
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
        )}
      </div>
    </div>
  );
};
