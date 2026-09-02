import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { HeroSettings } from '../../types';
import { Save } from 'lucide-react';
import { Toast } from '../../components/common/Toast';

export const AdminHeroPage: React.FC = () => {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Hero — Admin CMS';
    DB.getHeroSettings().then(setHero);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;
    setSaving(true);
    await DB.updateHeroSettings(hero);
    setSaving(false);
    setToast({ msg: 'Cập nhật Hero Banner thành công!', type: 'success' });
  };

  if (!hero) return null;

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Hero Banner Trang Chủ</h1>
        <p className="text-xs text-slate-500">Chỉnh sửa tiêu đề chính và hình ảnh nổi bật đầu trang chủ</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề Headline (Tiếng Việt)</label>
          <input
            type="text"
            value={hero.headlineVi}
            onChange={(e) => setHero({ ...hero, headlineVi: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề Headline (Tiếng Anh)</label>
          <input
            type="text"
            value={hero.headlineEn}
            onChange={(e) => setHero({ ...hero, headlineEn: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả Phụ Subtitle (Tiếng Việt)</label>
          <textarea
            rows={3}
            value={hero.subtitleVi}
            onChange={(e) => setHero({ ...hero, subtitleVi: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả Phụ Subtitle (Tiếng Anh)</label>
          <textarea
            rows={3}
            value={hero.subtitleEn}
            onChange={(e) => setHero({ ...hero, subtitleEn: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ảnh Chân dung Hero URL</label>
          <input
            type="text"
            value={hero.avatarUrl}
            onChange={(e) => setHero({ ...hero, avatarUrl: e.target.value })}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu Banner Hero'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
