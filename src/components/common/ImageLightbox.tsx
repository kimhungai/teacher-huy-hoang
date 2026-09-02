import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  language?: 'en' | 'vi';
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onSelectIndex,
  language = 'vi'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onSelectIndex(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onSelectIndex(currentIndex + 1);
      }
    };

    if (currentIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, images.length, onClose, onSelectIndex]);

  if (currentIndex === null || !images || images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }

  const currentImage = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar with Close Button & Counter */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-10">
        <span className="text-xs font-bold text-white/70 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
          aria-label="Close Lightbox"
        >
          <X className="w-5 h-5" />
          <span>{language === 'vi' ? 'Đóng' : 'Close'}</span>
        </button>
      </div>

      {/* Prev Navigation Arrow */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectIndex(currentIndex - 1);
          }}
          className="absolute left-4 sm:left-6 p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all z-10 cursor-pointer shadow-lg"
          aria-label="Previous Image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Navigation Arrow */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectIndex(currentIndex + 1);
          }}
          className="absolute right-4 sm:right-6 p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all z-10 cursor-pointer shadow-lg"
          aria-label="Next Image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        className="max-w-6xl w-full max-h-[85vh] flex items-center justify-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`Full view ${currentIndex + 1}`}
          className="max-h-[82vh] max-w-[92vw] rounded-2xl shadow-2xl object-contain border border-white/10"
        />
      </div>
    </div>
  );
};
