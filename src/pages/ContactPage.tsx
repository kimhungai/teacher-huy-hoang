import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import type { SiteSettings, Profile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, MapPin, Phone, MessageCircle, User } from 'lucide-react';
import { Toast } from '../components/common/Toast';

import { SEO } from '../components/common/SEO';
import { BankPaymentCardModal } from '../components/common/BankPaymentCardModal';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    try {
      const cached = localStorage.getItem('db_site_settings');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('db_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    DB.getSiteSettings().then(setSettings);
    DB.getProfile().then(setProfile);
  }, []);

  const seoTitle = language === 'vi'
    ? 'Thông Tin Liên Hệ & Tư Vấn Khóa Học — Thầy Nguyễn Trọng Huy Hoàng'
    : 'Contact & Course Consultation — Teacher Nguyen Trong Huy Hoang';

  const seoDesc = language === 'vi'
    ? 'Thông tin liên hệ chính thức của Thầy Nguyễn Trọng Huy Hoàng. Địa chỉ Trường TH Dương Minh Châu, Quận 10, Số di động/Zalo và Form gửi thắc mắc khóa học Tiếng Anh.'
    : 'Official contact details of Teacher Nguyen Trong Huy Hoang. Duong Minh Chau Primary School location, Phone/Zalo contact, and English course consultation form.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setToast({
        msg: language === 'vi' ? 'Vui lòng điền đầy đủ các thông tin bắt buộc.' : 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      await DB.createContactMessage({
        fullName,
        email,
        phone: phone.trim() || undefined,
        subject: subject || 'Liên hệ từ Website',
        message
      });

      setToast({
        msg: t('contact.success'),
        type: 'success'
      });

      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      setToast({
        msg: t('contact.error'),
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const phoneNum = settings?.contactPhone || profile?.phone || '0987654321';
  const getZaloLink = () => {
    const rawZalo = settings?.zaloUrl?.trim();
    if (rawZalo) {
      if (rawZalo.startsWith('http://') || rawZalo.startsWith('https://')) {
        return rawZalo;
      }
      const digitsOnly = rawZalo.replace(/[^0-9]/g, '');
      if (digitsOnly) return `https://zalo.me/${digitsOnly}`;
    }
    const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
    return `https://zalo.me/${cleanPhone}`;
  };
  const zaloLink = getZaloLink();

  return (
    <div className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/contact"
        lang={language as 'vi' | 'en'}
        breadcrumbs={[
          { name: language === 'vi' ? 'Trang chủ' : 'Home', item: '/' },
          { name: seoTitle, item: '/contact' }
        ]}
        keywords={language === 'vi' 
          ? 'Liên hệ Thầy Nguyễn Trọng Huy Hoàng, Số điện thoại Thầy Hoàng, Zalo tư vấn tiếng anh, Dương Minh Châu Quận 10'
          : 'Contact Teacher Huy Hoang, Zalo English consultation, Duong Minh Chau School'}
      />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Kết Nối & Gửi Tin Nhắn' : 'Connect & Message'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
          {/* Contact Details Card (Column A) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? 'Thông Tin Liên Hệ' : 'Contact Details'}
              </h3>

              <div className="space-y-4 text-xs">
                {/* Full Name */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <User className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {language === 'vi' ? 'Họ và tên' : 'Full Name'}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {language === 'vi' 
                        ? (profile?.fullName || 'Nguyễn Trọng Huy Hoàng') 
                        : (profile?.fullNameEn || profile?.fullName || 'Nguyen Trong Huy Hoang')}
                    </div>
                  </div>
                </div>

                {/* Contact Address */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {language === 'vi' ? 'Địa chỉ liên hệ' : 'Contact Address'}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {language === 'vi' 
                        ? (profile?.locationVi || 'Quận 10, Thành phố Hồ Chí Minh, Việt Nam') 
                        : (profile?.locationEn || 'District 10, Ho Chi Minh City, Vietnam')}
                    </div>
                  </div>
                </div>

                {/* Mobile Phone & Zalo Button */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {language === 'vi' ? 'Số di động' : 'Mobile Phone'}
                      </div>
                      <a href={`tel:${phoneNum}`} className="text-slate-700 dark:text-slate-300 font-semibold hover:text-sky-600 mt-0.5 block">
                        {phoneNum}
                      </a>
                    </div>
                  </div>

                  {/* Button Chat / Gọi Zalo */}
                  <a
                    href={zaloLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Liên Hệ Qua Zalo Ngay' : 'Chat via Zalo'}</span>
                  </a>
                </div>

                {/* Email Admin */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <Mail className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Email Admin</div>
                    <div className="text-slate-500 mt-0.5 break-all">
                      {settings?.contactEmail || 'huynhkimhungabmthaydangtu@gmail.com'}
                    </div>
                  </div>
                </div>

                {/* Bank Payment Account Card Trigger */}
                <BankPaymentCardModal />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs mt-6">
              <p className="font-semibold">
                {language === 'vi'
                  ? 'Thầy Hoàng luôn sẵn sàng trao đổi kinh nghiệm chuyên môn, chia sẻ tài liệu và hợp tác!'
                  : 'Always open for professional exchange, resource sharing, and collaboration!'}
              </p>
            </div>
          </div>

          {/* Form Card (Column B) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between h-full">
            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('contact.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Nguyen Van A"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('contact.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'vi' ? 'Số điện thoại di động' : 'Mobile Phone'} <span className="text-slate-400 font-normal">({language === 'vi' ? 'Tùy chọn' : 'Optional'})</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0987654321"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('contact.subject')}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Trao đổi tài liệu giảng dạy"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nội dung lời nhắn..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 disabled:opacity-50 transition-all mt-4"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? t('btn.submitting') : t('btn.submit')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

