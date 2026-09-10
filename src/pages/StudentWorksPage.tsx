import React, { useEffect, useState, useMemo } from 'react';
import { DB } from '../services/db';
import type { StudentWork } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ShieldCheck, UserX, Users, Search } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

import { SEO } from '../components/common/SEO';

export const StudentWorksPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [works, setWorks] = useState<StudentWork[]>(() => {
    try {
      const cached = localStorage.getItem('db_student_works');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('db_student_works');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    DB.getStudentWorks().then((res) => {
      setWorks(res);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Sản Phẩm & Dự Án Sáng Tạo Tiếng Anh Của Học Viên'
    : 'Student Creative Projects & English Showcase';

  const seoDesc = language === 'vi'
    ? 'Triển lãm sản phẩm học tập Tiếng Anh sáng tạo của các em học sinh: Tranh vẽ Phonics, Poster dự án, Video thuyết trình và Bài tập tự làm dưới sự hướng dẫn của Thầy Nguyễn Trọng Huy Hoàng.'
    : 'Showcase of creative English projects by primary students: Phonics drawings, project posters, speaking videos, and portfolio assignments guided by Teacher Huy Hoang.';

  const categories = [
    'Posters',
    'Drawings',
    'Speaking',
    'Writing',
    'Presentations',
    'Group Projects',
    'Creative English Activities'
  ];

  // Privacy protection filtering: ONLY show items that are published AND NOT marked as 'private'
  const filteredWorks = useMemo(() => {
    return works
      .filter((w) => w.isPublished && w.privacyMode !== 'private')
      .filter((w) => {
        const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
        const matchesSearch =
          searchQuery === '' ||
          w.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.descriptionVi.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
  }, [works, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/student-works"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/student-works' }
        ]}
        keywords={language === 'vi'
          ? 'Sản phẩm học viên, Tranh vẽ tiếng anh tiểu học, Poster tiếng anh, Thuyết trình tiếng anh trẻ em'
          : 'Student English Works, Primary English Posters, Young Learners Showcase'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Showcase</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi' ? 'Góc Sản Phẩm Sáng Tạo Của Học Sinh' : 'Student Works Showcase'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'vi'
              ? 'Tôn vinh thành quả học tập, áp phích, bài viết và thuyết trình của học sinh tiểu học với quy định bảo mật thông tin an toàn.'
              : 'Celebrating creative posters, drawings, presentations, and storybooks created by primary students with strict student privacy protection.'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('label.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t('label.allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Works Grid */}
        {filteredWorks.length === 0 ? (
          <EmptyState onReset={() => setSelectedCategory('all')} resetText={t('btn.clearFilters')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorks.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between text-left"
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

                    {/* Privacy Badge */}
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-md">
                      {item.privacyMode === 'anonymous' && (
                        <>
                          <UserX className="w-3 h-3 text-amber-400" />
                          <span>{language === 'vi' ? 'Chế độ ẩn danh' : 'Anonymous Mode'}</span>
                        </>
                      )}
                      {item.privacyMode === 'group' && (
                        <>
                          <Users className="w-3 h-3 text-sky-400" />
                          <span>{item.studentName || 'Group Work'}</span>
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

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {language === 'vi' ? item.titleVi : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                    </p>
                  </div>
                </div>

                {(item.objectiveVi || item.objectiveEn) && (
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 italic">
                    🎯 {language === 'vi' ? item.objectiveVi : item.objectiveEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
