import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../services/db';
import type { TeachingResource } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, BookOpen, ArrowRight, Gift, CreditCard, Layers, Laptop, Volume2, Puzzle } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

import { SEO } from '../components/common/SEO';

export const ResourcesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [resources, setResources] = useState<TeachingResource[]>(() => {
    try {
      const cached = localStorage.getItem('db_resources_v3') || localStorage.getItem('db_resources');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('db_resources_v3') || localStorage.getItem('db_resources');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceType, setSelectedPriceType] = useState('all');

  useEffect(() => {
    DB.getResources().then((data) => {
      setResources(data);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Kho Giáo Cụ & Học Liệu Số Tiếng Anh Tiểu Học (PDF, Flashcards, Apps, Sound Kit)'
    : 'English Primary Teaching Materials & Digital EdTech Resources';

  const seoDesc = language === 'vi'
    ? 'Kho tài nguyên học liệu số Tiếng Anh tiểu học phong phú do Thầy Nguyễn Trọng Huy Hoàng biên soạn: File PDF in ấn, Flashcards Phonics, Phần mềm tương tác, Rối tay & Giáo cụ học tập.'
    : 'Rich collection of primary English teaching materials by Teacher Huy Hoang: Printable PDFs, Phonics flashcards, Interactive apps, Hand puppets & EdTech tools.';

  const resourceSchemas = resources.filter(r => r.isPublished).map(r => ({
    '@type': 'Product',
    'name': language === 'vi' ? r.titleVi : r.titleEn,
    'description': language === 'vi' ? r.descriptionVi : r.descriptionEn,
    'image': r.previewUrl,
    'offers': {
      '@type': 'Offer',
      'price': r.priceType === 'free' ? '0' : (r.discountPriceVi || r.priceVi || '0'),
      'priceCurrency': 'VND',
      'availability': 'https://schema.org/InStock'
    }
  }));

  const categories = useMemo(() => {
    const map = new Map<string, { vi: string; en: string }>();
    resources.forEach((r) => {
      const key = r.categoryName;
      if (!map.has(key)) {
        map.set(key, { vi: r.categoryName, en: r.categoryEn || r.categoryName });
      }
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      label: language === 'vi' ? val.vi : val.en
    }));
  }, [resources, language]);

  const filteredResources = useMemo(() => {
    return resources
      .filter((r) => r.isPublished)
      .filter((r) => {
        const matchesSearch =
          searchQuery === '' ||
          r.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.descriptionVi.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'all' || r.categoryName === selectedCategory;
        const matchesPrice = selectedPriceType === 'all' || r.priceType === selectedPriceType;

        return matchesSearch && matchesCat && matchesPrice;
      });
  }, [resources, searchQuery, selectedCategory, selectedPriceType]);

  const getCategoryIcon = (category: string) => {
    if (category.includes('Phần mềm')) return <Laptop className="w-3.5 h-3.5 text-sky-400" />;
    if (category.includes('Sách')) return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
    if (category.includes('Dụng cụ')) return <Puzzle className="w-3.5 h-3.5 text-purple-400" />;
    if (category.includes('Nghe nhìn')) return <Volume2 className="w-3.5 h-3.5 text-rose-400" />;
    return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/resources"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/resources' }
        ]}
        keywords={language === 'vi' 
          ? 'Học liệu tiếng Anh trẻ em, Flashcards Phonics, Giáo cụ dạy học tiếng Anh, File PDF in ấn, Thầy Nguyễn Trọng Huy Hoàng'
          : 'English Teaching Materials, Phonics Flashcards, Educational Apps, Printable PDFs, Teacher Huy Hoang'}
        schema={resourceSchemas}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            {t('nav.resources')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi'
              ? 'Kho Học Liệu & Thiết Bị Giáo Dục Tiếng Anh'
              : 'English Teaching & Educational Resources Hub'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {language === 'vi'
              ? 'Tổng hợp sách truyện, phần mềm học tập, file số printable, giáo cụ dạy học và thiết bị nghe nhìn dành cho học sinh & giáo viên.'
              : 'Explore educational books, software, digital printable files, teaching tools, and audio-visual equipment.'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('label.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">{t('label.allCategories')}</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedPriceType}
                onChange={(e) => setSelectedPriceType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">{t('label.allResources')}</option>
                <option value="free">{language === 'vi' ? '🎁 Học liệu Miễn phí' : '🎁 Free Resources'}</option>
                <option value="paid">{language === 'vi' ? '💳 Học liệu Có phí' : '💳 Paid Resources'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton count={3} />
          </div>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            title={language === 'vi' ? 'Không tìm thấy học liệu phù hợp' : 'No resources found'}
            description={language === 'vi' ? 'Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.' : 'Try adjusting your search criteria.'}
            onReset={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedPriceType('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((r) => (
              <div
                key={r.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 text-left"
              >
                <div>
                  {/* Image Header & Badge */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={r.previewUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'}
                      alt={language === 'vi' ? r.titleVi : r.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    
                    {/* Price Type Badge (Mũi tên 4) */}
                    {(() => {
                      const discountPrice = language === 'vi' ? r.discountPriceVi : r.discountPriceEn;
                      const hasDiscount = r.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

                      return (
                        <>
                          <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
                            {r.priceType === 'free' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                                <Gift className="w-3.5 h-3.5" />
                                {t('resource.free')}
                              </span>
                            ) : hasDiscount ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-black shadow-xl ring-2 ring-rose-400/40">
                                  🔥 {discountPrice}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] line-through font-semibold border border-white/10">
                                  {language === 'vi' ? r.priceVi : r.priceEn}
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                                <CreditCard className="w-3.5 h-3.5" />
                                {language === 'vi' ? r.priceVi : r.priceEn}
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
                        </>
                      );
                    })()}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg truncate">
                        {getCategoryIcon(r.categoryName)}
                        <span>{language === 'vi' ? r.categoryName : (r.categoryEn || r.categoryName)}</span>
                      </span>
                      <span className="bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg shrink-0">
                        {language === 'vi' ? r.fileType : (r.fileTypeEn || r.fileType)}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-semibold text-slate-400">
                      {t('label.grade')}: <span className="text-slate-900 dark:text-white font-bold">{language === 'vi' ? r.grade : (r.gradeEn || r.grade)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                      {language === 'vi' ? r.titleVi : r.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {language === 'vi' ? r.descriptionVi : r.descriptionEn}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 flex items-center gap-3">
                  <Link
                    to={`/resources/${r.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
                  >
                    <span>{t('btn.viewDetails')}</span>
                    <ArrowRight className="w-4 h-4" />
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
