import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy dữ liệu',
  description = 'Thử thay đổi từ khóa hoặc bộ lọc để xem kết quả khác.',
  onReset,
  resetText = 'Xóa bộ lọc'
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 my-6">
      <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/20"
        >
          {resetText}
        </button>
      )}
    </div>
  );
};
