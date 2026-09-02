import React, { useEffect, useState } from 'react';
import { DB } from '../services/db';
import type { Achievement } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Award, Calendar, ExternalLink, CheckCircle2, ZoomIn } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ImageLightbox } from '../components/common/ImageLightbox';

import { SEO } from '../components/common/SEO';

export const AchievementsPage: React.FC = () => {
  const { language } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    DB.getAchievements().then((res) => {
      setAchievements(res);
      setLoading(false);
    });
  }, []);

  const seoTitle = language === 'vi'
    ? 'Giải Thưởng, Bằng Khen & Thành Tựu Giáo Dục — Thầy Nguyễn Trọng Huy Hoàng'
    : 'Honors, Certificates & Teaching Achievements — Teacher Nguyen Trong Huy Hoang';

  const seoDesc = language === 'vi'
    ? 'Tổng hợp giải thưởng, bằng khen giáo viên giỏi, chứng chỉ chuyên môn sư phạm và thành tựu xuất sắc của Thầy Nguyễn Trọng Huy Hoàng trong hơn 25 năm cống hiến cho giáo dục Tiếng Anh tiểu học.'
    : 'Collection of teaching awards, certificates, and achievements of Teacher Nguyen Trong Huy Hoang over 25 years of dedication to primary English education.';

  const handleOpenAlbum = (urls: string[]) => {
    if (urls.length > 0) {
      setLightboxImages(urls);
      setLightboxIndex(0);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Awards':
      case 'Khen thưởng':
        return language === 'vi' ? 'Khen thưởng' : 'Awards';
      case 'Certificate':
      case 'Chứng chỉ':
        return language === 'vi' ? 'Chứng chỉ' : 'Certificate';
      case 'Workshop':
      case 'Hội thảo':
        return language === 'vi' ? 'Hội thảo & Tập huấn' : 'Workshops';
      case 'EdTech':
      case 'Presentations':
      case 'Báo cáo':
        return language === 'vi' ? 'Báo cáo' : 'Presentations';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="py-20 max-w-5xl mx-auto px-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/achievements"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/achievements' }
        ]}
        keywords={language === 'vi'
          ? 'Giải thưởng Thầy Nguyễn Trọng Huy Hoàng, Bằng khen giáo viên giỏi, Chứng chỉ tiếng anh tiểu học, Dương Minh Châu'
          : 'Teacher Huy Hoang Awards, Teaching Certificates, Primary Educator Honors'}
      />
      {/* Lightbox for Achievement Photos Album */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
        language={language}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Danh Hiệu & Chứng Chỉ' : 'Honors & Certifications'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'vi' ? 'Thành Tựu & Chứng Chỉ Chuyên Môn' : 'Achievements & Certifications'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'vi'
              ? 'Ghi nhận giải thưởng giáo viên giỏi, chứng chỉ TESOL quốc tế và các báo cáo hội thảo EdTech.'
              : 'Recognitions, teaching awards, international TESOL certificates, and educational workshops.'}
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l-2 border-sky-500/30 dark:border-sky-500/20 ml-4 md:ml-32 space-y-10 text-left">
          {achievements.map((item) => {
            // Build gallery URLs list
            const rawGallery = item.galleryUrls && item.galleryUrls.length > 0
              ? item.galleryUrls
              : (item.certificateUrl ? [item.certificateUrl] : []);
            
            const imagesList = rawGallery.map(u => u.trim()).filter(Boolean);
            const hasImages = imagesList.length > 0;

            const categoryText = getCategoryLabel(item.category);
            const orgText = language === 'vi' ? item.organizationVi : (item.organizationEn || item.organizationVi);
            const descText = language === 'vi' ? item.descriptionVi : (item.descriptionEn || item.descriptionVi);

            return (
              <div key={item.id} className="relative pl-6 md:pl-8 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-sky-600 border-4 border-white dark:border-slate-950 shadow-md group-hover:scale-125 transition-transform" />

                {/* Date Badge on Desktop Left */}
                <div className="md:absolute md:-left-36 md:top-1 text-xs font-extrabold text-sky-600 dark:text-sky-400 mb-2 md:mb-0 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>

                {/* Achievement Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl transition-all space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="amber">{categoryText}</Badge>

                    {/* MỤC 1: "Xem hình ảnh" (Enable nếu có link, Disable nếu không có link) */}
                    {hasImages ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAlbum(imagesList)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors cursor-pointer"
                        title={language === 'vi' ? `Bấm để xem ${imagesList.length} hình ảnh lớn` : `Click to view ${imagesList.length} image(s)`}
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>
                          {language === 'vi' ? 'Xem hình ảnh' : 'View Images'}
                          {imagesList.length > 1 ? ` (${imagesList.length})` : ''}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                        title={language === 'vi' ? 'Chưa có file/link hình ảnh thành tựu' : 'No images available'}
                      >
                        <span>{language === 'vi' ? 'Xem hình ảnh' : 'View Images'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                    {language === 'vi' ? item.titleVi : item.titleEn}
                  </h3>

                  {/* Đơn vị cấp */}
                  <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{orgText}</span>
                  </div>

                  {/* Nội dung thành tựu */}
                  {descText && descText.trim() !== '' && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                      {descText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
