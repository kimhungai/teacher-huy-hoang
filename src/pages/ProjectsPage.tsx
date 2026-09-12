import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../services/db';
import type { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, FolderKanban, ArrowRight, Calendar, Tag } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

import { SEO } from '../components/common/SEO';

export const ProjectsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = localStorage.getItem('db_projects');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('db_projects');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'newest' | 'oldest'>('default');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    DB.getProjects().then((res) => {
      setProjects(res);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Dự Án Giáo Dục Tiếng Anh & Đổi Mới Sư Phạm Tiểu Học'
    : 'English Educational Projects & Primary Innovation';

  const seoDesc = language === 'vi'
    ? 'Tổng hợp các dự án nghiên cứu giáo dục, ứng dụng phần mềm dạy học và sáng kiến kinh nghiệm dạy Tiếng Anh Tiểu học của Thầy Nguyễn Trọng Huy Hoàng tại Trường TH Dương Minh Châu.'
    : 'Collection of educational research projects, teaching app integration, and primary English pedagogical initiatives by Teacher Huy Hoang at Duong Minh Chau School.';

  // Filter options
  const categories = useMemo(() => {
    const map = new Map<string, { vi: string; en: string }>();
    projects.forEach((p) => {
      const key = p.categoryName;
      if (!map.has(key)) {
        map.set(key, { vi: p.categoryName, en: p.categoryEn || p.categoryName });
      }
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      label: language === 'vi' ? val.vi : val.en
    }));
  }, [projects, language]);

  const grades = useMemo(() => {
    const set = new Set(projects.map(p => p.grade));
    return Array.from(set);
  }, [projects]);

  const years = useMemo(() => {
    const set = new Set(projects.map(p => p.year));
    return Array.from(set);
  }, [projects]);

  // Filtered and Sorted list
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.isPublished)
      .filter((p) => {
        const matchesSearch =
          searchQuery === '' ||
          p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.descriptionVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || p.categoryName === selectedCategory;
        const matchesGrade = selectedGrade === 'all' || p.grade === selectedGrade;
        const matchesYear = selectedYear === 'all' || p.year === selectedYear;

        return matchesSearch && matchesCat && matchesGrade && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === 'default') return (a.orderIndex || 0) - (b.orderIndex || 0);
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [projects, searchQuery, selectedCategory, selectedGrade, selectedYear, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGrade('all');
    setSelectedYear('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

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
        url="/projects"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/projects' }
        ]}
        keywords={language === 'vi'
          ? 'Dự án giáo dục tiếng anh, Sáng kiến kinh nghiệm tiếng anh tiểu học, Thầy Nguyễn Trọng Huy Hoàng, Dương Minh Châu'
          : 'Educational Projects, Primary English Innovations, Teacher Huy Hoang'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Thư Viện Dự Án' : 'Project Gallery'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi' ? 'Dự Án Giảng Dạy & Hoạt Động Sáng Tạo' : 'Teaching Projects & Innovations'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'vi'
              ? 'Tổng hợp các sáng kiến phương pháp, dự án PBL và hoạt động ngoại khóa tiếng Anh sinh động cho học viên.'
              : 'Showcasing English teaching initiatives, PBL projects, and interactive events for students.'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('label.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Grade Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">{t('label.allGrades')}</option>
                {grades.map((gr, i) => (
                  <option key={i} value={gr}>
                    {gr}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">Tất cả năm / All Years</option>
                {years.map((yr, i) => (
                  <option key={i} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'newest' | 'oldest')}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="default">{language === 'vi' ? 'Thứ tự ưu tiên' : 'Priority Order'}</option>
                <option value="newest">{language === 'vi' ? 'Mới nhất' : 'Newest'}</option>
                <option value="oldest">{language === 'vi' ? 'Cũ nhất' : 'Oldest'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {paginatedProjects.length === 0 ? (
          <EmptyState onReset={handleResetFilters} resetText={t('btn.clearFilters')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {paginatedProjects.map((item) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.thumbnailUrl}
                      alt={language === 'vi' ? item.titleVi : item.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="sky">{language === 'vi' ? item.grade : (item.gradeEn || item.grade)}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      <span>{item.year}</span>
                    </div>
                  </div>

                  <div className="p-6 text-left space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {language === 'vi' ? item.categoryName : (item.categoryEn || item.categoryName)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                      {language === 'vi' ? item.titleVi : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 text-left space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/projects/${item.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
                  >
                    <span>{t('btn.viewDetails')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
};
