import React from 'react';
import { Award, FolderKanban, BookOpen, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Profile } from '../../types';

interface QuickStatsProps {
  profile?: Profile | null;
  experienceYears?: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ profile, experienceYears }) => {
  const { t } = useLanguage();

  const expYears = profile?.experienceYears ?? experienceYears ?? 25;
  const projCount = profile?.completedProjectsCount ?? 15;
  const resCount = profile?.teachingResourcesCount ?? 50;
  const studentCount = profile?.happyStudentsCount ?? 4500;

  const stats = [
    { icon: Award, value: `${expYears}+`, label: t('stats.experience'), color: 'text-sky-600 bg-sky-500/10' },
    { icon: FolderKanban, value: `${projCount}+`, label: t('stats.projects'), color: 'text-amber-600 bg-amber-500/10' },
    { icon: BookOpen, value: `${resCount}+`, label: t('stats.resources'), color: 'text-emerald-600 bg-emerald-500/10' },
    { icon: Users, value: `${studentCount}+`, label: t('stats.students'), color: 'text-indigo-600 bg-indigo-500/10' }
  ];

  return (
    <section className="py-10 bg-white/60 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-2xl ${item.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
