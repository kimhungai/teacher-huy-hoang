import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import type { TeachingResource, ResourceOrder } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Gift,
  CreditCard,
  Send,
  Sparkles,
  CheckCircle2,
  Package,
  Film,
  Images as ImagesIcon,
  Info,
  ExternalLink,
  ZoomIn,
  BookOpen,
  X
} from 'lucide-react';
import { Toast } from '../components/common/Toast';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ImageLightbox } from '../components/common/ImageLightbox';
import { BankPaymentCardModal } from '../components/common/BankPaymentCardModal';
import { sendResourceOrderEmails } from '../services/emailNotifier';
import { SEO } from '../components/common/SEO';

export const ResourceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [resource, setResource] = useState<TeachingResource | null>(() => {
    try {
      const cached = localStorage.getItem('db_resources_v3') || localStorage.getItem('db_resources');
      if (cached && slug) {
        const list: TeachingResource[] = JSON.parse(cached);
        return list.find(r => r.slug === slug || r.id === slug) || null;
      }
    } catch {}
    return null;
  });

  const [relatedResources, setRelatedResources] = useState<TeachingResource[]>(() => {
    try {
      const cached = localStorage.getItem('db_resources_v3') || localStorage.getItem('db_resources');
      if (cached && slug) {
        const list: TeachingResource[] = JSON.parse(cached);
        const target = list.find(r => r.slug === slug || r.id === slug);
        if (target) {
          const otherPublished = list.filter(r => r.isPublished && r.id !== target.id);
          const sameCategory = otherPublished.filter(r => r.categoryName === target.categoryName || r.resourceType === target.resourceType);
          return (sameCategory.length > 0 ? sameCategory : otherPublished).slice(0, 3);
        }
      }
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('db_resources_v3') || localStorage.getItem('db_resources');
      if (cached && slug) {
        const list: TeachingResource[] = JSON.parse(cached);
        return !list.some(r => r.slug === slug || r.id === slug);
      }
    } catch {}
    return true;
  });

  // Success Resource Order Modal State
  const [successOrderData, setSuccessOrderData] = useState<ResourceOrder | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Order Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (slug) {
      Promise.all([
        DB.getResourceBySlug(slug),
        DB.getResources()
      ]).then(([target, all]) => {
        setResource(target);
        if (target) {
          document.title = `${language === 'vi' ? target.titleVi : target.titleEn} — Thầy Nguyễn Trọng Huy Hoàng`;

          // Filter related resources
          const otherPublished = all.filter(r => r.isPublished && r.id !== target.id);
          // Prefer same category or same resourceType
          const sameCategory = otherPublished.filter(r => r.categoryName === target.categoryName || r.resourceType === target.resourceType);
          const finalRelated = (sameCategory.length > 0 ? sameCategory : otherPublished).slice(0, 3);
          setRelatedResources(finalRelated);
        }
        setLoading(false);
      });
    }
  }, [slug, language]);

  // Handle Download Action (Increments Download Count in DB)
  const handleDownload = async () => {
    if (resource) {
      const newCount = await DB.incrementResourceDownload(resource.id);
      setResource({ ...resource, downloadCount: newCount });
      if (resource.fileUrl) {
        window.open(resource.fileUrl, '_blank');
      }
    }
  };

  const handleSubmitOrder = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!resource) return;

    if (!fullName.trim() || !phone.trim()) {
      setToastMessage(language === 'vi' ? 'Vui lòng điền họ tên và số điện thoại.' : 'Please enter full name and phone number.');
      setToastType('error');
      return;
    }

    setSubmitting(true);

    try {
      const currentPrice = language === 'vi' ? resource.priceVi : resource.priceEn;
      const currentDiscountPrice = language === 'vi' ? resource.discountPriceVi : resource.discountPriceEn;
      const hasPromoRightNow = resource.priceType === 'paid' && Boolean(currentDiscountPrice && currentDiscountPrice.trim());

      const newOrder = await DB.createResourceOrder({
        resourceId: resource.id,
        resourceTitle: language === 'vi' ? resource.titleVi : resource.titleEn,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        note: note.trim(),
        resourcePrice: resource.priceType === 'free' ? (language === 'vi' ? 'Miễn phí' : 'Free') : currentPrice,
        discountPrice: hasPromoRightNow ? currentDiscountPrice : ''
      });

      // 1. Bật Modal Chúc Mừng cố định vĩnh viễn trên màn hình
      setSuccessOrderData(newOrder);
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNote('');

      // 2. Tự động gửi Email chạy ngầm độc lập (Khách chọn tiếng Anh thì gửi mail tiếng Anh)
      sendResourceOrderEmails(newOrder, language as 'vi' | 'en').catch(err => console.error('Background Email Dispatch Error:', err));
    } catch {
      setToastMessage(language === 'vi' ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'Order failed, please try again.');
      setToastType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <LoadingSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {language === 'vi' ? 'Không tìm thấy học liệu này' : 'Resource not found'}
        </h2>
        <button
          onClick={() => navigate('/resources')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('btn.back')}
        </button>
      </div>
    );
  }

  // Gallery Images List
  const rawGallery = resource.galleryUrls && resource.galleryUrls.length > 0 ? resource.galleryUrls : [resource.previewUrl || ''];
  const galleryImages = rawGallery.map(u => u.trim()).filter(Boolean);

  // Main Cover Image
  const topCoverImage = galleryImages.length > 0 ? galleryImages[0] : (resource.previewUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800');

  // Specifications / Features list
  const specsList = language === 'vi' ? resource.specificationsVi : (resource.specificationsEn && resource.specificationsEn.length > 0 ? resource.specificationsEn : resource.specificationsVi);

  const resTitle = language === 'vi' ? resource.titleVi : resource.titleEn;
  const resDesc = language === 'vi' ? resource.descriptionVi : resource.descriptionEn;
  const resCategory = language === 'vi' ? resource.categoryName : (resource.categoryEn || resource.categoryName);

  const productSchema: Record<string, any> = {
    '@type': 'Product',
    'name': resTitle,
    'description': resDesc,
    'image': topCoverImage,
    'offers': {
      '@type': 'Offer',
      'price': resource.priceType === 'free' ? '0' : (resource.discountPriceVi || resource.priceVi || '0'),
      'priceCurrency': 'VND',
      'availability': 'https://schema.org/InStock'
    }
  };

  const videoSchema = (resource.videoUrl && resource.videoUrl.trim() !== '') ? {
    '@type': 'VideoObject',
    'name': `Video Giới Thiệu Học Liệu: ${resTitle}`,
    'description': resDesc,
    'thumbnailUrl': topCoverImage,
    'contentUrl': resource.videoUrl,
    'embedUrl': resource.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
  } : undefined;

  const dynamicSchemas = videoSchema ? [productSchema, videoSchema] : [productSchema];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <SEO
        title={resTitle}
        description={resDesc}
        url={`/resources/${resource.slug}`}
        lang={language as 'vi' | 'en'}
        image={topCoverImage}
        type="product"
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: language === 'vi' ? 'Học liệu' : 'Resources', item: '/resources' },
          { name: resTitle, item: `/resources/${resource.slug}` }
        ]}
        keywords={`${resTitle}, ${resCategory}, ${resource.grade}, Thầy Nguyễn Trọng Huy Hoàng, Học liệu tiếng Anh`}
        schema={dynamicSchemas}
      />
      {/* Lightbox Modal */}
      <ImageLightbox
        images={galleryImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
        language={language}
      />

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* Navigation Breadcrumb & Price Tag */}
        <div className="flex items-center justify-between">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('nav.resources')}
          </Link>

          <div>
            {(() => {
              const discountPrice = language === 'vi' ? resource.discountPriceVi : resource.discountPriceEn;
              const hasDiscount = resource.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

              if (resource.priceType === 'free') {
                return (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                    <Gift className="w-4 h-4" />
                    {t('resource.free')}
                  </span>
                );
              }

              if (hasDiscount) {
                return (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-black shadow-xl ring-2 ring-rose-400/40 animate-pulse">
                      🔥 KM: {discountPrice}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {language === 'vi' ? resource.priceVi : resource.priceEn}
                    </span>
                  </div>
                );
              }

              return (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                  <CreditCard className="w-4 h-4" />
                  {language === 'vi' ? resource.priceVi : resource.priceEn}
                </span>
              );
            })()}
          </div>
        </div>

        {/* TOP COVER IMAGE BANNER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl">
          <div
            onClick={() => setLightboxIndex(0)}
            className="aspect-[21/9] w-full bg-slate-200 dark:bg-slate-800 relative group cursor-pointer overflow-hidden"
            title={language === 'vi' ? 'Bấm để xem ảnh lớn' : 'Click to enlarge'}
          >
            <img
              src={topCoverImage}
              alt={language === 'vi' ? resource.titleVi : resource.titleEn}
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

        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-block px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold">
            {language === 'vi' ? resource.categoryName : (resource.categoryEn || resource.categoryName)}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === 'vi' ? resource.titleVi : resource.titleEn}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-4xl">
            {language === 'vi' ? resource.descriptionVi : resource.descriptionEn}
          </p>
        </div>

        {/* Info Grid & Order Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Resource Details & Features */}
          <div className="lg:col-span-7 space-y-8">
            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                <div className="text-slate-400 text-[11px] font-semibold uppercase">{t('label.grade')}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? resource.grade : (resource.gradeEn || resource.grade)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                <div className="text-slate-400 text-[11px] font-semibold uppercase">{t('resource.format')}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? resource.fileType : (resource.fileTypeEn || resource.fileType)}
                </div>
              </div>

              {(() => {
                const discountPrice = language === 'vi' ? resource.discountPriceVi : resource.discountPriceEn;
                const hasDiscount = resource.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

                return (
                  <div className={`p-4 rounded-2xl border space-y-1 shadow-sm transition-all relative overflow-hidden ${
                    hasDiscount
                      ? 'bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-orange-500/10 border-rose-500/30 ring-2 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">
                        {language === 'vi' ? 'Mức Giá / Học Liệu' : 'Price / Fee'}
                      </div>
                      {hasDiscount && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                          🔥 SALE
                        </span>
                      )}
                    </div>

                    {resource.priceType === 'free' ? (
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {language === 'vi' ? 'Miễn phí' : 'Free'}
                      </div>
                    ) : hasDiscount ? (
                      <div>
                        <div className="text-[11px] text-slate-400 line-through font-medium">
                          {language === 'vi' ? resource.priceVi : resource.priceEn}
                        </div>
                        <div className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <span>🔥</span>
                          <span>{discountPrice}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        {language === 'vi' ? resource.priceVi : resource.priceEn}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Thông Tin Chi Tiết & Tính Năng */}
            {specsList && specsList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  <span>{t('resource.specs')}</span>
                </h3>
                <ul className="space-y-3">
                  {specsList.map((spec, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Link Tải File hoặc Thông báo Đăng Ký Nhận */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-500" />
                <span>{language === 'vi' ? 'Link Tải File & Sử Dụng' : 'File Download & Access Link'}</span>
              </h3>

              {resource.fileUrl && resource.fileUrl.trim() !== '' ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span>{language === 'vi' ? 'Link Tải File có sẵn:' : 'Download Link available:'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 break-all">
                      {resource.fileUrl}
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Tải Học Liệu Ngay' : 'Download Now'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-extrabold text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    {language === 'vi'
                      ? 'Vui lòng Đăng Ký Nhận / Đặt Mua Học Liệu qua form bên phải để nhận file/giáo cụ tận tay.'
                      : 'Please request or order via the form on the right to receive this resource.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order / Request Form */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl sticky top-24 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-bold">
                  <Package className="w-3.5 h-3.5" />
                  {t('resource.orderTitle')}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? 'Đăng Ký Nhận / Đặt Mua Học Liệu' : 'Request or Order Resource'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Điền thông tin bên dưới, thầy Hoàng sẽ gửi link tải/giao học liệu tận tay bạn.'
                    : 'Fill in your details below to receive or order this learning material.'}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t('course.studentName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'vi' ? 'Ví dụ: Nguyễn Văn An' : 'Full Name'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t('course.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0908xxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t('course.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {language === 'vi' ? 'Địa chỉ giao hàng (nếu mua giáo cụ/sách)' : 'Delivery Address (if applicable)'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'vi' ? 'Số nhà, Tên đường, Quận/Huyện...' : 'Address'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t('course.note')}
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={language === 'vi' ? 'Ghi chú thêm về học liệu mong muốn...' : 'Notes'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? t('btn.submitting') : t('resource.requestOrder')}</span>
                </button>

                {/* Bank Payment Account Card */}
                <BankPaymentCardModal className="mt-3" />
              </div>
            </div>
          </div>
        </div>

        {/* ALBUM HÌNH ẢNH HỌC LIỆU */}
        {galleryImages.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ImagesIcon className="w-5 h-5 text-sky-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Album Hình Ảnh Học Liệu' : 'Resource Photo Gallery'}
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
                    alt={`Resource photo ${idx + 1}`}
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

        {/* VIDEO GIỚI THIỆU HỌC LIỆU (CUỐI TRANG) */}
        {resource.videoUrl && resource.videoUrl.trim() !== '' && (
          <div className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Video Giới Thiệu Học Liệu' : 'Resource Video Demo'}
              </h3>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 aspect-video w-full">
              {resource.videoUrl.includes('youtube.com') || resource.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={resource.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={resource.titleEn}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={resource.videoUrl} controls className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        )}

        {/* CÁC HỌC LIỆU LIÊN QUAN (RELATED TEACHING MATERIALS SECTION - MŨI TÊN 1) */}
        {relatedResources.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-sky-500 shrink-0" />
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('resource.relatedTitle')}
                </h3>
              </div>
              <Link
                to="/resources"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors group shrink-0"
              >
                <span>{t('home.viewAllResources')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedResources.map((rel) => {
                const discountPrice = language === 'vi' ? rel.discountPriceVi : rel.discountPriceEn;
                const hasDiscount = rel.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

                return (
                  <Link
                    key={rel.id}
                    to={`/resources/${rel.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 text-left relative"
                  >
                    <div>
                      {/* Image & Price */}
                      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={rel.previewUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'}
                          alt={language === 'vi' ? rel.titleVi : rel.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
                          {rel.priceType === 'free' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-md">
                              <Gift className="w-3 h-3" />
                              {t('resource.free')}
                            </span>
                          ) : hasDiscount ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[11px] font-black shadow-lg">
                                🔥 {discountPrice}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 text-[9px] line-through font-semibold border border-white/10">
                                {language === 'vi' ? rel.priceVi : rel.priceEn}
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-md">
                              <CreditCard className="w-3 h-3" />
                              {language === 'vi' ? rel.priceVi : rel.priceEn}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                          {language === 'vi' ? rel.categoryName : (rel.categoryEn || rel.categoryName)} • {rel.grade}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                          {language === 'vi' ? rel.titleVi : rel.titleEn}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {language === 'vi' ? rel.descriptionVi : rel.descriptionEn}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 pt-0">
                      <span className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-sky-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white text-xs font-bold transition-all">
                        <span>{t('btn.viewDetails')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* POPUP THÔNG BÁO CHÚC MỪNG ĐĂNG KÝ HỌC LIỆU THÀNH CÔNG (HIỂN THỊ CỐ ĐỊNH CHO ĐẾN KHI KHÁCH TỰ ĐÓNG) */}
      {successOrderData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-emerald-500/40 shadow-2xl space-y-6 text-left relative overflow-hidden">
            {/* Close button top right */}
            <button
              onClick={() => setSuccessOrderData(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Background Accent Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header Icon & Title */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                🎉 {language === 'vi' ? 'Chúc Mừng Bạn Đã Đăng Ký / Đặt Mua Học Liệu Thành Công!' : 'Resource Order Successful!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'vi'
                  ? 'Cảm ơn bạn đã tin tưởng nhận / đặt mua học liệu từ Thầy Nguyễn Trọng Huy Hoàng. Thông tin đơn hàng của bạn đã được ghi nhận và email xác nhận đã được gửi tự động.'
                  : 'Thank you for ordering learning resources. Your order details have been submitted and confirmation emails sent.'}
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>{language === 'vi' ? '📋 THÔNG TIN ĐƠN HÀNG HỌC LIỆU:' : '📋 RESOURCE ORDER DETAILS:'}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{successOrderData.createdAt}</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Tên học liệu:' : 'Resource Title:'}</strong> {successOrderData.resourceTitle}</div>
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Họ tên:' : 'Full Name:'}</strong> {successOrderData.fullName}</div>
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Số điện thoại:' : 'Phone:'}</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{successOrderData.phone}</span></div>
                {successOrderData.email && <div><strong className="text-slate-900 dark:text-white">Email:</strong> {successOrderData.email}</div>}
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Địa chỉ nhận hàng:' : 'Delivery Address:'}</strong> {successOrderData.address || (language === 'vi' ? 'Gửi qua Email / Tải trực tiếp' : 'Direct Digital Download / Email Link')}</div>
                <div className="flex items-center gap-1.5 pt-1">
                  <strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Tổng tiền thanh toán:' : 'Total Amount:'}</strong>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/30">
                    💰 {successOrderData.discountPrice || successOrderData.resourcePrice || (language === 'vi' ? 'Miễn phí' : 'Free')}
                  </span>
                </div>
                {successOrderData.note && (
                  <div className="text-slate-500 italic mt-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    " {successOrderData.note} "
                  </div>
                )}
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-700 dark:text-sky-300 flex items-start gap-2.5 leading-relaxed font-medium">
              <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                {language === 'vi'
                  ? `Giáo viên sẽ trực tiếp liên hệ qua SĐT ${successOrderData.phone} để hướng dẫn nhận link file số hoặc tiến hành giao sản phẩm tận nơi cho bạn.`
                  : `Teacher Nguyen Trong Huy Hoang will contact you directly via phone number ${successOrderData.phone} to guide digital download or arrange delivery to your address.`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSuccessOrderData(null)}
                className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/30 transition-all cursor-pointer text-center"
              >
                {language === 'vi' ? 'Đóng & Khám Phá Thêm' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
