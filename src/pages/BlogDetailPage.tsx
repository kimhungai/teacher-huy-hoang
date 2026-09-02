import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import type { BlogPost } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Images as ImagesIcon,
  Film,
  ZoomIn
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ImageLightbox } from '../components/common/ImageLightbox';
import { getBlogCategoryLabel } from '../utils/blogUtils';

import { SEO } from '../components/common/SEO';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      DB.getBlogPostBySlug(slug).then((res) => {
        if (res) {
          setPost(res);
          DB.getBlogPosts().then((all) => {
            setRelated(all.filter((x) => x.id !== res.id && x.status === 'published').slice(0, 2));
          });
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 max-w-4xl mx-auto px-4">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === 'vi' ? 'Bài viết không tồn tại' : 'Post not found'}
        </h2>
        <button
          onClick={() => navigate('/blog')}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          {t('btn.back')}
        </button>
      </div>
    );
  }

  const postTitle = language === 'vi' ? post.titleVi : post.titleEn;
  const postExcerpt = language === 'vi' ? post.excerptVi : post.excerptEn;
  const content = language === 'vi' ? post.contentVi : post.contentEn;

  // Process Gallery & Cover Images
  const rawGallery = post.galleryUrls && post.galleryUrls.length > 0 ? post.galleryUrls : [post.featuredImage];
  const galleryImages = rawGallery.map((u) => u.trim()).filter(Boolean);
  const topCoverImage = galleryImages.length > 0 ? galleryImages[0] : post.featuredImage;

  const blogSchema: Record<string, any> = {
    '@type': 'BlogPosting',
    'headline': postTitle,
    'description': postExcerpt,
    'image': topCoverImage,
    'datePublished': post.publishedAt || post.createdAt,
    'author': {
      '@type': 'Person',
      'name': 'Nguyễn Trọng Huy Hoàng',
      'jobTitle': 'Giáo viên Tiếng Anh'
    },
    'publisher': {
      '@type': 'Person',
      'name': 'Nguyễn Trọng Huy Hoàng'
    }
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <SEO
        title={postTitle}
        description={postExcerpt}
        url={`/blog/${post.slug}`}
        lang={language as 'vi' | 'en'}
        image={topCoverImage}
        type="article"
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: language === 'vi' ? 'Bài viết' : 'Blog', item: '/blog' },
          { name: postTitle, item: `/blog/${post.slug}` }
        ]}
        keywords={`${postTitle}, Sư phạm tiếng Anh, ${post.categoryName}, Thầy Nguyễn Trọng Huy Hoàng`}
        schema={blogSchema}
      />
      {/* Lightbox Modal */}
      <ImageLightbox
        images={galleryImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
        language={language}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('btn.back')}</span>
        </Link>

        {/* TOP COVER BANNER IMAGE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl">
          <div
            onClick={() => setLightboxIndex(0)}
            className="aspect-[21/9] w-full bg-slate-200 dark:bg-slate-800 relative group cursor-pointer overflow-hidden"
            title={language === 'vi' ? 'Bấm để xem ảnh lớn' : 'Click to enlarge'}
          >
            <img
              src={topCoverImage}
              alt={language === 'vi' ? post.titleVi : post.titleEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 text-white font-bold text-xs backdrop-blur-md">
                <ZoomIn className="w-4 h-4" />
                <span>{language === 'vi' ? 'Xem ảnh lớn' : 'Enlarge'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Post Container */}
        <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8">
          <div className="space-y-4">
            <Badge variant="emerald">{getBlogCategoryLabel(post.categoryName, post.categoryEn, language)}</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {language === 'vi' ? post.titleVi : post.titleEn}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-6">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                <User className="w-4 h-4 text-sky-500" />
                {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                {post.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                {language === 'vi' ? post.readingTimeVi : post.readingTimeEn}
              </span>
            </div>
          </div>

          {/* Rich Content Render */}
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
            {content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <Tag className="w-3 h-3 text-sky-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* MỤC 4: ALBUM HÌNH ẢNH BÀI VIẾT (Trình bày ở GẦN CUỐI TRANG) */}
          {galleryImages.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImagesIcon className="w-5 h-5 text-sky-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? 'Album Hình Ảnh Bài Viết' : 'Article Photo Gallery'}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group relative"
                    title={language === 'vi' ? 'Bấm để xem ảnh lớn' : 'Click to enlarge'}
                  >
                    <img
                      src={url}
                      alt={`Blog photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MỤC 5: VIDEO BÀI GIẢNG / HOẠT ĐỘNG (CUỐI TRANG, ẩn nếu không có video) */}
          {post.videoUrl && post.videoUrl.trim() !== '' && (
            <div className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? 'Video Minh Họa Bài Giảng' : 'Article Video Demo'}
                </h3>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 aspect-video w-full">
                {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={post.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={post.titleEn}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={post.videoUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          )}
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'vi' ? 'Bài Viết Liên Quan' : 'Related Articles'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/blog/${item.slug}`}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-4 items-center hover:shadow-lg transition-all"
                >
                  <img
                    src={item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls[0] : item.featuredImage}
                    alt="Thumbnail"
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                      {language === 'vi' ? item.titleVi : item.titleEn}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.publishedAt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
