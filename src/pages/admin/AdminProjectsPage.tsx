import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { Project } from '../../types';
import { Plus, Edit2, Trash2, Copy, Eye, EyeOff, Star } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Dự án — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getProjects().then(setProjects);
  };

  const handleOpenAdd = () => {
    setEditing({
      id: '',
      slug: '',
      titleEn: '',
      titleVi: '',
      categoryName: 'English Projects',
      grade: 'Grade 4 & 5',
      year: '2025-2026',
      descriptionEn: '',
      descriptionVi: '',
      objectivesEn: [],
      objectivesVi: [],
      activitiesEn: [],
      activitiesVi: [],
      methodsEn: [],
      methodsVi: [],
      outcomesEn: [],
      outcomesVi: [],
      thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      galleryUrls: [],
      tags: ['PBL', 'English'],
      isFeatured: false,
      isPublished: true,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const cleaned: Project = {
      ...editing,
      objectivesVi: (editing.objectivesVi || []).map(s => s.trim()).filter(Boolean),
      objectivesEn: (editing.objectivesEn || []).map(s => s.trim()).filter(Boolean),
      activitiesVi: (editing.activitiesVi || []).map(s => s.trim()).filter(Boolean),
      activitiesEn: (editing.activitiesEn || []).map(s => s.trim()).filter(Boolean),
      methodsVi: (editing.methodsVi || []).map(s => s.trim()).filter(Boolean),
      methodsEn: (editing.methodsEn || []).map(s => s.trim()).filter(Boolean),
      outcomesVi: (editing.outcomesVi || []).map(s => s.trim()).filter(Boolean),
      outcomesEn: (editing.outcomesEn || []).map(s => s.trim()).filter(Boolean),
      galleryUrls: (editing.galleryUrls || []).map(s => s.trim()).filter(Boolean)
    };

    const updated = await DB.saveProject(cleaned);
    setProjects(updated);
    setModalOpen(false);
    setToast({ msg: 'Đã lưu dự án thành công!', type: 'success' });
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateProject(id);
    setProjects(updated);
    setToast({ msg: 'Đã nhân bản dự án thành công!', type: 'success' });
  };

  const handleTogglePublish = async (proj: Project) => {
    const updated = await DB.saveProject({ ...proj, isPublished: !proj.isPublished });
    setProjects(updated);
    setToast({ msg: proj.isPublished ? 'Đã ẩn dự án' : 'Đã xuất bản dự án', type: 'success' });
  };

  const handleToggleFeatured = async (proj: Project) => {
    const updated = await DB.saveProject({ ...proj, isFeatured: !proj.isFeatured });
    setProjects(updated);
    setToast({ msg: 'Cập nhật trạng thái Nổi bật', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteProject(deleteId);
      setProjects(updated);
      setToast({ msg: 'Đã xóa dự án!', type: 'success' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Dự Án Giảng Dạy</h1>
          <p className="text-xs text-slate-500">Tạo, sửa, xóa, xuất bản và nhân bản các dự án tiếng Anh</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Dự Án Mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tên dự án (VI)</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4">Khối lớp</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4">
                    <img src={item.thumbnailUrl} alt="" className="w-14 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {item.titleVi}
                  </td>
                  <td className="p-4">{item.categoryName}</td>
                  <td className="p-4">
                    <Badge variant="sky">{item.grade}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                          item.isPublished ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{item.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1 rounded-md ${
                          item.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                        title="Nổi bật"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleDuplicate(item.id)}
                      title="Nhân bản"
                      className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      title="Sửa"
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      title="Xóa"
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
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

      {/* Modal Edit/Add */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Chỉnh sửa Dự án Giảng dạy" maxWidth="max-w-3xl">
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chuyên mục (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editing.categoryName || ''}
                  onChange={(e) => setEditing({ ...editing, categoryName: e.target.value })}
                  placeholder="Dự án Học tập, Hoạt động Lớp học..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chuyên mục (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editing.categoryEn || ''}
                  onChange={(e) => setEditing({ ...editing, categoryEn: e.target.value })}
                  placeholder="Learning Projects, Classroom Activities..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Khối lớp / Độ tuổi (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editing.grade || ''}
                  onChange={(e) => setEditing({ ...editing, grade: e.target.value })}
                  placeholder="Khối 4 & 5 (9-11 tuổi)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Khối lớp / Độ tuổi (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editing.gradeEn || ''}
                  onChange={(e) => setEditing({ ...editing, gradeEn: e.target.value })}
                  placeholder="Grade 4 & 5 (Ages 9-11)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Năm thực hiện</label>
                <input
                  type="text"
                  value={editing.year || ''}
                  onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                  placeholder="2025-2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Ảnh Poster/Thumbnail</label>
                <input
                  type="text"
                  value={editing.thumbnailUrl || ''}
                  onChange={(e) => setEditing({ ...editing, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả ngắn (Tiếng Việt)</label>
                <textarea
                  rows={3}
                  value={editing.descriptionVi || ''}
                  onChange={(e) => setEditing({ ...editing, descriptionVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả ngắn (Tiếng Anh)</label>
                <textarea
                  rows={3}
                  value={editing.descriptionEn || ''}
                  onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* 5 Detailed Sections */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Chi Tiết Nội Dung Dự Án (5 Mục)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Mục Tiêu Bài Học (Tiếng Việt) - Mỗi mục 1 dòng</label>
                  <textarea
                    rows={3}
                    value={(editing.objectivesVi || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, objectivesVi: e.target.value.split('\n') })}
                    placeholder="Làm chủ 30+ từ vựng..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Mục Tiêu Bài Học (Tiếng Anh) - Mỗi mục 1 dòng</label>
                  <textarea
                    rows={3}
                    value={(editing.objectivesEn || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, objectivesEn: e.target.value.split('\n') })}
                    placeholder="Master 30+ vocabulary terms..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Chuỗi Hoạt Động (Tiếng Việt) - Mỗi hoạt động 1 dòng</label>
                  <textarea
                    rows={3}
                    value={(editing.activitiesVi || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, activitiesVi: e.target.value.split('\n') })}
                    placeholder="Tuần 1: Khám phá từ vựng..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Chuỗi Hoạt Động (Tiếng Anh) - Mỗi hoạt động 1 dòng</label>
                  <textarea
                    rows={3}
                    value={(editing.activitiesEn || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, activitiesEn: e.target.value.split('\n') })}
                    placeholder="Week 1: Vocabulary discovery..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">3. Phương Pháp Sư Phạm (Tiếng Việt) - Mỗi phương pháp 1 dòng</label>
                  <textarea
                    rows={2}
                    value={(editing.methodsVi || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, methodsVi: e.target.value.split('\n') })}
                    placeholder="Học theo dự án"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">3. Phương Pháp Sư Phạm (Tiếng Anh) - Mỗi phương pháp 1 dòng</label>
                  <textarea
                    rows={2}
                    value={(editing.methodsEn || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, methodsEn: e.target.value.split('\n') })}
                    placeholder="Project-Based Learning"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">4. Kết Quả Đạt Được (Tiếng Việt) - Mỗi kết quả 1 dòng</label>
                  <textarea
                    rows={2}
                    value={(editing.outcomesVi || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, outcomesVi: e.target.value.split('\n') })}
                    placeholder="120 áp phích được hoàn thiện"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">4. Kết Quả Đạt Được (Tiếng Anh) - Mỗi kết quả 1 dòng</label>
                  <textarea
                    rows={2}
                    value={(editing.outcomesEn || []).join('\n')}
                    onChange={(e) => setEditing({ ...editing, outcomesEn: e.target.value.split('\n') })}
                    placeholder="120 student posters created"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">5. Album Hình Ảnh Hoạt Động (Mỗi URL 1 dòng)</label>
                <textarea
                  rows={3}
                  value={(editing.galleryUrls || []).join('\n')}
                  onChange={(e) => setEditing({ ...editing, galleryUrls: e.target.value.split('\n') })}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Video Demo (YouTube/MP4 - Để trống nếu không có)</label>
                <input
                  type="text"
                  value={editing.videoUrl || ''}
                  onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
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
                Lưu Dự Án
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
