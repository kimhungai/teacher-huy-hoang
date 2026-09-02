import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { StudentWork } from '../../types';
import { Plus, Edit2, Trash2, ShieldCheck, UserX, Users, Lock } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';

export const AdminStudentWorksPage: React.FC = () => {
  const [works, setWorks] = useState<StudentWork[]>([]);
  const [editing, setEditing] = useState<StudentWork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Sản phẩm Học sinh — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getStudentWorks().then(setWorks);
  };

  const handleOpenAdd = () => {
    setEditing({
      id: '',
      titleEn: '',
      titleVi: '',
      category: 'Posters',
      grade: 'Grade 3',
      studentName: 'Minh Anh',
      descriptionEn: '',
      descriptionVi: '',
      imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
      privacyMode: 'public',
      isPublished: true,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const updated = await DB.saveStudentWork(editing);
    setWorks(updated);
    setModalOpen(false);
    setToast({ msg: 'Đã lưu sản phẩm học sinh!', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteStudentWork(deleteId);
      setWorks(updated);
      setToast({ msg: 'Đã xóa sản phẩm!', type: 'success' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sản Phẩm Học Sinh</h1>
          <p className="text-xs text-slate-500">Quản lý tác phẩm học trò và chế độ bảo mật (Public, Private, Anonymous, Group)</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên tác phẩm</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4">Học sinh / Nhóm</th>
                <th className="p-4">Quyền riêng tư</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {works.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4">
                    <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{item.titleVi}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.studentName || 'N/A'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-[11px] uppercase">
                      {item.privacyMode === 'public' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      {item.privacyMode === 'anonymous' && <UserX className="w-3.5 h-3.5 text-amber-500" />}
                      {item.privacyMode === 'group' && <Users className="w-3.5 h-3.5 text-sky-500" />}
                      {item.privacyMode === 'private' && <Lock className="w-3.5 h-3.5 text-rose-500" />}
                      <span>{item.privacyMode}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600"
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sản phẩm học sinh">
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold">Tên sản phẩm (VI)</label>
              <input
                type="text"
                required
                value={editing.titleVi}
                onChange={(e) => setEditing({ ...editing, titleVi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Title (EN)</label>
              <input
                type="text"
                required
                value={editing.titleEn}
                onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold">Tên học sinh / Nhóm</label>
                <input
                  type="text"
                  value={editing.studentName}
                  onChange={(e) => setEditing({ ...editing, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold">Quyền riêng tư (Privacy)</label>
                <select
                  value={editing.privacyMode}
                  onChange={(e) => setEditing({ ...editing, privacyMode: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <option value="public">Public (Công khai tên)</option>
                  <option value="anonymous">Anonymous (Ẩn danh)</option>
                  <option value="group">Group Project (Dự án nhóm)</option>
                  <option value="private">Private (Không hiển thị ra ngoài)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Image URL</label>
              <input
                type="text"
                value={editing.imageUrl}
                onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
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
                Lưu Sản Phẩm
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
