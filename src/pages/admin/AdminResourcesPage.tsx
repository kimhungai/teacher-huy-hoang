import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { TeachingResource } from '../../types';
import { Plus, Edit2, Trash2, Copy, Gift, CreditCard, Film, Image as ImageIcon, Download, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

export const AdminResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<TeachingResource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<TeachingResource> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Quản Lý Kho Học Liệu & Thiết Bị — Admin CMS';
    loadResources();
  }, []);

  const loadResources = async () => {
    const data = await DB.getResources();
    setResources(data);
  };

  const handleCreateNew = () => {
    setEditingResource({
      titleEn: '',
      titleVi: '',
      categoryName: 'Sách & Giáo trình',
      resourceType: 'digital_file',
      priceType: 'free',
      priceEn: 'Free',
      priceVi: 'Miễn phí',
      grade: 'Grade 1 - 5',
      fileType: 'PDF / File Số',
      fileUrl: '',
      previewUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
      galleryUrls: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'],
      videoUrl: '',
      specificationsEn: [''],
      specificationsVi: [''],
      downloadCount: 0,
      isFeatured: false,
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (r: TeachingResource) => {
    setEditingResource({ ...r });
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateResource(id);
    setResources(updated);
    setToastMessage('Đã nhân bản học liệu thành công.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !editingResource.titleVi) return;

    // Process multi-line gallery URLs
    const rawGallery = editingResource.galleryUrls || [];
    const galleryList = rawGallery.map(u => u.trim()).filter(Boolean);
    const mainCover = galleryList.length > 0 ? galleryList[0] : (editingResource.previewUrl || '');

    const fullResource: TeachingResource = {
      id: editingResource.id || 'res_' + Date.now(),
      slug: editingResource.slug || editingResource.titleVi.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      titleEn: editingResource.titleEn || editingResource.titleVi,
      titleVi: editingResource.titleVi,
      categoryName: editingResource.categoryName || 'File Học liệu Số',
      categoryEn: editingResource.categoryEn || editingResource.categoryName,
      resourceType: editingResource.resourceType || 'digital_file',
      priceType: editingResource.priceType || 'free',
      priceEn: editingResource.priceEn || 'Free',
      priceVi: editingResource.priceVi || 'Miễn phí',
      discountPriceVi: editingResource.discountPriceVi || '',
      discountPriceEn: editingResource.discountPriceEn || '',
      grade: editingResource.grade || 'Grade 1 - 5',
      gradeEn: editingResource.gradeEn || editingResource.grade,
      fileType: editingResource.fileType || 'PDF',
      fileTypeEn: editingResource.fileTypeEn || editingResource.fileType,
      fileUrl: (editingResource.fileUrl || '').trim(),
      previewUrl: mainCover || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
      galleryUrls: galleryList.length > 0 ? galleryList : [mainCover],
      videoUrl: (editingResource.videoUrl || '').trim(),
      descriptionEn: editingResource.descriptionEn || '',
      descriptionVi: editingResource.descriptionVi || '',
      specificationsEn: (editingResource.specificationsEn || []).map(s => s.trim()).filter(Boolean),
      specificationsVi: (editingResource.specificationsVi || []).map(s => s.trim()).filter(Boolean),
      downloadCount: editingResource.downloadCount || 0,
      tags: editingResource.tags || [],
      isFeatured: editingResource.isFeatured ?? false,
      isPublished: editingResource.isPublished ?? true,
      createdAt: editingResource.createdAt || new Date().toISOString().split('T')[0]
    };

    const updated = await DB.saveResource(fullResource);
    setResources(updated);
    setIsModalOpen(false);
    setToastMessage('Đã lưu thông tin học liệu thành công.');
  };

  const handleDelete = async () => {
    if (deletingId) {
      const updated = await DB.deleteResource(deletingId);
      setResources(updated);
      setDeletingId(null);
      setToastMessage('Đã xóa học liệu.');
    }
  };

  const handleExportExcel = () => {
    if (resources.length === 0) {
      setToastMessage('Không có dữ liệu học liệu để xuất Excel.');
      return;
    }

    // CSV Headers
    const headers = [
      'STT',
      'Mã Học Liệu (ID)',
      'Tên Học Liệu (Tiếng Việt)',
      'Tên Học Liệu (Tiếng Anh)',
      'Danh Mục (Tiếng Việt)',
      'Danh Mục (Tiếng Anh)',
      'Phân Loại Học Liệu',
      'Loại Giá (Miễn phí / Có phí)',
      'Mức Giá Học Liệu (Tiếng Việt)',
      'Mức Giá Học Liệu (Tiếng Anh)',
      'Mức Giá KM (Tiếng Việt)',
      'Mức Giá KM (Tiếng Anh)',
      'Định Dạng / Định Loại',
      'Khối Lớp / Độ Tuổi',
      'Lượt Tải / Đăng Ký',
      'Trạng Thái Xuất Bản',
      'Nổi Bật',
      'Ngày Tạo'
    ];

    // CSV Rows
    const rows = resources.map((r, index) => {
      let typeText: string = r.resourceType;
      if (r.resourceType === 'book') typeText = 'Sách & Giáo trình';
      if (r.resourceType === 'software') typeText = 'Phần mềm & App';
      if (r.resourceType === 'digital_file') typeText = 'File Học liệu Số';
      if (r.resourceType === 'teaching_tool') typeText = 'Dụng cụ & Giáo cụ';
      if (r.resourceType === 'audio_visual') typeText = 'Thiết bị Nghe nhìn';

      return [
        index + 1,
        `"${r.id}"`,
        `"${(r.titleVi || '').replace(/"/g, '""')}"`,
        `"${(r.titleEn || '').replace(/"/g, '""')}"`,
        `"${(r.categoryName || '').replace(/"/g, '""')}"`,
        `"${(r.categoryEn || r.categoryName || '').replace(/"/g, '""')}"`,
        `"${typeText}"`,
        `"${r.priceType === 'free' ? 'Miễn phí' : 'Có phí'}"`,
        `"${(r.priceVi || '').replace(/"/g, '""')}"`,
        `"${(r.priceEn || '').replace(/"/g, '""')}"`,
        `"${(r.discountPriceVi || '').replace(/"/g, '""')}"`,
        `"${(r.discountPriceEn || '').replace(/"/g, '""')}"`,
        `"${(r.fileType || '').replace(/"/g, '""')}"`,
        `"${(r.grade || '').replace(/"/g, '""')}"`,
        r.downloadCount || 0,
        `"${r.isPublished ? 'Đã xuất bản' : 'Bản nháp'}"`,
        `"${r.isFeatured ? 'Có' : 'Không'}"`,
        `"${(r.createdAt || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Kho_Hoc_Lieu_Thiet_Bi_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('Đã xuất toàn bộ danh sách kho học liệu sang file Excel thành công!');
  };

  return (
    <div className="space-y-6 text-left">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Kho Học Liệu & Thiết Bị</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đăng sách, phần mềm, file học liệu số, dụng cụ & thiết bị nghe nhìn (Miễn phí & Có phí).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* NÚT XUẤT BẢNG SANG EXCEL (TẠI MŨI TÊN CHỈ ĐỊNH) */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
            title="Xuất dữ liệu học liệu & thiết bị ra tập tin Excel (CSV)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất bảng sang Excel</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Học Liệu Mới</span>
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Học Liệu</th>
                <th className="px-4 py-3">Mức Giá / Học Liệu</th>
                <th className="px-4 py-3 text-amber-600 dark:text-amber-400">Mức Giá KM / Học liệu</th>
                <th className="px-4 py-3">Loại học liệu & Khối</th>
                <th className="px-4 py-3">Lượt Tải</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={r.previewUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'} alt="" className="w-12 h-10 object-cover rounded-lg" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{r.titleVi}</div>
                        <div className="text-[11px] text-slate-400">{r.categoryName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.priceType === 'free' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-[11px]">
                        <Gift className="w-3 h-3" /> Miễn phí
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold text-[11px]">
                        <CreditCard className="w-3 h-3" /> {r.priceVi}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                    {r.priceType === 'paid' && (r.discountPriceVi || r.discountPriceEn) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20">
                        🔥 {r.discountPriceVi || r.discountPriceEn}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                    <div>{r.fileType}</div>
                    <div className="text-[11px] text-slate-400">{r.grade}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">
                    {r.downloadCount || 0}
                  </td>
                  {/* REQUIREMENT 5: Cột Trạng Thái hiển thị thêm nhãn Nổi bật */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {r.isPublished ? (
                        <Badge variant="emerald">Đã xuất bản</Badge>
                      ) : (
                        <Badge variant="amber">Nháp</Badge>
                      )}
                      {r.isFeatured && <Badge variant="indigo">Nổi bật</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Nhân bản"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(r)}
                        className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(r.id)}
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
      {editingResource && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingResource.id ? 'Chỉnh Sửa Học Liệu' : 'Thêm Học Liệu Mới'}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Tên Học Liệu (Tiếng Việt) *</label>
                <input
                  type="text"
                  required
                  value={editingResource.titleVi || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, titleVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Tên Học Liệu (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingResource.titleEn || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, titleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Chuyên Mục (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingResource.categoryName || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, categoryName: e.target.value })}
                  placeholder="Sách & Giáo trình, File Học liệu Số..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Chuyên Mục (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingResource.categoryEn || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, categoryEn: e.target.value })}
                  placeholder="Books & Curriculum, Digital Resources..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Hình Thức Giá Phí</label>
                <select
                  value={editingResource.priceType || 'free'}
                  onChange={(e) => {
                    const type = e.target.value as 'free' | 'paid';
                    setEditingResource({
                      ...editingResource,
                      priceType: type,
                      priceVi: type === 'free' ? 'Miễn phí' : editingResource.priceVi,
                      priceEn: type === 'free' ? 'Free' : editingResource.priceEn
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                >
                  <option value="free">Miễn phí (Free)</option>
                  <option value="paid">Có phí (Paid)</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mức Giá Học liệu (Tiếng Việt)</label>
                <input
                  type="text"
                  disabled={editingResource.priceType === 'free'}
                  value={editingResource.priceType === 'free' ? 'Miễn phí' : (editingResource.priceVi || '')}
                  onChange={(e) => setEditingResource({ ...editingResource, priceVi: e.target.value })}
                  placeholder="180.000 VNĐ / Bộ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mức Giá Học liệu (Tiếng Anh)</label>
                <input
                  type="text"
                  disabled={editingResource.priceType === 'free'}
                  value={editingResource.priceType === 'free' ? 'Free' : (editingResource.priceEn || '')}
                  onChange={(e) => setEditingResource({ ...editingResource, priceEn: e.target.value })}
                  placeholder="$8 / Set"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* MŨI TÊN 2: Mức Giá Học liệu KM (Tiếng Việt) */}
              <div>
                <label className="block font-extrabold text-rose-600 dark:text-rose-400 text-xs mb-1.5 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Mức Giá Học liệu KM (Tiếng Việt)</span>
                </label>
                <input
                  type="text"
                  disabled={editingResource.priceType === 'free'}
                  value={editingResource.priceType === 'free' ? '' : (editingResource.discountPriceVi || '')}
                  onChange={(e) => setEditingResource({ ...editingResource, discountPriceVi: e.target.value })}
                  placeholder="140.000 VNĐ / Bộ (Để trống nếu không KM)"
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* MŨI TÊN 3: Mức Giá Học liệu KM (Tiếng Anh) */}
              <div>
                <label className="block font-extrabold text-rose-600 dark:text-rose-400 text-xs mb-1.5 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Mức Giá Học liệu KM (Tiếng Anh)</span>
                </label>
                <input
                  type="text"
                  disabled={editingResource.priceType === 'free'}
                  value={editingResource.priceType === 'free' ? '' : (editingResource.discountPriceEn || '')}
                  onChange={(e) => setEditingResource({ ...editingResource, discountPriceEn: e.target.value })}
                  placeholder="$6 / Set (Để trống nếu không KM)"
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white disabled:opacity-50"
                />
              </div>

              {/* MŨI TÊN 1: Khối Lớp / Độ Tuổi */}
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Khối Lớp / Độ Tuổi (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingResource.grade || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, grade: e.target.value })}
                  placeholder="Lớp 1 - 5 (6-11 tuổi)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Khối Lớp / Độ Tuổi (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingResource.gradeEn || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, gradeEn: e.target.value })}
                  placeholder="Grade 1 - 5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* MŨI TÊN 2: Loại học liệu / Định dạng */}
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Loại học liệu / Định dạng (Tiếng Việt)</label>
                <input
                  type="text"
                  value={editingResource.fileType || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, fileType: e.target.value })}
                  placeholder="File PDF / Phần mềm / Sách giấy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Loại học liệu / Định dạng (Tiếng Anh)</label>
                <input
                  type="text"
                  value={editingResource.fileTypeEn || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, fileTypeEn: e.target.value })}
                  placeholder="PDF File / Software / Physical Book"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mô Tả Chi Tiết (Tiếng Việt)</label>
                <textarea
                  rows={3}
                  value={editingResource.descriptionVi || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, descriptionVi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Mô Tả Chi Tiết (Tiếng Anh)</label>
                <textarea
                  rows={3}
                  value={editingResource.descriptionEn || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* REQUIREMENT 2: Mục Thông Tin Chi Tiết & Tính Năng (specifications) */}
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                1. Thông Tin Chi Tiết & Tính Năng Học Liệu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Thông Tin Chi Tiết & Tính Năng (Tiếng Việt) - Mỗi mục 1 dòng
                  </label>
                  <textarea
                    rows={9}
                    value={(editingResource.specificationsVi || []).join('\n')}
                    onChange={(e) => setEditingResource({ ...editingResource, specificationsVi: e.target.value.split('\n') })}
                    placeholder="Bao gồm 3 cuốn sách truyện...&#10;In màu toàn bộ 48 trang..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Thông Tin Chi Tiết & Tính Năng (Tiếng Anh) - Mỗi mục 1 dòng
                  </label>
                  <textarea
                    rows={9}
                    value={(editingResource.specificationsEn || []).join('\n')}
                    onChange={(e) => setEditingResource({ ...editingResource, specificationsEn: e.target.value.split('\n') })}
                    placeholder="Includes 3 storybooks...&#10;Full color 48 pages..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* REQUIREMENT 2: Link Tải File (Item 2) */}
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1">
                <Download className="w-4 h-4 text-emerald-500" />
                <span>2. URL Link Tải File (nếu có)</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-1">
                📌 Nếu có link ở đây thì hiển thị nút tải file cho người xem. Nếu để trống thì hiển thị: "Vui lòng Đăng Ký Nhận / Đặt Mua Học Liệu".
              </p>
              <input
                type="text"
                value={editingResource.fileUrl || ''}
                onChange={(e) => setEditingResource({ ...editingResource, fileUrl: e.target.value })}
                placeholder="https://drive.google.com/file/d/... hoặc link file PDF/ZIP"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* REQUIREMENT 5: Album Ảnh Học Liệu (Item 3 - Mỗi URL 1 dòng) */}
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>3. Album Hình Ảnh Học Liệu (Mỗi URL 1 dòng)</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-1">
                📌 Lưu ý: URL hình ảnh ở dòng đầu tiên sẽ tự động làm ảnh bìa Thumbnail & hình banner nằm ở phía trên cùng của trang xem chi tiết học liệu.
              </p>
              <textarea
                rows={3}
                value={(editingResource.galleryUrls || (editingResource.previewUrl ? [editingResource.previewUrl] : [])).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  const firstValid = lines.find(u => u.trim()) || editingResource.previewUrl || '';
                  setEditingResource({
                    ...editingResource,
                    galleryUrls: lines,
                    previewUrl: firstValid
                  });
                }}
                placeholder="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c...&#10;https://images.unsplash.com/photo-1503676260728..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* REQUIREMENT 4: Video Demo Học Liệu (Item 4 - CUỐI FORM) */}
            <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1">
                <Film className="w-4 h-4 text-amber-500" />
                <span>4. URL Video Demo (YouTube/MP4 - Để trống nếu không có)</span>
              </label>
              <input
                type="text"
                value={editingResource.videoUrl || ''}
                onChange={(e) => setEditingResource({ ...editingResource, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={editingResource.isPublished ?? true}
                  onChange={(e) => setEditingResource({ ...editingResource, isPublished: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Xuất bản ngay</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={editingResource.isFeatured ?? false}
                  onChange={(e) => setEditingResource({ ...editingResource, isFeatured: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Học liệu Nổi bật</span>
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
                Lưu Học Liệu
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
        title="Xóa Học Liệu"
        message="Bạn có chắc chắn muốn xóa học liệu này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};
