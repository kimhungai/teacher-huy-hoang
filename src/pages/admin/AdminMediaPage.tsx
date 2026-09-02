import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { MediaFile } from '../../types';
import { Upload, Copy, Trash2, Check } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Toast } from '../../components/common/Toast';

export const AdminMediaPage: React.FC = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.title = 'Media Library — Admin CMS';
    loadData();
  }, []);

  const loadData = () => {
    DB.getMediaFiles().then(setMedia);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setToast({ msg: 'Đã sao chép đường dẫn URL!', type: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      const updated = await DB.deleteMediaFile(deleteId);
      setMedia(updated);
      setToast({ msg: 'Đã xóa file media!', type: 'success' });
    }
  };

  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: MediaFile = {
        id: 'm_' + Date.now(),
        filename: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = await DB.addMediaFile(newFile);
      setMedia(updated);
      setToast({ msg: `Đã upload file ${file.name} thành công!`, type: 'success' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Media Library (Thư Viện Tệp)</h1>
          <p className="text-xs text-slate-500">Quản lý file phương tiện upload lên Supabase Storage Buckets</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload File Mới</span>
          <input type="file" onChange={handleSimulatedUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {item.fileType.startsWith('image') ? (
                <img src={item.fileUrl} alt={item.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs font-bold text-slate-400 p-2 text-center uppercase">{item.fileType}</div>
              )}
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{item.filename}</div>
              <div className="text-[11px] text-slate-400">{item.createdAt}</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleCopy(item.fileUrl, item.id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
