import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { GalleryItem } from '../../types';
import { Plus, Edit2, Trash2, Copy, ArrowUp, ArrowDown, Film } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { sanitizeMediaUrl } from '../../utils/urlUtils';

export const GALLERY_CATEGORY_PAIRS = [
  { vi: 'Lớp Học', en: 'Classroom' },
  { vi: 'Hoạt Động Tiếng Anh', en: 'English Activities' },
  { vi: 'Sự Kiện Trường Học', en: 'School Events' },
  { vi: 'Dự Án Học Viên', en: 'Student Projects' },
  { vi: 'Hội Thảo & Tập Huấn', en: 'Workshops' },
  { vi: 'Hoạt Động Giảng Dạy', en: 'Teaching Activities' }
];

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [mediaUrlsText, setMediaUrlsText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Thư viện Ảnh — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getGalleryItems().then(setItems);
  };

  const handleOpenAdd = () => {
    const initialUrl = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';
    setEditing({
      id: '',
      titleEn: '',
      titleVi: '',
      category: 'Lớp Học',
      categoryEn: 'Classroom',
      mediaType: 'image',
      mediaUrl: initialUrl,
      galleryUrls: [initialUrl],
      thumbnailUrl: '',
      descriptionEn: '',
      descriptionVi: '',
      isPublished: true,
      orderIndex: items.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setMediaUrlsText(initialUrl);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditing({ ...item });
    const urls = item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : [item.mediaUrl];
    setMediaUrlsText(urls.join('\n'));
    setModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateGalleryItem(id);
    setItems(updated);
    setToast({ msg: 'Đã nhân bản media thành công!', type: 'success' });
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const updated = await DB.reorderGalleryItems(id, direction);
    setItems(updated);
    setToast({ msg: 'Đã thay đổi thứ tự thành công!', type: 'success' });
  };

  const handleCategoryViChange = (viValue: string) => {
    if (!editing) return;
    const pair = GALLERY_CATEGORY_PAIRS.find(p => p.vi === viValue);
    setEditing({
      ...editing,
      category: viValue,
      categoryEn: pair ? pair.en : editing.categoryEn || 'Classroom'
    });
  };

  const handleCategoryEnChange = (enValue: string) => {
    if (!editing) return;
    const pair = GALLERY_CATEGORY_PAIRS.find(p => p.en === enValue);
    setEditing({
      ...editing,
      categoryEn: enValue,
      category: pair ? pair.vi : editing.category || 'Lớp Học'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    // Parse mediaUrlsText multiline input (Mũi tên 1)
    const galleryArray = mediaUrlsText
      .split('\n')
      .map((u) => sanitizeMediaUrl(u))
      .filter((u) => u.length > 0);

    if (galleryArray.length === 0) {
      setToast({ msg: 'Vui lòng nhập ít nhất 1 link URL hình ảnh/video!', type: 'error' });
      return;
    }

    const firstUrl = galleryArray[0];

    // Thumbnail Cover Image logic (Mũi tên 2)
    // Nếu là ảnh: Lấy ảnh có Link URL dòng đầu tiên (firstUrl) làm bìa Thumbnail.
    // Nếu là video: Lấy ảnh có Link URL từ ô Thumbnail URL (editing.thumbnailUrl), nếu trống fallback firstUrl.
    let effectiveThumbnail = editing.thumbnailUrl || '';
    if (editing.mediaType === 'image') {
      effectiveThumbnail = firstUrl;
    } else if (editing.mediaType === 'youtube' && !effectiveThumbnail) {
      effectiveThumbnail = firstUrl;
    }

    const itemToSave: GalleryItem = {
      ...editing,
      mediaUrl: firstUrl,
      galleryUrls: galleryArray,
      thumbnailUrl: effectiveThumbnail
    };

    const updated = await DB.saveGalleryItem(itemToSave);
    setItems(updated);
    setModalOpen(false);
    setToast({ msg: 'Đã lưu file gallery thành công!', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteGalleryItem(deleteId);
      setItems(updated);
      setToast({ msg: 'Đã xóa file gallery!', type: 'success' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thư Viện Hình Ảnh & Video</h1>
          <p className="text-xs text-slate-500">Quản lý hình ảnh hoạt động lớp học và link video YouTube</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media Mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 w-24 text-center">STT</th>
                <th className="p-4">Xem trước</th>
                <th className="p-4">Tiêu đề (VI)</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4">Loại Media</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, idx) => {
                const coverImg = (item.mediaType === 'image'
                  ? (item.galleryUrls && item.galleryUrls[0]) || item.mediaUrl
                  : item.thumbnailUrl || item.mediaUrl);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
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
                            disabled={idx === items.length - 1}
                            onClick={() => handleReorder(item.id, 'down')}
                            className="p-1 hover:bg-sky-500/10 hover:text-sky-600 rounded disabled:opacity-20 cursor-pointer transition-colors"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <img src={coverImg} alt="" className="w-14 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{item.titleVi}</td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      <div>{item.category}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.categoryEn || 'Classroom'}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="indigo">{item.mediaType}</Badge>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleDuplicate(item.id)}
                        title="Nhân bản media này"
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Chỉnh sửa Thư viện Media" maxWidth="max-w-2xl">
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tiêu đề (Tiếng Việt) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editing.titleVi}
                onChange={(e) => setEditing({ ...editing, titleVi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Title (Tiếng Anh) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editing.titleEn}
                onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
              />
            </div>

            {/* Chuyên Mục (Tiếng Việt) & Chuyên Mục (Tiếng Anh) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chuyên Mục (Tiếng Việt)
                </label>
                <select
                  value={editing.category}
                  onChange={(e) => handleCategoryViChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  {GALLERY_CATEGORY_PAIRS.map((pair) => (
                    <option key={pair.vi} value={pair.vi}>
                      {pair.vi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chuyên Mục (Tiếng Anh)
                </label>
                <select
                  value={editing.categoryEn || 'Classroom'}
                  onChange={(e) => handleCategoryEnChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  {GALLERY_CATEGORY_PAIRS.map((pair) => (
                    <option key={pair.en} value={pair.en}>
                      {pair.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Loại Media</label>
                <select
                  value={editing.mediaType}
                  onChange={(e) => setEditing({ ...editing, mediaType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="image">Hình ảnh (Image)</option>
                  <option value="youtube">YouTube Embed Link</option>
                </select>
              </div>

              {/* MỤC CHI SỐ 2: Thumbnail URL (Bìa xem trước cho Video) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thumbnail URL (Mũi tên 2 - Ảnh bìa xem trước cho Video)
                </label>
                <input
                  type="text"
                  value={editing.thumbnailUrl || ''}
                  onChange={(e) => setEditing({ ...editing, thumbnailUrl: e.target.value })}
                  placeholder="Link ảnh bìa xem trước khi loại media là Video..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            {/* MỤC CHỈ SỐ 1: Media / Video URL (Mỗi URL 1 dòng) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-sky-500" />
                <span>Album Media / Video URL (Mũi tên 1 - Mỗi URL 1 dòng, ít nhất 1 link) <span className="text-red-500">*</span></span>
              </label>
              <textarea
                rows={4}
                required
                value={mediaUrlsText}
                onChange={(e) => setMediaUrlsText(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1...\nhttps://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
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
                Lưu Media
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
