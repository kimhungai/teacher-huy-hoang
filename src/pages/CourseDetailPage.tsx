import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DB } from '../services/db';
import type { Course, CourseRegistration } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gift,
  CreditCard,
  Send,
  Sparkles,
  BookOpen,
  UserCheck,
  Film,
  Images as ImagesIcon,
  ZoomIn,
  GraduationCap,
  X
} from 'lucide-react';
import { Toast } from '../components/common/Toast';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ImageLightbox } from '../components/common/ImageLightbox';
import { BankPaymentCardModal } from '../components/common/BankPaymentCardModal';
import { sendRegistrationEmails } from '../services/emailNotifier';
import { SEO } from '../components/common/SEO';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(() => {
    try {
      const cached = localStorage.getItem('db_courses');
      if (cached && slug) {
        const list: Course[] = JSON.parse(cached);
        return list.find(c => c.slug === slug || c.id === slug) || null;
      }
    } catch {}
    return null;
  });

  const [relatedCourses, setRelatedCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('db_courses');
      if (cached && slug) {
        const list: Course[] = JSON.parse(cached);
        const target = list.find(c => c.slug === slug || c.id === slug);
        if (target) {
          const otherPublished = list.filter(c => c.isPublished && c.id !== target.id);
          const sameCategory = otherPublished.filter(c => c.categoryName === target.categoryName);
          return (sameCategory.length > 0 ? sameCategory : otherPublished).slice(0, 3);
        }
      }
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('db_courses');
      if (cached && slug) {
        const list: Course[] = JSON.parse(cached);
        return !list.some(c => c.slug === slug || c.id === slug);
      }
    } catch {}
    return true;
  });

  // Success Registration Modal State
  const [successRegData, setSuccessRegData] = useState<CourseRegistration | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gradeLevel, setGradeLevel] = useState(() => course ? course.gradeLevel : '');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (slug) {
      Promise.all([
        DB.getCourseBySlug(slug),
        DB.getCourses()
      ]).then(([target, all]) => {
        setCourse(target);
        if (target) {
          setGradeLevel(target.gradeLevel);
          document.title = `${language === 'vi' ? target.titleVi : target.titleEn} — Thầy Nguyễn Trọng Huy Hoàng`;

          // Filter related courses
          const otherPublished = all.filter(c => c.isPublished && c.id !== target.id);
          // Prefer same category first
          const sameCategory = otherPublished.filter(c => c.categoryName === target.categoryName);
          const finalRelated = (sameCategory.length > 0 ? sameCategory : otherPublished).slice(0, 3);
          setRelatedCourses(finalRelated);
        }
        setLoading(false);
      });
    }
  }, [slug, language]);

  const handleSubmitRegistration = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!course) return;

    if (!fullName.trim() || !phone.trim()) {
      setToastMessage(language === 'vi' ? 'Vui lòng điền họ tên và số điện thoại.' : 'Please enter full name and phone number.');
      setToastType('error');
      return;
    }

    setSubmitting(true);

    try {
      const currentPrice = language === 'vi' ? course.priceVi : course.priceEn;
      const currentDiscountPrice = language === 'vi' ? course.discountPriceVi : course.discountPriceEn;

      const newReg = await DB.createCourseRegistration({
        courseId: course.id,
        courseTitle: language === 'vi' ? course.titleVi : course.titleEn,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gradeLevel: gradeLevel.trim() || course.gradeLevel,
        note: note.trim(),
        coursePrice: course.priceType === 'free' ? (language === 'vi' ? 'Miễn phí' : 'Free') : currentPrice,
        discountPrice: (course.priceType === 'paid' && currentDiscountPrice && currentDiscountPrice.trim()) ? currentDiscountPrice : undefined
      });

      // 1. Bật Modal Chúc Mừng cố định vĩnh viễn trên màn hình
      setSuccessRegData(newReg);
      setFullName('');
      setPhone('');
      setEmail('');
      setNote('');

      // 2. Tự động gửi Email thông báo chạy ngầm độc lập (Khách chọn tiếng Anh thì gửi mail tiếng Anh)
      sendRegistrationEmails(newReg, language as 'vi' | 'en').catch(err => console.error('Background Email Dispatch Error:', err));
    } catch {
      setToastMessage(language === 'vi' ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'Registration failed, please try again.');
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

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {language === 'vi' ? 'Không tìm thấy khóa học này' : 'Course not found'}
        </h2>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('btn.back')}
        </button>
      </div>
    );
  }

  // Handle Objectives & Curriculum lists
  const objectivesList = language === 'vi' ? course.objectivesVi : (course.objectivesEn && course.objectivesEn.length > 0 ? course.objectivesEn : course.objectivesVi);
  const curriculumList = language === 'vi' ? course.curriculumVi : (course.curriculumEn && course.curriculumEn.length > 0 ? course.curriculumEn : course.curriculumVi);

  // Gallery Images List
  const rawGallery = course.galleryUrls && course.galleryUrls.length > 0 ? course.galleryUrls : [course.thumbnailUrl];
  const galleryImages = rawGallery.map(u => u.trim()).filter(Boolean);

  // Main Cover Image (Line 1 URL or thumbnailUrl)
  const topCoverImage = galleryImages.length > 0 ? galleryImages[0] : course.thumbnailUrl;

  const courseTitle = language === 'vi' ? course.titleVi : course.titleEn;
  const courseDesc = language === 'vi' ? course.descriptionVi : course.descriptionEn;
  const courseCategory = language === 'vi' ? course.categoryName : (course.categoryEn || course.categoryName);

  // Construct Course + VideoObject Schema for Google Rich Results
  const courseSchema: Record<string, any> = {
    '@type': 'Course',
    'name': courseTitle,
    'description': courseDesc,
    'provider': {
      '@type': 'Person',
      'name': 'Nguyễn Trọng Huy Hoàng',
      'jobTitle': 'Giáo viên Tiếng Anh Tiểu học',
      'sameAs': window.location.origin
    },
    'educationalLevel': course.gradeLevel,
    'offers': {
      '@type': 'Offer',
      'price': course.priceType === 'free' ? '0' : (course.discountPriceVi || course.priceVi || '0'),
      'priceCurrency': 'VND',
      'availability': 'https://schema.org/InStock'
    }
  };

  const videoSchema = (course.videoUrl && course.videoUrl.trim() !== '') ? {
    '@type': 'VideoObject',
    'name': `Video Giới Thiệu Khóa Học: ${courseTitle}`,
    'description': courseDesc,
    'thumbnailUrl': topCoverImage,
    'contentUrl': course.videoUrl,
    'embedUrl': course.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
  } : undefined;

  const dynamicSchemas = videoSchema ? [courseSchema, videoSchema] : [courseSchema];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <SEO
        title={courseTitle}
        description={courseDesc}
        url={`/courses/${course.slug}`}
        lang={language as 'vi' | 'en'}
        image={topCoverImage}
        type="course"
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: language === 'vi' ? 'Khóa học' : 'Courses', item: '/courses' },
          { name: courseTitle, item: `/courses/${course.slug}` }
        ]}
        keywords={`${courseTitle}, ${courseCategory}, ${course.gradeLevel}, Thầy Nguyễn Trọng Huy Hoàng, Khóa học tiếng Anh trẻ em`}
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
        {/* Navigation Breadcrumb & Price */}
        <div className="flex items-center justify-between">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('nav.courses')}
          </Link>

          <div>
            {(() => {
              const discountPrice = language === 'vi' ? course.discountPriceVi : course.discountPriceEn;
              const hasDiscount = course.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

              if (course.priceType === 'free') {
                return (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                    <Gift className="w-4 h-4" />
                    {t('course.free')}
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
                      {language === 'vi' ? course.priceVi : course.priceEn}
                    </span>
                  </div>
                );
              }

              return (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
                  <CreditCard className="w-4 h-4" />
                  {language === 'vi' ? course.priceVi : course.priceEn}
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
              alt={language === 'vi' ? course.titleVi : course.titleEn}
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

        {/* Course Title Header */}
        <div className="space-y-3">
          <div className="inline-block px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold">
            {language === 'vi' ? course.categoryName : (course.categoryEn || course.categoryName)}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === 'vi' ? course.titleVi : course.titleEn}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-4xl">
            {language === 'vi' ? course.descriptionVi : course.descriptionEn}
          </p>
        </div>

        {/* Info Grid & Registration Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                <div className="text-slate-400 text-[11px] font-semibold uppercase">{t('label.grade')}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? course.gradeLevel : (course.gradeLevelEn || course.gradeLevel)}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                <div className="text-slate-400 text-[11px] font-semibold uppercase">{t('course.duration')}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? course.durationVi : course.durationEn}
                </div>
              </div>
              {(() => {
                const discountPrice = language === 'vi' ? course.discountPriceVi : course.discountPriceEn;
                const hasDiscount = course.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

                return (
                  <div className={`p-4 rounded-2xl border space-y-1 shadow-sm transition-all relative overflow-hidden ${
                    hasDiscount
                      ? 'bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-orange-500/10 border-rose-500/30 ring-2 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">{t('course.fee')}</div>
                      {hasDiscount && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                          🔥 SALE
                        </span>
                      )}
                    </div>

                    {course.priceType === 'free' ? (
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t('course.free')}</div>
                    ) : hasDiscount ? (
                      <div>
                        <div className="text-[11px] text-slate-400 line-through font-medium">
                          {language === 'vi' ? course.priceVi : course.priceEn}
                        </div>
                        <div className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <span>🔥</span>
                          <span>{discountPrice}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        {language === 'vi' ? course.priceVi : course.priceEn}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Objectives */}
            {objectivesList && objectivesList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  <span>{t('course.objectives')}</span>
                </h3>
                <ul className="space-y-3">
                  {objectivesList.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            {curriculumList && curriculumList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-500" />
                  <span>{t('course.curriculum')}</span>
                </h3>
                <div className="space-y-3">
                  {curriculumList.map((item, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl sticky top-24 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t('course.registerTitle')}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'vi' ? 'Đăng Ký Học Cùng Thầy Hoàng' : 'Enroll in this Course'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'vi'
                    ? 'Điền thông tin bên dưới, thầy Hoàng sẽ liên hệ tư vấn và xác nhận xếp lớp cho học sinh.'
                    : 'Fill in your details below to secure a slot for your child.'}
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
                    placeholder={language === 'vi' ? 'Ví dụ: Nguyễn Văn An (Phụ huynh bé Nam)' : 'Full Name'}
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
                    {t('course.grade')}
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder={language === 'vi' ? 'Lớp 3, Lớp 4...' : 'Grade Level'}
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
                    placeholder={language === 'vi' ? 'Ghi chú về lực học hoặc lịch học mong muốn...' : 'Notes'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitRegistration}
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? t('btn.submitting') : t('course.registerNow')}</span>
                </button>

                {/* Bank Payment Account Card */}
                <BankPaymentCardModal className="mt-3" />
              </div>
            </div>
          </div>
        </div>

        {/* ALBUM HÌNH ẢNH KHÓA HỌC */}
        {galleryImages.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ImagesIcon className="w-5 h-5 text-sky-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Album Hình Ảnh Khóa Học' : 'Course Photo Gallery'}
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
                    alt={`Course photo ${idx + 1}`}
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

        {/* VIDEO KHÓA HỌC (CUỐI TRANG) */}
        {course.videoUrl && course.videoUrl.trim() !== '' && (
          <div className="space-y-4 pt-8 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Video Giới Thiệu Khóa Học' : 'Course Video Demo'}
              </h3>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 aspect-video w-full">
              {course.videoUrl.includes('youtube.com') || course.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={course.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={course.titleEn}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={course.videoUrl} controls className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        )}

        {/* CÁC KHÓA HỌC LIÊN QUAN (RELATED COURSES SECTION - MŨI TÊN 1) */}
        {relatedCourses.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-sky-500 shrink-0" />
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('course.relatedTitle')}
                </h3>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors group shrink-0"
              >
                <span>{t('home.viewAllCourses')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCourses.map((rel) => {
                const discountPrice = language === 'vi' ? rel.discountPriceVi : rel.discountPriceEn;
                const hasDiscount = rel.priceType === 'paid' && Boolean(discountPrice && discountPrice.trim());

                return (
                  <Link
                    key={rel.id}
                    to={`/courses/${rel.slug}`}
                    className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 text-left relative"
                  >
                    <div>
                      {/* Image & Price */}
                      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={rel.thumbnailUrl}
                          alt={language === 'vi' ? rel.titleVi : rel.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
                          {rel.priceType === 'free' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-md">
                              <Gift className="w-3 h-3" />
                              {t('course.free')}
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
                          {language === 'vi' ? rel.categoryName : (rel.categoryEn || rel.categoryName)} • {rel.gradeLevel}
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

      {/* POPUP THÔNG BÁO CHÚC MỪNG ĐĂNG KÝ KHÓA HỌC THÀNH CÔNG (HIỂN THỊ CỐ ĐỊNH CHO ĐẾN KHI KHÁCH TỰ ĐÓNG) */}
      {successRegData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-emerald-500/40 shadow-2xl space-y-6 text-left relative overflow-hidden">
            {/* Close button top right */}
            <button
              onClick={() => setSuccessRegData(null)}
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
                🎉 {language === 'vi' ? 'Chúc Mừng Bạn Đã Đăng Ký Khóa Học Thành Công!' : 'Registration Successful!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'vi'
                  ? 'Cảm ơn bạn đã tin tưởng lựa chọn khóa học của Thầy Nguyễn Trọng Huy Hoàng. Thông tin của bạn đã được lưu vào hệ thống và email xác nhận đã gửi đến bạn và Admin.'
                  : 'Thank you for registering. Your details have been submitted and confirmation emails have been sent.'}
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>{language === 'vi' ? '📋 THÔNG TIN GHI NHẬN ĐĂNG KÝ:' : '📋 COURSE REGISTRATION DETAILS:'}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{successRegData.createdAt}</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Khóa học:' : 'Course:'}</strong> {successRegData.courseTitle}</div>
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Họ tên:' : 'Full Name:'}</strong> {successRegData.fullName}</div>
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Số điện thoại:' : 'Phone:'}</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{successRegData.phone}</span></div>
                {successRegData.email && <div><strong className="text-slate-900 dark:text-white">Email:</strong> {successRegData.email}</div>}
                <div><strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Khối lớp / Độ tuổi:' : 'Grade / Age:'}</strong> {successRegData.gradeLevel}</div>
                <div className="flex items-center gap-1.5 pt-1">
                  <strong className="text-slate-900 dark:text-white">{language === 'vi' ? 'Tổng học phí:' : 'Total Tuition:'}</strong>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/30">
                    💰 {successRegData.discountPrice || successRegData.coursePrice || (language === 'vi' ? 'Miễn phí' : 'Free')}
                  </span>
                </div>
                {successRegData.note && (
                  <div className="text-slate-500 italic mt-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    " {successRegData.note} "
                  </div>
                )}
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-700 dark:text-sky-300 flex items-start gap-2.5 leading-relaxed font-medium">
              <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                {language === 'vi'
                  ? `Thầy Hoàng sẽ trực tiếp liên hệ tới SĐT ${successRegData.phone} để tư vấn xếp lịch và hướng dẫn thủ tục nhập học.`
                  : `Teacher Nguyen Trong Huy Hoang will contact you directly via phone number ${successRegData.phone} to advise on schedule and enrollment procedures.`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSuccessRegData(null)}
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
