import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { Achievement } from '../../types';
import { Plus, Edit2, Trash2, Copy, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

export const AdminAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Thành tựu — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getAchievements().then(setAchievements);
  };

  const handleOpenAdd = () => {
    const initialCert = 'https://images.unsplash.com/photo-1589330694653-aded6fac0244?auto=format&fit=crop&q=80&w=600';
    setEditing({
      id: '',
      titleEn: '',
      titleVi: '',
      organizationEn: '',
      organizationVi: '',
      date: '2025',
      category: 'Awards',
      categoryEn: 'Awards',
      certificateUrl: initialCert,
      galleryUrls: [initialCert],
      descriptionEn: '',
      descriptionVi: '',
      orderIndex: achievements.length + 1
    });
    setGalleryUrlsText(initialCert);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Achievement) => {
    setEditing({ ...item });
    const urls = item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : (item.certificateUrl ? [item.certificateUrl] : []);
    setGalleryUrlsText(urls.join('\n'));
    setModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateAchievement(id);
    setAchievements(updated);
    setToast({ msg: 'Đã nhân bản thành tựu thành công!', type: 'success' });
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const updated = await DB.reorderAchievements(id, direction);
    setAchievements(updated);
    setToast({ msg: 'Đã thay đổi thứ tự thành công!', type: 'success' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    // Parse galleryUrlsText multiline input
    const galleryArray = galleryUrlsText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const firstImage = galleryArray.length > 0 ? galleryArray[0] : '';

    // Set categoryEn automatically based on category choice
    const categoryMapEn: Record<string, string> = {
      'Awards': 'Awards',
      'Khen thưởng': 'Awards',
      'Certificate': 'Certificate',
      'Chứng chỉ': 'Certificate',
      'Workshop': 'Workshops',
      'Hội thảo': 'Workshops',
      'EdTech': 'Presentations',
      'Presentations': 'Presentations',
      'Báo cáo': 'Presentations'
    };

    const achToSave: Achievement = {
      ...editing,
      categoryEn: categoryMapEn[editing.category] || editing.category,
      certificateUrl: firstImage,
      galleryUrls: galleryArray
    };

    const updated = await DB.saveAchievement(achToSave);
    setAchievements(updated);
    setModalOpen(false);
    setToast({ msg: 'Đã lưu thành tựu thành công!', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteAchievement(deleteId);
      setAchievements(updated);
      setToast({ msg: 'Đã xóa thành tựu!', type: 'success' });
    }
  };

  const renderCategoryLabel = (category: string) => {
    switch (category) {
      case 'Awards':
      case 'Khen thưởng':
        return 'Khen thưởng (Awards)';
      case 'Certificate':
      case 'Chứng chỉ':
        return 'Chứng chỉ (Certificate)';
      case 'Workshop':
      case 'Hội thảo':
        return 'Hội thảo (Workshops)';
      case 'EdTech':
      case 'Presentations':
      case 'Báo cáo':
        return 'Báo cáo (Presentations)';
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thành Tựu & Bằng Khen</h1>
          <p className="text-xs text-slate-500">Quản lý giải thưởng, chứng chỉ TESOL và bằng khen chuyên môn</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Thành Tựu</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 w-24 text-center">STT</th>
                <th className="p-4">Năm</th>
                <th className="p-4">Tên thành tựu (VI)</th>
                <th className="p-4">Đơn vị cấp</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {achievements.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  {/* MỤC 4: STT & Nút Thay đổi thứ tự (Up/Down) */}
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-5 font-extrabold text-sky-600 dark:text-sky-400">{idx + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleReorder(item.id, 'up')}
                          className="p-1 hover:bg-sky-500/10 hover:text-sky-600 rounded disabled:opacity-20 cursor-pointer transition-colors"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === achievements.length - 1}
                          onClick={() => handleReorder(item.id, 'down')}
                          className="p-1 hover:bg-sky-500/10 hover:text-sky-600 rounded disabled:opacity-20 cursor-pointer transition-colors"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-sky-600">{item.date}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{item.titleVi}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div>{item.organizationVi}</div>
                    {item.organizationEn && (
                      <div className="text-[11px] text-slate-400 font-normal">{item.organizationEn}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant="amber">{renderCategoryLabel(item.category)}</Badge>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleDuplicate(item.id)}
                      title="Nhân bản thành tựu này"
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Chỉnh sửa"
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      title="Xóa"
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Thành tựu & Bằng khen Chuyên môn" maxWidth="max-w-2xl">
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            {/* Title VI & EN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tên Thành Tựu / Giải Thưởng (Tiếng Việt) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editing.titleVi}
                onChange={(e) => setEditing({ ...editing, titleVi: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Achievement Title (Tiếng Anh) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editing.titleEn}
                onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              />
            </div>

            {/* Đơn vị cấp (VI & EN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đơn vị cấp (Tiếng Việt) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editing.organizationVi}
                  onChange={(e) => setEditing({ ...editing, organizationVi: e.target.value })}
                  placeholder="Ví dụ: Ủy ban Nhân dân & Phòng GD&ĐT..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Issuing Organization (Tiếng Anh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editing.organizationEn}
                  onChange={(e) => setEditing({ ...editing, organizationEn: e.target.value })}
                  placeholder="Example: People's Committee & Dept of Education..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chuyên mục</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="Awards">Khen thưởng (Awards)</option>
                  <option value="Certificate">Chứng chỉ (Certificate)</option>
                  <option value="Workshop">Hội thảo & Tập huấn (Workshops)</option>
                  <option value="Presentations">Báo cáo (Presentations)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Năm / Thời gian</label>
                <input
                  type="text"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  placeholder="2025"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-sky-600"
                />
              </div>
            </div>

            {/* Nội dung thành tựu (VN & EN) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nội dung thành tựu (Tiếng Việt)</label>
              <textarea
                rows={3}
                value={editing.descriptionVi}
                onChange={(e) => setEditing({ ...editing, descriptionVi: e.target.value })}
                placeholder="Nhập chi tiết khen thưởng hoặc ý nghĩa thành tựu..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Achievement Details (Tiếng Anh)</label>
              <textarea
                rows={3}
                value={editing.descriptionEn}
                onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })}
                placeholder="Enter details in English..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            {/* MỤC 2 & 3: Album Hình Ảnh Thành tựu (Mỗi URL 1 dòng - Để trống nếu không có) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>Album Hình Ảnh Thành tựu (Mỗi URL 1 dòng - Để trống nếu không có)</span>
              </label>
              <textarea
                rows={4}
                value={galleryUrlsText}
                onChange={(e) => setGalleryUrlsText(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer shadow-md">
                Lưu Thành Tựu
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
