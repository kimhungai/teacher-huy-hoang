import React, { useEffect, useState } from 'react';
import { Hammer, Gamepad2, Compass, Palette, Users2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DB } from '../../services/db';
import type { Profile } from '../../types';

export const PhilosophySection: React.FC = () => {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = () => {
    DB.getProfile().then(setProfile);
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('profile-updated', loadProfile);
    return () => {
      window.removeEventListener('profile-updated', loadProfile);
    };
  }, []);

  const icons = [Hammer, Gamepad2, Compass, Palette, Users2];
  const colors = [
    'from-sky-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-indigo-600',
    'from-rose-500 to-pink-600'
  ];

  const defaultLinesVi = [
    'Học Qua Thực Hành: Học sinh áp dụng ngữ liệu vào hội thoại, đóng vai và nhiệm vụ thực tế.',
    'Học Qua Trò Chơi: Trò chơi rèn luyện ngữ pháp & từ vựng giúp tiếp thu tự nhiên.',
    'Học Qua Khám Phá: Khơi gợi trí tò mò qua sách truyện, khám phá tự nhiên và văn hóa.',
    'Học Qua Sáng Tạo: Thiết kế áp phích, tranh vẽ và bài thuyết trình số bằng tiếng Anh.',
    'Học Cùng Đồng Đội: Xây dựng tinh thần đồng đội, lắng nghe và hợp tác trong nhóm nhỏ.'
  ];

  const defaultLinesEn = [
    'Learn by Doing: Students apply language in role-play, dialogues, and real-life tasks.',
    'Learn by Playing: Gamified drills and challenges make vocabulary acquisition effortless.',
    'Learn by Exploring: Encouraging curiosity through storybooks, culture, and nature topics.',
    'Learn by Creating: Designing posters, drawings, and digital presentations in English.',
    'Learn Together: Building empathy, teamwork, and active listening skills in small groups.'
  ];

  const rawText = (language === 'vi' ? profile?.philosophyTextVi : profile?.philosophyTextEn) || '';
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const activeLines = lines.length > 0 ? lines : (language === 'vi' ? defaultLinesVi : defaultLinesEn);

  const brandMessage = language === 'vi' ? profile?.brandMessageVi : profile?.brandMessageEn;

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('home.philosophyTitle')}
          </h2>
          {/* Mũi tên 1: Đồng bộ Trích dẫn triết lý từ Backend */}
          <p className="text-sm md:text-base font-semibold text-sky-600 dark:text-sky-400">
            {brandMessage || t('home.philosophySub')}
          </p>
        </div>

        {/* Mũi tên 2: Mỗi dòng trong Backend tương ứng với 1 ô vuông Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {activeLines.map((line, index) => {
            const Icon = icons[index % icons.length] || Sparkles;
            const color = colors[index % colors.length];

            let title = line;
            let desc = '';

            if (line.includes(':')) {
              const parts = line.split(':');
              title = parts[0].trim();
              desc = parts.slice(1).join(':').trim();
            }

            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${color} text-white flex items-center justify-center shadow-lg mb-6 transform group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  {desc && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
