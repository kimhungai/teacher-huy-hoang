import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../services/db';
import type { Course } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, GraduationCap, ArrowRight, Calendar, Clock, Tag, Gift, CreditCard } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

import { SEO } from '../components/common/SEO';

export const CoursesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('db_courses');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('db_courses');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceType, setSelectedPriceType] = useState('all');

  useEffect(() => {
    DB.getCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Danh Sách Khóa Học Tiếng Anh Trẻ Em & Phonics Chuẩn International'
    : 'English Courses for Young Learners & International Phonics';

  const seoDesc = language === 'vi'
    ? 'Tổng hợp các khóa học Tiếng Anh Trẻ Em, Luyện phản xạ Nghe Nói, Văn phạm Tiểu học và Phonics chất lượng cao của Thầy Nguyễn Trọng Huy Hoàng. Học qua Game & Giáo cụ tương tác.'
    : 'Comprehensive English courses for young learners, listening & speaking fluency, primary grammar, and phonics by Teacher Huy Hoang. Gamified & interactive learning.';

  // Structured Data Schema for Courses List
  const courseSchemas = courses.filter(c => c.isPublished).map(c => ({
    '@type': 'Course',
    'name': language === 'vi' ? c.titleVi : c.titleEn,
    'description': language === 'vi' ? c.descriptionVi : c.descriptionEn,
    'provider': {
      '@type': 'Person',
      'name': 'Nguyễn Trọng Huy Hoàng',
      'sameAs': window.location.origin
    }
  }));

  const categories = useMemo(() => {
    const map = new Map<string, { vi: string; en: string }>();
    courses.forEach((c) => {
      const key = c.categoryName;
      if (!map.has(key)) {
        map.set(key, { vi: c.categoryName, en: c.categoryEn || c.categoryName });
      }
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      label: language === 'vi' ? val.vi : val.en
    }));
  }, [courses, language]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => c.isPublished)
      .filter((c) => {
        const matchesSearch =
          searchQuery === '' ||
          c.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.descriptionVi.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'all' || c.categoryName === selectedCategory;
        const matchesPrice = selectedPriceType === 'all' || c.priceType === selectedPriceType;

        return matchesSearch && matchesCat && matchesPrice;
      });
  }, [courses, searchQuery, selectedCategory, selectedPriceType]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/courses"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/courses' }
        ]}
        keywords={language === 'vi' 
          ? 'Khóa học tiếng Anh trẻ em, Tiếng Anh tiểu học, Phonics, Luyện nghe nói phản xạ, Thầy Nguyễn Trọng Huy Hoàng'
          : 'Young Learners English Courses, Primary English, Phonics, Fluency Training, Teacher Huy Hoang'}
        schema={courseSchemas}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            {t('nav.courses')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi'
              ? 'Các Khóa học tiếng Anh cho Trẻ em, Học sinh Trung học cơ sở, Học sinh Trung học phổ thông'
              : 'English Courses for Children, Junior High & High School Students'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {language === 'vi'
              ? 'Đa dạng khóa học Miễn phí & Có phí được thiết kế theo phương pháp tương tác, trò chơi và luyện phản xạ tự nhiên cho Học viên.'
              : 'Diverse Free & Paid courses designed with interactive, game-based learning and natural fluency practice for students.'}
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
                <option value="all">{t('label.allCourses')}</option>
                <option value="free">{language === 'vi' ? '🎁 Khóa học Miễn phí' : '🎁 Free Courses'}</option>
                <option value="paid">{language === 'vi' ? '💳 Khóa học Có phí' : '💳 Paid Courses'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LoadingSkeleton count={3} />
          </div>
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            title={language === 'vi' ? 'Không tìm thấy khóa học phù hợp' : 'No courses found'}
            description={language === 'vi' ? 'Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.' : 'Try adjusting your search criteria.'}
            onReset={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedPriceType('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 text-left"
              >
                <div>
                  {/* Thumbnail & Badge */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={c.thumbnailUrl}
                      alt={language === 'vi' ? c.titleVi : c.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    
                    {/* Price Type Badge (Mũi tên 4) */}
                    {(() => {
                      const discountPrice = language === 'vi' ? c.discountPriceVi : c.discountPriceEn;
                      const hasDiscount = c.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

                      return (
                        <>
                          <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
                            {c.priceType === 'free' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                                <Gift className="w-3.5 h-3.5" />
                                {t('course.free')}
                              </span>
                            ) : hasDiscount ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-black shadow-xl ring-2 ring-rose-400/40">
                                  🔥 {discountPrice}
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
                        </>
                      );
                    })()}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium gap-2">
                      <span className="inline-flex items-center gap-1 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg truncate">
                        <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{language === 'vi' ? c.categoryName : (c.categoryEn || c.categoryName)}</span>
                      </span>
                      <span className="bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg shrink-0">
                        {language === 'vi' ? c.gradeLevel : (c.gradeLevelEn || c.gradeLevel)}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                      {language === 'vi' ? c.titleVi : c.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {language === 'vi' ? c.descriptionVi : c.descriptionEn}
                    </p>

                    {/* Meta info */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>{language === 'vi' ? c.durationVi : c.durationEn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">{language === 'vi' ? c.scheduleVi : c.scheduleEn}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 flex items-center gap-3">
                  <Link
                    to={`/courses/${c.slug}`}
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
