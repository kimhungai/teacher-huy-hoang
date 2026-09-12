import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { BlogPost } from '../../types';
import { Plus, Edit2, Trash2, Copy, Calendar, Clock, Film, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { getBlogCategoryLabel } from '../../utils/blogUtils';

export const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Blog — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getBlogPosts().then(setPosts);
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const updated = await DB.reorderBlogPosts(id, direction);
    setPosts(updated);
    setToast({ msg: 'Đã cập nhật thứ tự ưu tiên hiển thị!', type: 'success' });
  };

  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    const initialPost: BlogPost = {
      id: '',
      slug: '',
      titleEn: '',
      titleVi: '',
      excerptEn: '',
      excerptVi: '',
      contentEn: '',
      contentVi: '',
      featuredImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      galleryUrls: [
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      categoryName: 'Teaching Tips',
      categoryEn: 'Teaching Tips',
      tags: ['Teaching Tips'],
      author: 'Nguyễn Trọng Huy Hoàng',
      readingTimeEn: '5 min read',
      readingTimeVi: '5 phút đọc',
      status: 'published',
      scheduledDate: today,
      isFeatured: false,
      publishedAt: today,
      createdAt: today
    };

    setEditing(initialPost);
    setGalleryUrlsText(initialPost.galleryUrls ? initialPost.galleryUrls.join('\n') : initialPost.featuredImage);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: BlogPost) => {
    setEditing({ ...item });
    const urls = item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : [item.featuredImage];
    setGalleryUrlsText(urls.join('\n'));
    setModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    const updated = await DB.duplicateBlogPost(id);
    setPosts(updated);
    setToast({ msg: 'Đã nhân bản bài viết thành công!', type: 'success' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    // Process Gallery URLs (Line 1 is featured cover image)
    const galleryArray = galleryUrlsText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const firstImage = galleryArray.length > 0 ? galleryArray[0] : editing.featuredImage;

    // Sync excerpt from content if empty
    const excerptVi = editing.excerptVi.trim() || editing.contentVi.slice(0, 150) + '...';
    const excerptEn = editing.excerptEn.trim() || editing.contentEn.slice(0, 150) + '...';

    // Check if publishing or re-publishing
    const today = new Date().toISOString().split('T')[0];
    let newPublishedAt = editing.publishedAt;
    
    // Find original post to detect status change
    const originalPost = posts.find(p => p.id === editing.id);
    if (editing.status === 'published') {
      if (!originalPost || originalPost.status === 'unpublished' || !editing.publishedAt) {
        newPublishedAt = today; // Gán ngày mới xuất bản khi chuyển sang Publish
      }
    }

    const postToSave: BlogPost = {
      ...editing,
      featuredImage: firstImage,
      galleryUrls: galleryArray.length > 0 ? galleryArray : [firstImage],
      excerptVi,
      excerptEn,
      publishedAt: newPublishedAt
    };

    const updated = await DB.saveBlogPost(postToSave);
    setPosts(updated);
    setModalOpen(false);
    setToast({ msg: 'Đã lưu bài viết blog thành công!', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteBlogPost(deleteId);
      setPosts(updated);
      setToast({ msg: 'Đã xóa bài viết!', type: 'success' });
    }
  };

  // Helper for displaying "Ngày xuất bản" column
  const renderPublishDate = (item: BlogPost) => {
    if (item.status === 'published') {
      return item.publishedAt || item.createdAt;
    }
    if (item.status === 'scheduled') {
      return item.scheduledDate ? `${item.scheduledDate} (Lên lịch)` : `${item.publishedAt} (Lên lịch)`;
    }
    return <span className="text-slate-400 font-normal">-</span>;
  };

  // Helper for status badge
  const renderStatusBadge = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return <Badge variant="emerald">Publish</Badge>;
      case 'unpublished':
        return <Badge variant="rose">UnPublished</Badge>;
      case 'scheduled':
        return <Badge variant="amber">Scheduled</Badge>;
      default:
        return <Badge variant="slate">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bài Viết Blog Giáo Dục</h1>
          <p className="text-xs text-slate-500">Quản lý bài viết kinh nghiệm giảng dạy, chuyên môn & chia sẻ phương pháp</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Viết Bài Mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">STT & Thứ tự</th>
                <th className="p-4">Ảnh</th>
                <th className="p-4">Tiêu đề bài viết</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4">Thời gian đọc</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày xuất bản</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {posts.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{idx + 1}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(item.id, 'up')}
                          disabled={idx === 0}
                          className="text-slate-400 hover:text-sky-500 disabled:opacity-30 cursor-pointer"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReorder(item.id, 'down')}
                          disabled={idx === posts.length - 1}
                          className="text-slate-400 hover:text-sky-500 disabled:opacity-30 cursor-pointer"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <img
                      src={item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls[0] : item.featuredImage}
                      alt=""
                      className="w-14 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{item.titleVi}</td>
                  <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                    {getBlogCategoryLabel(item.categoryName, item.categoryEn, 'vi')}
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>{item.readingTimeVi}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    {renderPublishDate(item)}
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleDuplicate(item.id)}
                      title="Nhân bản bài viết này"
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Chỉnh sửa bài viết"
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      title="Xóa bài viết"
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Bài viết Blog Giáo Dục" maxWidth="max-w-3xl">
        {editing && (
          <form onSubmit={handleSave} className="space-y-5 text-left">
            {/* Title VI & EN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tiêu đề Bài viết (Tiếng Việt) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editing.titleVi}
                onChange={(e) => setEditing({ ...editing, titleVi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chuyên mục</label>
                <select
                  value={editing.categoryName}
                  onChange={(e) => setEditing({ ...editing, categoryName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <option value="Teaching Tips">Teaching Tips (Mẹo Giảng Dạy)</option>
                  <option value="English Learning Tips">English Learning Tips (Kinh Nghệm Học Tiếng Anh)</option>
                  <option value="Classroom Management">Classroom Management (Quản Lý Lớp Học)</option>
                  <option value="Educational Technology">Educational Technology (Công Nghệ Giáo Dục)</option>
                  <option value="AI in Education">AI in Education (Ứng Dụng AI Trong Giảng Dạy)</option>
                  <option value="Lesson Ideas">Lesson Ideas (Ý Tưởng Bài Giảng)</option>
                  <option value="Teaching Experiences">Teaching Experiences (Trải Nghiệm Thực Tế)</option>
                  <option value="Student Activities">Student Activities (Hoạt Động Học Sinh)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trạng thái (Status)</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="published">Publish (Xuất bản)</option>
                  <option value="unpublished">UnPublish (Bỏ xuất bản)</option>
                  <option value="draft">Draft (Bản nháp)</option>
                  <option value="scheduled">Schedule (Lên lịch xuất bản)</option>
                </select>
              </div>
            </div>

            {/* MỤC 3: Mốc Ngày cần xuất bản (Nếu chọn Schedule) */}
            {editing.status === 'scheduled' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Mốc Ngày Cần Xuất Bản (Scheduled Date)</span>
                </label>
                <input
                  type="date"
                  required
                  value={editing.scheduledDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditing({ ...editing, scheduledDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* MỤC 2: Thời gian đọc (Reading Time VI & EN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Thời gian đọc (Tiếng Việt)</span>
                </label>
                <input
                  type="text"
                  value={editing.readingTimeVi}
                  onChange={(e) => setEditing({ ...editing, readingTimeVi: e.target.value })}
                  placeholder="Ví dụ: 5 phút đọc"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Reading Time (Tiếng Anh)</span>
                </label>
                <input
                  type="text"
                  value={editing.readingTimeEn}
                  onChange={(e) => setEditing({ ...editing, readingTimeEn: e.target.value })}
                  placeholder="Example: 5 min read"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Nội dung chi tiết VI & EN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nội dung chi tiết (Tiếng Việt)</label>
              <textarea
                rows={6}
                value={editing.contentVi}
                onChange={(e) => setEditing({ ...editing, contentVi: e.target.value })}
                placeholder="Nhập nội dung bài viết chia sẻ chuyên môn..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Content detail (Tiếng Anh)</label>
              <textarea
                rows={6}
                value={editing.contentEn}
                onChange={(e) => setEditing({ ...editing, contentEn: e.target.value })}
                placeholder="Enter detailed blog post content in English..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            {/* MỤC 4: Các Hình Ảnh Bài Viết (Mỗi URL 1 dòng, Dòng 1 làm Thumbnail & Banner) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>Album Hình Ảnh Bài Viết (Mỗi URL 1 dòng - Dòng 1 dùng làm Bìa Thumbnail & Banner trên cùng)</span>
              </label>
              <textarea
                rows={4}
                value={galleryUrlsText}
                onChange={(e) => setGalleryUrlsText(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            {/* MỤC 5: URL Video Bài Giảng / Hoạt Động (NẰM Ở DƯỚI CÙNG CỦA FORM) */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-amber-500" />
                <span>URL Video Minh Họa / Bài Giảng (YouTube/MP4 - Để trống nếu không có)</span>
              </label>
              <input
                type="url"
                value={editing.videoUrl || ''}
                onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
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
              <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md">
                Lưu Bài Viết
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
