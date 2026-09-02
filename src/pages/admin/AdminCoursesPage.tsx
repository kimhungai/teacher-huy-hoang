import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { Course } from '../../types';
import { Plus, Edit2, Trash2, Copy, Gift, CreditCard, Film, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Quản Lý Khóa Học — Admin CMS';
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await DB.getCourses();
    setCourses(data);
  };

  const handleCreateNew = () => {
    setEditingCourse({
      titleEn: '',
      titleVi: '',
      categoryName: 'Anh văn trẻ em',
      priceType: 'free',
      priceEn: 'Free',
      priceVi: 'Miễn phí',
      gradeLevel: 'Grade 1 - 3 (6-9 tuổi)',
      durationEn: '8 Sessions (4 Weeks)',
      durationVi: '8 Buổi (4 Tuần)',
      scheduleEn: 'Sat & Sun (9:00 - 10:30 AM)',
      scheduleVi: 'Sáng T7 & CN (9:00 - 10:30)',
      descriptionEn: '',
      descriptionVi: '',
      objectivesEn: [''],
      objectivesVi: [''],
      curriculumEn: [''],
      curriculumVi: [''],
      thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      galleryUrls: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'],
      videoUrl: '',
      isFeatured: false,
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (c: Course) => {
    setEditingCourse({ ...c });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateCourse(id);
    setCourses(updated);
    setToastMessage('Đã nhân bản khóa học thành công.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.titleVi) return;

    // Filter non-empty image lines
    const rawGallery = editingCourse.galleryUrls || [];
    const galleryList = rawGallery.map(u => u.trim()).filter(Boolean);
    const mainThumbnail = galleryList.length > 0 ? galleryList[0] : (editingCourse.thumbnailUrl || '');

    const fullCourse: Course = {
      id: editingCourse.id || 'c_' + Date.now(),
      slug: editingCourse.slug || editingCourse.titleVi.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      titleEn: editingCourse.titleEn || editingCourse.titleVi,
      titleVi: editingCourse.titleVi,
      categoryName: editingCourse.categoryName || 'Anh văn trẻ em',
      categoryEn: editingCourse.categoryEn || editingCourse.categoryName,
      priceType: editingCourse.priceType || 'free',
      priceEn: editingCourse.priceEn || 'Free',
      priceVi: editingCourse.priceVi || 'Miễn phí',
      discountPriceVi: editingCourse.priceType === 'free' ? '' : (editingCourse.discountPriceVi || ''),
      discountPriceEn: editingCourse.priceType === 'free' ? '' : (editingCourse.discountPriceEn || ''),
      gradeLevel: editingCourse.gradeLevel || 'Grade 1 - 5',
      gradeLevelEn: editingCourse.gradeLevelEn || editingCourse.gradeLevel,
      durationEn: editingCourse.durationEn || '8 Sessions',
      durationVi: editingCourse.durationVi || '8 Buổi',
      scheduleEn: editingCourse.scheduleEn || 'Weekend',
      scheduleVi: editingCourse.scheduleVi || 'Cuối tuần',
      descriptionEn: editingCourse.descriptionEn || '',
      descriptionVi: editingCourse.descriptionVi || '',
      objectivesEn: (editingCourse.objectivesEn || []).map(s => s.trim()).filter(Boolean),
      objectivesVi: (editingCourse.objectivesVi || []).map(s => s.trim()).filter(Boolean),
      curriculumEn: (editingCourse.curriculumEn || []).map(s => s.trim()).filter(Boolean),
      curriculumVi: (editingCourse.curriculumVi || []).map(s => s.trim()).filter(Boolean),
      thumbnailUrl: mainThumbnail || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      galleryUrls: galleryList.length > 0 ? galleryList : [mainThumbnail],
      videoUrl: (editingCourse.videoUrl || '').trim(),
      isFeatured: editingCourse.isFeatured ?? false,
      isPublished: editingCourse.isPublished ?? true,
      createdAt: editingCourse.createdAt || new Date().toISOString().split('T')[0]
    };

    const updated = await DB.saveCourse(fullCourse);
    setCourses(updated);
    setIsModalOpen(false);
    setToastMessage('Đã lưu thông tin khóa học thành công.');
  };

  const handleDelete = async () => {
    if (deletingId) {
      const updated = await DB.deleteCourse(deletingId);
      setCourses(updated);
      setDeletingId(null);
      setToastMessage('Đã xóa khóa học.');
    }
  };

  const handleExportExcel = () => {
    if (courses.length === 0) {
      setToastMessage('Không có dữ liệu khóa học để xuất Excel.');
      return;
    }

    // CSV Headers
    const headers = [
      'STT',
      'Mã Khóa Học (ID)',
      'Tên Khóa Học (Tiếng Việt)',
      'Tên Khóa Học (Tiếng Anh)',
      'Loại Học Phí',
      'Mức Học Phí Gốc (Tiếng Việt)',
      'Mức Học Phí Gốc (Tiếng Anh)',
      'Mức Học Phí KM (Tiếng Việt)',
      'Mức Học Phí KM (Tiếng Anh)',
      'Khối Lớp (Tiếng Việt)',
      'Khối Lớp (Tiếng Anh)',
      'Thời Lượng (Tiếng Việt)',
      'Lịch Học (Tiếng Việt)',
      'Trạng Thái Xuất Bản',
      'Nổi Bật',
      'Ngày Tạo'
    ];

    // CSV Rows
    const rows = courses.map((c, index) => [
      index + 1,
      `"${c.id}"`,
      `"${(c.titleVi || '').replace(/"/g, '""')}"`,
      `"${(c.titleEn || '').replace(/"/g, '""')}"`,
      `"${c.priceType === 'free' ? 'Miễn phí' : 'Có phí'}"`,
      `"${(c.priceVi || '').replace(/"/g, '""')}"`,
      `"${(c.priceEn || '').replace(/"/g, '""')}"`,
      `"${(c.discountPriceVi || '').replace(/"/g, '""')}"`,
      `"${(c.discountPriceEn || '').replace(/"/g, '""')}"`,
      `"${(c.gradeLevel || '').replace(/"/g, '""')}"`,
      `"${(c.gradeLevelEn || '').replace(/"/g, '""')}"`,
      `"${(c.durationVi || '').replace(/"/g, '""')}"`,
      `"${(c.scheduleVi || '').replace(/"/g, '""')}"`,
      `"${c.isPublished ? 'Đã xuất bản' : 'Bản nháp'}"`,
      `"${c.isFeatured ? 'Có' : 'Không'}"`,
      `"${(c.createdAt || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Danh_Sach_Khoa_Hoc_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('Đã xuất toàn bộ danh sách khóa học sang file Excel thành công!');
  };

  return (
    <div className="space-y-6 text-left">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Các Khóa Học</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Thêm, sửa, xóa, nhân bản các khóa học Tiếng Anh Miễn phí & Có phí.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* NÚT XUẤT BẢNG SANG EXCEL (TẠI MŨI TÊN CHỈ ĐỊNH) */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
            title="Xuất dữ liệu khóa học ra tập tin Excel (CSV)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất bảng sang Excel</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khóa Học Mới</span>
          </button>
        </div>
      </div>

      {/* Courses List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Khóa Học</th>
                <th className="px-4 py-3">Mức Giá / Khóa Học</th>
                <th className="px-4 py-3 text-amber-600 dark:text-amber-400">Mức Giá KM / Khóa Học</th>
                <th className="px-4 py-3">Khối Lớp</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.thumbnailUrl} alt="" className="w-12 h-10 object-cover rounded-lg" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.titleVi}</div>
                        <div className="text-[11px] text-slate-400">{c.titleEn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.priceType === 'free' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <Gift className="w-3 h-3" />
                        Miễn phí (Free)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                        <CreditCard className="w-3 h-3" />
                        {c.priceVi}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                    {c.priceType === 'paid' && (c.discountPriceVi || c.discountPriceEn) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20">
                        🔥 {c.discountPriceVi || c.discountPriceEn}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                    {c.gradeLevel}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {c.isPublished ? (
                        <Badge variant="emerald">Đã xuất bản</Badge>
                      ) : (
                        <Badge variant="amber">Nháp</Badge>
                      )}
                      {c.isFeatured && <Badge variant="indigo">Nổi bật</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(c.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Nhân bản khóa học"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(c.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {editingCourse && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCourse.id ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Tên Khóa Học (Tiếng Việt) *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.titleVi || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, titleVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Tên Khóa Học (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingCourse.titleEn || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, titleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Chuyên Mục (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingCourse.categoryName || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, categoryName: e.target.value })}
                  placeholder="Anh văn trẻ em, Luyện văn phạm..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Chuyên Mục (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingCourse.categoryEn || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, categoryEn: e.target.value })}
                  placeholder="Young Learners English, Grammar Mastery..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Loại Khóa Học</label>
                <select
                  value={editingCourse.priceType || 'free'}
                  onChange={(e) => {
                    const type = e.target.value as 'free' | 'paid';
                    setEditingCourse({
                      ...editingCourse,
                      priceType: type,
                      priceVi: type === 'free' ? 'Miễn phí' : editingCourse.priceVi,
                      priceEn: type === 'free' ? 'Free' : editingCourse.priceEn
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                >
                  <option value="free">Miễn phí (Free)</option>
                  <option value="paid">Có phí (Paid)</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mức Học Phí (Tiếng Việt)</label>
                <input
                  type="text"
                  disabled={editingCourse.priceType === 'free'}
                  value={editingCourse.priceType === 'free' ? 'Miễn phí' : (editingCourse.priceVi || '')}
                  onChange={(e) => setEditingCourse({ ...editingCourse, priceVi: e.target.value })}
                  placeholder="450.000 VNĐ / Khóa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mức Học Phí (Tiếng Anh)</label>
                <input
                  type="text"
                  disabled={editingCourse.priceType === 'free'}
                  value={editingCourse.priceType === 'free' ? 'Free' : (editingCourse.priceEn || '')}
                  onChange={(e) => setEditingCourse({ ...editingCourse, priceEn: e.target.value })}
                  placeholder="$20 / Course"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* MŨI TÊN 2: Mức Học Phí KM (Tiếng Việt) */}
              <div>
                <label className="block font-extrabold text-rose-600 dark:text-rose-400 text-xs mb-1.5 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Mức Học Phí KM (Tiếng Việt)</span>
                </label>
                <input
                  type="text"
                  disabled={editingCourse.priceType === 'free'}
                  value={editingCourse.priceType === 'free' ? '' : (editingCourse.discountPriceVi || '')}
                  onChange={(e) => setEditingCourse({ ...editingCourse, discountPriceVi: e.target.value })}
                  placeholder="350.000 VNĐ / Khóa (Để trống nếu không KM)"
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* MŨI TÊN 3: Mức Học Phí KM (Tiếng Anh) */}
              <div>
                <label className="block font-extrabold text-rose-600 dark:text-rose-400 text-xs mb-1.5 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Mức Học Phí KM (Tiếng Anh)</span>
                </label>
                <input
                  type="text"
                  disabled={editingCourse.priceType === 'free'}
                  value={editingCourse.priceType === 'free' ? '' : (editingCourse.discountPriceEn || '')}
                  onChange={(e) => setEditingCourse({ ...editingCourse, discountPriceEn: e.target.value })}
                  placeholder="$15 / Course (Để trống nếu không KM)"
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Khối Lớp / Độ Tuổi (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingCourse.gradeLevel || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, gradeLevel: e.target.value })}
                  placeholder="Lớp 1 - 3 (6-9 tuổi)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Khối Lớp / Độ Tuổi (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingCourse.gradeLevelEn || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, gradeLevelEn: e.target.value })}
                  placeholder="Grade 1 - 3 (Ages 6-9)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Thời Lượng (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingCourse.durationVi || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, durationVi: e.target.value })}
                  placeholder="8 Buổi (4 Tuần)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Thời Lượng (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingCourse.durationEn || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, durationEn: e.target.value })}
                  placeholder="8 Sessions (4 Weeks)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Lịch Học (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingCourse.scheduleVi || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, scheduleVi: e.target.value })}
                  placeholder="Sáng T7 & CN (9:00 - 10:30)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Lịch Học (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingCourse.scheduleEn || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, scheduleEn: e.target.value })}
                  placeholder="Sat & Sun Morning (9:00 - 10:30 AM)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mô Tả Khóa Học (Tiếng Việt)</label>
                <textarea
                  rows={3}
                  value={editingCourse.descriptionVi || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, descriptionVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mô Tả Khóa Học (Tiếng Anh)</label>
                <textarea
                  rows={3}
                  value={editingCourse.descriptionEn || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* MỤC 1: Objectives & Curriculum Textareas for VI & EN */}
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Chi Tiết Nội Dung Khóa Học (Mục Tiêu & Chương Trình)
              </h3>

              {/* Objectives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Mục Tiêu Khóa Học (Tiếng Việt) - Mỗi mục 1 dòng
                  </label>
                  <textarea
                    rows={3}
                    value={(editingCourse.objectivesVi || []).join('\n')}
                    onChange={(e) => setEditingCourse({ ...editingCourse, objectivesVi: e.target.value.split('\n') })}
                    placeholder="Làm chủ 50+ từ vựng cơ bản...&#10;Tạo sự tự tin phản xạ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Mục Tiêu Khóa Học (Tiếng Anh) - Mỗi mục 1 dòng
                  </label>
                  <textarea
                    rows={3}
                    value={(editingCourse.objectivesEn || []).join('\n')}
                    onChange={(e) => setEditingCourse({ ...editingCourse, objectivesEn: e.target.value.split('\n') })}
                    placeholder="Master 50+ basic sight words...&#10;Build confidence..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Curriculum */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Nội Dung Chương Trình (Tiếng Việt) - Mỗi buổi/chương 1 dòng
                  </label>
                  <textarea
                    rows={4}
                    value={(editingCourse.curriculumVi || []).join('\n')}
                    onChange={(e) => setEditingCourse({ ...editingCourse, curriculumVi: e.target.value.split('\n') })}
                    placeholder="Buổi 1: Chào hỏi & Từ vựng Gia đình...&#10;Buổi 2: Luyện phát âm Phonics..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Nội Dung Chương Trình (Tiếng Anh) - Mỗi buổi/chương 1 dòng
                  </label>
                  <textarea
                    rows={4}
                    value={(editingCourse.curriculumEn || []).join('\n')}
                    onChange={(e) => setEditingCourse({ ...editingCourse, curriculumEn: e.target.value.split('\n') })}
                    placeholder="Session 1: Hello Friends & Family...&#10;Session 2: Phonics Letters A-D..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* MỤC 4: Album Ảnh Khóa Học (Mỗi URL 1 dòng) */}
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>Album Hình Ảnh Khóa Học (Mỗi URL 1 dòng)</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                📌 Lưu ý: URL hình ảnh ở dòng đầu tiên sẽ tự động làm ảnh bìa Thumbnail & hình banner nằm ở phía trên cùng của trang xem chi tiết khóa học.
              </p>
              <textarea
                rows={3}
                value={(editingCourse.galleryUrls || (editingCourse.thumbnailUrl ? [editingCourse.thumbnailUrl] : [])).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  const firstValid = lines.find(u => u.trim()) || editingCourse.thumbnailUrl || '';
                  setEditingCourse({
                    ...editingCourse,
                    galleryUrls: lines,
                    thumbnailUrl: firstValid
                  });
                }}
                placeholder="https://images.unsplash.com/photo-1509062522246-3755977927d7...&#10;https://images.unsplash.com/photo-1577896851231..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* MỤC 3: Video Khóa Học ở CUỐI FORM */}
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1">
                <Film className="w-4 h-4 text-amber-500" />
                <span>URL Video Demo (YouTube/MP4 - Để trống nếu không có)</span>
              </label>
              <input
                type="text"
                value={editingCourse.videoUrl || ''}
                onChange={(e) => setEditingCourse({ ...editingCourse, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={editingCourse.isPublished ?? true}
                  onChange={(e) => setEditingCourse({ ...editingCourse, isPublished: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Xuất bản ngay</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={editingCourse.isFeatured ?? false}
                  onChange={(e) => setEditingCourse({ ...editingCourse, isFeatured: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Khóa học Nổi bật</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/30 cursor-pointer"
              >
                Lưu Khóa Học
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Xóa Khóa Học"
        message="Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};
