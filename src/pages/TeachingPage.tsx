import React, { useEffect, useState } from 'react';
import { DB } from '../services/db';
import type { TeachingApproach } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, MessageSquare, Gamepad2, FolderKanban, BookOpen, Layers, HeartHandshake, Laptop, Palette } from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { SEO } from '../components/common/SEO';

export const TeachingPage: React.FC = () => {
  const { language } = useLanguage();
  const [approaches, setApproaches] = useState<TeachingApproach[]>(() => {
    try {
      const cached = localStorage.getItem('db_teaching_approaches');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('db_teaching_approaches');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });

  const iconMap: Record<string, React.ElementType> = {
    MessageSquare,
    Gamepad2,
    FolderKanban,
    BookOpen,
    Layers,
    HeartHandshake,
    Laptop,
    Palette
  };

  useEffect(() => {
    DB.getTeachingApproaches().then((res) => {
      setApproaches(res);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Phương Pháp Giảng Dạy Tiếng Anh Đổi Mới — Gamification & EdTech'
    : 'Innovative English Teaching Methodology — Gamification & EdTech';

  const seoDesc = language === 'vi'
    ? 'Khám phá các phương pháp giảng dạy Tiếng Anh tiểu học tiên tiến của Thầy Nguyễn Trọng Huy Hoàng: Học qua trò chơi tương tác, Phản xạ nghe nói tự nhiên, Dự án thực hành và Công nghệ số.'
    : 'Discover Teacher Huy Hoang\'s innovative primary English teaching methods: Gamification, communicative approach, hands-on projects, and digital technology integration.';

  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/teaching"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/teaching' }
        ]}
        keywords={language === 'vi'
          ? 'Phương pháp dạy tiếng anh tiểu học, Gamification trong giáo dục, Thầy Nguyễn Trọng Huy Hoàng, EdTech'
          : 'Primary English teaching methodology, Gamification in education, Teacher Huy Hoang'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Khung Phương Pháp Sư Phạm' : 'Pedagogical Framework'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi' ? 'Phương Pháp Giảng Dạy Cốt Lõi' : 'My Teaching Approach'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'vi'
              ? 'Các định hướng sư phạm tiên tiến được thiết kế tối ưu cho Học viên, giúp nâng cao phản xạ và đam mê học ngôn ngữ.'
              : 'Advanced pedagogical methods tailored for students to build natural communication fluency and intrinsic motivation.'}
          </p>
        </div>

        {/* 8 Approaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {approaches.map((item) => {
            const IconComponent = iconMap[item.icon] || Sparkles;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center text-left"
              >
                <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.imageUrl}
                    alt={language === 'vi' ? item.titleVi : item.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === 'vi' ? item.titleVi : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
