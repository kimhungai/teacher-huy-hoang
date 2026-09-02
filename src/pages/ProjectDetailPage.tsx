import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import type { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Calendar, CheckCircle2, Video, Sparkles, FolderKanban, ZoomIn } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ImageLightbox } from '../components/common/ImageLightbox';
import { SEO } from '../components/common/SEO';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      DB.getProjectBySlug(slug).then((proj) => {
        if (proj) {
          setProject(proj);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 max-w-5xl mx-auto px-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dự án không tồn tại</h2>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          {t('btn.back')}
        </button>
      </div>
    );
  }

  const projTitle = language === 'vi' ? project.titleVi : project.titleEn;
  const projDesc = language === 'vi' ? project.descriptionVi : project.descriptionEn;

  // Process Gallery & Cover Images
  const rawGallery = project.galleryUrls && project.galleryUrls.length > 0 ? project.galleryUrls : [project.thumbnailUrl];
  const galleryImages = rawGallery.map((u) => u.trim()).filter(Boolean);
  const topCoverImage = galleryImages.length > 0 ? galleryImages[0] : project.thumbnailUrl;

  const objectives = language === 'vi' ? project.objectivesVi : project.objectivesEn;
  const activities = language === 'vi' ? project.activitiesVi : project.activitiesEn;
  const methods = language === 'vi' ? project.methodsVi : project.methodsEn;
  const outcomes = language === 'vi' ? project.outcomesVi : project.outcomesEn;

  // Combine cover image and gallery images for Lightbox navigation
  const galleryList = (project.galleryUrls && project.galleryUrls.length > 0) ? project.galleryUrls : [];
  const allImages = [project.thumbnailUrl, ...galleryList].filter(Boolean);

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={projTitle}
        description={projDesc}
        url={`/projects/${project.slug}`}
        lang={language as 'vi' | 'en'}
        image={topCoverImage}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: language === 'vi' ? 'Dự án' : 'Projects', item: '/projects' },
          { name: projTitle, item: `/projects/${project.slug}` }
        ]}
        keywords={`${projTitle}, ${project.categoryName}, Thầy Nguyễn Trọng Huy Hoàng, Dự án tiếng Anh`}
      />
      {/* Lightbox Modal */}
      <ImageLightbox
        images={allImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
        language={language}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        {/* Back Link */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('btn.back')}</span>
        </Link>

        {/* Cover Image & Basic Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <div
            onClick={() => setLightboxIndex(0)}
            className="aspect-[21/9] w-full bg-slate-200 dark:bg-slate-800 relative group cursor-pointer overflow-hidden"
            title={language === 'vi' ? 'Bấm để xem ảnh lớn' : 'Click to enlarge'}
          >
            <img
              src={project.thumbnailUrl}
              alt={language === 'vi' ? project.titleVi : project.titleEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 text-white font-bold text-xs backdrop-blur-md">
                <ZoomIn className="w-4 h-4" />
                <span>{language === 'vi' ? 'Xem ảnh lớn' : 'Enlarge'}</span>
              </span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="sky">{language === 'vi' ? project.categoryName : (project.categoryEn || project.categoryName)}</Badge>
              <Badge variant="amber">{language === 'vi' ? project.grade : (project.gradeEn || project.grade)}</Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                {project.year}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {language === 'vi' ? project.titleVi : project.titleEn}
            </h1>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'vi' ? project.descriptionVi : project.descriptionEn}
            </p>
          </div>
        </div>

        {/* Objectives & Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Objectives */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-base">
              <Sparkles className="w-5 h-5" />
              <h3>{language === 'vi' ? 'Mục Tiêu Bài Học' : 'Project Objectives'}</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {objectives.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
              <FolderKanban className="w-5 h-5" />
              <h3>{language === 'vi' ? 'Chuỗi Hoạt Động' : 'Classroom Activities'}</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {activities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Methods & Outcomes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              {language === 'vi' ? 'Phương Pháp Sư Phạm Tích Hợp' : 'Teaching Methods'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {methods.map((m, i) => (
                <Badge key={i} variant="indigo">
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              {language === 'vi' ? 'Kết Quả Đạt Được' : 'Learning Outcomes'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {outcomes.map((out, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gallery Images */}
        {galleryList.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'vi' ? 'Hình Ảnh Hoạt Động' : 'Activity Gallery'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryList.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(1 + idx)}
                  className="aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer group relative"
                  title={language === 'vi' ? 'Bấm để xem ảnh lớn' : 'Click to enlarge'}
                >
                  <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video / Media Attachment if any (at the bottom) */}
        {project.videoUrl && project.videoUrl.trim() !== '' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
              <Video className="w-5 h-5" />
              <h3>{language === 'vi' ? 'Video Bài Giảng / Hoạt Động' : 'Project Video'}</h3>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={project.videoUrl.replace('watch?v=', 'embed/')}
                title="Project Video"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
