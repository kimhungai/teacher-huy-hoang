import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '../../types';
import { sanitizeMediaUrl } from '../../utils/urlUtils';

interface LightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
  language: 'en' | 'vi';
}

function isYoutubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYoutubeEmbedUrl(rawUrl: string): string {
  const url = sanitizeMediaUrl(rawUrl);
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return url;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, onClose, language }) => {
  const [subIndex, setSubIndex] = useState<number>(0);

  // Reset subIndex when opened or item changed
  useEffect(() => {
    setSubIndex(0);
  }, [item]);

  const rawUrls = item
    ? (item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : [item.mediaUrl])
    : [];

  const urls = rawUrls
    .map(u => sanitizeMediaUrl(u))
    .filter(Boolean);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setSubIndex(prev => (prev > 0 ? prev - 1 : urls.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setSubIndex(prev => (prev < urls.length - 1 ? prev + 1 : 0));
      }
    };
    if (item && urls.length > 0) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [item, urls, onClose]);

  if (!item || urls.length === 0) return null;

  const currentUrl = urls[subIndex] || urls[0];
  const isVideoMedia = item.mediaType === 'youtube' || isYoutubeUrl(currentUrl);

  const handlePrev = () => {
    setSubIndex(prev => (prev > 0 ? prev - 1 : urls.length - 1));
  };

  const handleNext = () => {
    setSubIndex(prev => (prev < urls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
        aria-label="Close Lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter Badge */}
      {urls.length > 1 && (
        <div className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-white text-xs font-extrabold z-20">
          {subIndex + 1} / {urls.length}
        </div>
      )}

      {/* Prev Navigation */}
      {urls.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-6 p-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
          aria-label="Previous Media"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Next Navigation */}
      {urls.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-6 p-3.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
          aria-label="Next Media"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Media Preview Box */}
      <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-4">
        {isVideoMedia ? (
          <div className="w-full aspect-video max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-800">
            <iframe
              src={getYoutubeEmbedUrl(currentUrl)}
              title={language === 'vi' ? item.titleVi : item.titleEn}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={currentUrl}
            alt={language === 'vi' ? item.titleVi : item.titleEn}
            className="max-h-[75vh] max-w-full rounded-3xl shadow-2xl object-contain border border-slate-800/80"
          />
        )}

        {/* Caption */}
        <div className="mt-4 text-center text-white max-w-2xl px-4 space-y-1">
          <h4 className="text-base sm:text-lg font-extrabold text-white">
            {language === 'vi' ? item.titleVi : item.titleEn}
          </h4>
          {(item.descriptionVi || item.descriptionEn) && (
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'vi' ? item.descriptionVi : item.descriptionEn}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
