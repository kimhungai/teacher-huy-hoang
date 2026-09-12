import React, { useEffect, useState, useMemo } from 'react';
import { DB } from '../services/db';
import type { GalleryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Image, PlayCircle, Eye } from 'lucide-react';
import { Lightbox } from '../components/common/Lightbox';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { sanitizeMediaUrl } from '../utils/urlUtils';

import { SEO } from '../components/common/SEO';

export const GALLERY_CATEGORIES = [
  { key: 'Classroom', vi: 'Lớp Học', en: 'Classroom' },
  { key: 'English Activities', vi: 'Hoạt Động Tiếng Anh', en: 'English Activities' },
  { key: 'School Events', vi: 'Sự Kiện Trường Học', en: 'School Events' },
  { key: 'Student Projects', vi: 'Dự Án Học Viên', en: 'Student Projects' },
  { key: 'Workshops', vi: 'Hội Thảo & Tập Huấn', en: 'Workshops' },
  { key: 'Teaching Activities', vi: 'Hoạt Động Giảng Dạy', en: 'Teaching Activities' }
];

export const GalleryPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>(() => {
    try {
      const cached = localStorage.getItem('db_gallery');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('db_gallery');
      if (cached) return JSON.parse(cached).length === 0;
    } catch {}
    return true;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    DB.getGalleryItems().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Thư Viện Hình Ảnh & Video Hoạt Động Lớp Học Tiếng Anh'
    : 'Photo Gallery & Video Activities of English Classes';

  const seoDesc = language === 'vi'
    ? 'Bộ sưu tập hình ảnh và video thực tế các giờ học Tiếng Anh sinh động, hoạt động ngoại khóa, sự kiện trường học và các khoảnh khắc đáng nhớ của thầy và trò Trường TH Dương Minh Châu.'
    : 'Collection of photos and videos from vibrant English classes, extracurricular activities, school events, and memorable moments with Teacher Huy Hoang.';

  const gallerySchema = {
    '@type': 'ImageGallery',
    'name': seoTitle,
    'description': seoDesc,
    'image': items.filter(i => i.isPublished).slice(0, 5).map(i => i.mediaUrl)
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(i => i.isPublished)
      .filter((i) => {
        if (selectedCategory === 'all') return true;
        const catPair = GALLERY_CATEGORIES.find(
          c => c.key === selectedCategory || c.vi === selectedCategory || c.en === selectedCategory
        );
        if (!catPair) {
          return i.category === selectedCategory || i.categoryEn === selectedCategory;
        }
        return (
          i.category === catPair.vi ||
          i.category === catPair.en ||
          i.categoryEn === catPair.vi ||
          i.categoryEn === catPair.en
        );
      });
  }, [items, selectedCategory]);

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/gallery"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/gallery' }
        ]}
        keywords={language === 'vi'
          ? 'Thư viện ảnh tiếng anh, Video giờ học tiếng anh tiểu học, Dương Minh Châu Quận 10, Thầy Nguyễn Trọng Huy Hoàng'
          : 'English Class Gallery, Primary Classroom Videos, Duong Minh Chau School Photos'}
        schema={gallerySchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <Image className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Thư Viện Ảnh & Video' : 'Media Showcase'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi' ? 'Thư Viện Hình Ảnh & Video Lớp Học' : 'Media & Classroom Gallery'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'vi'
              ? 'Khoảnh khắc sinh động từ các giờ học tiếng Anh, các sự kiện và các hoạt động chuyên môn.'
              : 'Capturing joyful moments from classroom activities, events, and workshops.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {t('label.allCategories')}
          </button>
          {GALLERY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key || selectedCategory === cat.vi || selectedCategory === cat.en;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50'
                }`}
              >
                {language === 'vi' ? cat.vi : cat.en}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <EmptyState onReset={() => setSelectedCategory('all')} resetText={t('btn.clearFilters')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => {
              const coverImg = item.mediaType === 'image'
                ? ((item.galleryUrls && item.galleryUrls.length > 0) ? item.galleryUrls[0] : item.mediaUrl)
                : (item.thumbnailUrl || ((item.galleryUrls && item.galleryUrls.length > 0) ? item.galleryUrls[0] : item.mediaUrl));

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveLightboxIndex(idx)}
                  className="group cursor-pointer relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3]"
                >
                  <img
                    src={sanitizeMediaUrl(coverImg)}
                    alt={language === 'vi' ? item.titleVi : item.titleEn}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay Icon */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    {item.mediaType === 'youtube' || item.mediaType === 'video' ? (
                      <PlayCircle className="w-10 h-10 text-sky-400 animate-pulse" />
                    ) : (
                      <Eye className="w-8 h-8 text-white" />
                    )}
                  </div>

                  {/* Title Badge */}
                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-semibold truncate text-left flex items-center justify-between">
                    <span>{language === 'vi' ? item.titleVi : item.titleEn}</span>
                    {item.galleryUrls && item.galleryUrls.length > 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300 font-bold shrink-0 ml-1">
                        {item.galleryUrls.length} media
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox Modal for Selected Item Album */}
        <Lightbox
          item={activeItem}
          onClose={() => setActiveLightboxIndex(null)}
          language={language}
        />
      </div>
    </div>
  );
};
