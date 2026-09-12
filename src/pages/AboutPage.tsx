import React, { useEffect, useState } from 'react';
import { DB } from '../services/db';
import type { Profile, HeroSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { School, CheckCircle2, Heart, Sparkles, BookOpen } from 'lucide-react';

import { SEO } from '../components/common/SEO';

const DEFAULT_TEACHER_AVATAR = 'https://ik.imagekit.io/hkh/OK_2.jpg?updatedAt=1787823395938';

export const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('db_profile');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [hero, setHero] = useState<HeroSettings | null>(() => {
    try {
      const cached = localStorage.getItem('db_hero');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  const loadData = () => {
    Promise.all([
      DB.getProfile(),
      DB.getHeroSettings()
    ]).then(([profRes, heroRes]) => {
      setProfile(profRes);
      setHero(heroRes);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('profile-updated', loadData);
    return () => {
      window.removeEventListener('profile-updated', loadData);
    };
  }, []);

  const headline = language === 'vi'
    ? (hero?.headlineVi || 'Biến Tiếng Anh Thành Hành Trình Vui Vẻ, Ý Nghĩa & Đáng Nhớ')
    : (hero?.headlineEn || 'Making English Fun, Meaningful & Memorable');

  const seoTitle = language === 'vi'
    ? 'Tiểu Sử & Sự Nghiệp Giáo Dục — Thầy Nguyễn Trọng Huy Hoàng'
    : 'Biography & Educational Journey — Teacher Nguyen Trong Huy Hoang';

  const seoDesc = language === 'vi'
    ? 'Tìm hiểu tiểu sử, 25 năm kinh nghiệm giảng dạy Tiếng Anh Tiểu học của Thầy Nguyễn Trọng Huy Hoàng tại Trường TH Dương Minh Châu, Quận 10. Triết lý giáo dục lấy học sinh làm trung tâm.'
    : 'Learn about the 25-year teaching career of Teacher Nguyen Trong Huy Hoang at Duong Minh Chau Primary School. Student-centered pedagogical philosophy and EdTech innovation.';

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/about"
        lang={language as 'vi' | 'en'}
        image={profile?.avatarUrl || DEFAULT_TEACHER_AVATAR}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/about' }
        ]}
        keywords={language === 'vi' 
          ? 'Tiểu sử Thầy Nguyễn Trọng Huy Hoàng, Giáo viên Tiếng Anh Quận 10, Kinh nghiệm dạy tiếng Anh tiểu học, Dương Minh Châu'
          : 'Teacher Nguyen Trong Huy Hoang Biography, Primary English Educator, Duong Minh Chau School'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Hero Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          {/* Teacher Portrait Card with Hero Glowing effect */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Decorative Card Framing & Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500 to-amber-400 rounded-3xl opacity-20 blur-xl animate-pulse" />
              <div className="relative bg-white dark:bg-slate-900 p-3.5 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="aspect-square rounded-2xl overflow-hidden relative group">
                  <img
                    src={profile?.avatarUrl || hero?.avatarUrl || DEFAULT_TEACHER_AVATAR}
                    alt="Teacher Nguyen Trong Huy Hoang"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Hồ Sơ Giáo Viên' : 'Primary Educator Profile'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              {language === 'vi' ? (profile?.fullName || 'Nguyễn Trọng Huy Hoàng') : (profile?.fullNameEn || profile?.fullName || 'Nguyen Trong Huy Hoang')}
            </h1>
            <p className="text-base text-sky-600 dark:text-sky-400 font-bold">
              {language === 'vi' ? profile?.titleVi : profile?.titleEn}
            </p>

            {/* Headline Slogan */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-sm md:text-base leading-snug">
              {headline}
            </div>

            <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal pt-1">
              {language === 'vi' ? profile?.bioVi : profile?.bioEn}
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-lg text-left space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'vi' ? 'Kỹ Năng Sư Phạm & Công Nghệ' : 'Professional Skills'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {profile?.skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Philosophy & Experience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <Heart className="w-5 h-5 fill-sky-600/20" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Triết Lý Giáo Dục' : 'Teaching Philosophy'}
              </h2>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-bold italic border-l-4 border-sky-500 pl-3 py-0.5">
              "{language === 'vi' ? (profile?.brandMessageVi || 'Biến việc học tiếng Anh thành một hành trình vui vẻ, ý nghĩa và đáng nhớ cho mỗi học sinh.') : (profile?.brandMessageEn || 'Making English fun, meaningful and memorable for every young learner.')}"
            </p>

            <div className="space-y-2.5 pt-2">
              {((language === 'vi' ? profile?.philosophyTextVi : profile?.philosophyTextEn) || `Học Qua Thực Hành: Học sinh áp dụng ngữ liệu vào hội thoại, đóng vai và nhiệm vụ thực tế.
Học Qua Trò Chơi: Trò chơi rèn luyện ngữ pháp & từ vựng giúp tiếp thu tự nhiên.
Học Qua Khám Phá: Khơi gợi trí tò mò qua sách truyện, khám phá tự nhiên và văn hóa.
Học Qua Sáng Tạo: Thiết kế áp phích, tranh vẽ và bài thuyết trình số bằng tiếng Anh.
Học Cùng Đồng Đội: Xây dựng tinh thần đồng đội, lắng nghe và hợp tác trong nhóm nhỏ.`)
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((line, idx) => {
                  if (line.includes(':')) {
                    const parts = line.split(':');
                    const title = parts[0].trim();
                    const desc = parts.slice(1).join(':').trim();
                    return (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs md:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">{title}: </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{desc}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{line}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <School className="w-5 h-5" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Học Vấn & Công Tác' : 'Education & Position'}
              </h2>
            </div>
            <div className="space-y-3 text-xs md:text-sm">
              {(profile?.educationHistory && profile.educationHistory.length > 0) ? (
                profile.educationHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {language === 'vi' ? item.titleVi : (item.titleEn || item.titleVi)}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {language === 'vi' ? item.detailVi : (item.detailEn || item.detailVi)}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {language === 'vi' ? 'Trường TH Dương Minh Châu — Quận 10' : 'Duong Minh Chau Primary School'}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {language === 'vi' ? 'Giáo viên Tiếng Anh Chính thức (2020 - Nay)' : 'Full-time English Educator (2020 - Present)'}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {language === 'vi' ? 'Cử nhân Sư phạm Tiếng Anh' : 'Bachelor of English Education'}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                      {language === 'vi' ? 'Trường Đại học Sư phạm TP.HCM' : 'HCMC University of Education'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
