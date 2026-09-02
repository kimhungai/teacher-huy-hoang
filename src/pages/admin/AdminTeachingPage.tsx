import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { TeachingApproach } from '../../types';
import { Plus, Edit2, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';

export const AdminTeachingPage: React.FC = () => {
  const [approaches, setApproaches] = useState<TeachingApproach[]>([]);
  const [editing, setEditing] = useState<TeachingApproach | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Phương pháp dạy — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getTeachingApproaches().then(setApproaches);
  };

  const handleOpenAdd = () => {
    setEditing({
      id: '',
      titleEn: '',
      titleVi: '',
      descriptionEn: '',
      descriptionVi: '',
      icon: 'Sparkles',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600',
      orderIndex: approaches.length + 1
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const updated = await DB.saveTeachingApproach(editing);
    setApproaches(updated);
    setModalOpen(false);
    setToast({ msg: 'Đã lưu phương pháp giảng dạy!', type: 'success' });
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateTeachingApproach(id);
    setApproaches(updated);
    setToast({ msg: 'Đã nhân bản phương pháp thành công!', type: 'success' });
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const updated = await DB.reorderTeachingApproaches(id, direction);
    setApproaches(updated);
    setToast({ msg: 'Đã cập nhật thứ tự ưu tiên hiển thị!', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteTeachingApproach(deleteId);
      setApproaches(updated);
      setToast({ msg: 'Đã xóa phương pháp giảng dạy!', type: 'success' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Phương Pháp Giảng Dạy</h1>
          <p className="text-xs text-slate-500">Quản lý các định hướng sư phạm cốt lõi</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Phương Pháp</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">STT & Thứ tự</th>
                <th className="p-4">Hình ảnh</th>
                <th className="p-4">Tiêu đề (VI)</th>
                <th className="p-4">Title (EN)</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {approaches.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-5 text-center text-slate-900 dark:text-white">{idx + 1}</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleReorder(item.id, 'up')}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400"
                          title="Lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === approaches.length - 1}
                          onClick={() => handleReorder(item.id, 'down')}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 dark:text-slate-400"
                          title="Xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <img src={item.imageUrl} alt="" className="w-12 h-9 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{item.titleVi}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{item.titleEn}</td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleDuplicate(item.id)}
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                      title="Nhân bản"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                      title="Xóa"
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

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Chỉnh sửa Phương pháp dạy" maxWidth="max-w-3xl">
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề (Tiếng Việt)</label>
                <input
                  type="text"
                  required
                  value={editing.titleVi || ''}
                  onChange={(e) => setEditing({ ...editing, titleVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề (Tiếng Anh)</label>
                <input
                  type="text"
                  required
                  value={editing.titleEn || ''}
                  onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả (Tiếng Việt)</label>
                <textarea
                  rows={4}
                  value={editing.descriptionVi || ''}
                  onChange={(e) => setEditing({ ...editing, descriptionVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả (Tiếng Anh)</label>
                <textarea
                  rows={4}
                  value={editing.descriptionEn || ''}
                  onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Biểu tượng Icon</label>
                <select
                  value={editing.icon || 'Sparkles'}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="MessageSquare">💬 MessageSquare (Giao tiếp)</option>
                  <option value="Gamepad2">🎮 Gamepad2 (Trò chơi)</option>
                  <option value="FolderKanban">📁 FolderKanban (Dự án PBL)</option>
                  <option value="BookOpen">📖 BookOpen (Kể chuyện)</option>
                  <option value="Layers">🥞 Layers (Trạm học tập)</option>
                  <option value="HeartHandshake">🤝 HeartHandshake (Trung tâm học sinh)</option>
                  <option value="Laptop">💻 Laptop (Công nghệ EdTech)</option>
                  <option value="Palette">🎨 Palette (Sáng tạo & Nghệ thuật)</option>
                  <option value="Sparkles">✨ Sparkles (Mặc định)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Hình ảnh Minh họa</label>
                <input
                  type="text"
                  value={editing.imageUrl || ''}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                Hủy
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold">
                Lưu Phương Pháp
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
