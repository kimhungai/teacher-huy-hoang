import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import type { SiteSettings, Profile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, MapPin, Phone, MessageCircle, User, CreditCard, QrCode, Copy, Check, X, ShieldCheck, Building2 } from 'lucide-react';
import { Toast } from '../components/common/Toast';

import { SEO } from '../components/common/SEO';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showBankModal, setShowBankModal] = useState(false);
  const [copiedAccountNo, setCopiedAccountNo] = useState(false);
  const [copiedAccountHolder, setCopiedAccountHolder] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    DB.getSiteSettings().then(setSettings);
    DB.getProfile().then(setProfile);
  }, []);

  const bankName = settings?.bankName || 'Ngân hàng VPBank';
  const bankAccountNo = settings?.bankAccountNo || '268330518';
  const bankAccountHolder = settings?.bankAccountHolder || 'HUỲNH KIM HƯNG';
  const bankCode = settings?.bankCode || 'VPB';
  const bankBadgeName = bankCode === 'VPB' ? 'VPBank' : bankCode;

  const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccountNo}-compact2.png?accountName=${encodeURIComponent(bankAccountHolder)}`;

  const copyToClipboard = (text: string, type: 'no' | 'holder') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'no') {
        setCopiedAccountNo(true);
        setTimeout(() => setCopiedAccountNo(false), 2000);
      } else {
        setCopiedAccountHolder(true);
        setTimeout(() => setCopiedAccountHolder(false), 2000);
      }
    }).catch(() => {
      // fallback
    });
  };

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
  const zaloLink = settings?.zaloUrl || `https://zalo.me/${phoneNum.replace(/[^0-9]/g, '')}`;

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
                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 border border-amber-500/40 text-white hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {language === 'vi' ? 'Tài Khoản Thanh Toán' : 'Payment Account'}
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                        {bankName} • {bankAccountNo}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all flex items-center gap-1 shrink-0">
                    <span>{language === 'vi' ? 'Mở QR' : 'View QR'}</span>
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                </button>
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

      {/* Bank Payment Information Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b192e] text-white border border-slate-700/60 rounded-3xl shadow-2xl max-w-3xl w-full p-6 md:p-8 relative my-8 text-left animate-in fade-in zoom-in-95 duration-200">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tài Khoản Thanh Toán Chính Thức' : 'Official Payment Account'}</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mt-2 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {language === 'vi' ? 'Thông Tin Ngân Hàng' : 'Bank Information'}
                </h2>
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{language === 'vi' ? `Tài Khoản Đã Xác Thực ${bankBadgeName}` : `Verified ${bankBadgeName} Account`}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Left Side Details */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                {/* Bank Name */}
                <div className="p-4 rounded-2xl bg-[#11243e] border border-slate-700/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-sky-400 text-base shrink-0">
                    {bankCode}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'vi' ? 'Ngân hàng tiếp nhận' : 'Receiving Bank'}
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">{bankName}</div>
                    <div className="text-xs text-slate-400">({bankCode} - {bankName})</div>
                  </div>
                </div>

                {/* Account Number */}
                <div className="p-4 rounded-2xl bg-[#11243e] border border-slate-700/50 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'vi' ? 'Số tài khoản ngân hàng' : 'Bank Account Number'}
                    </div>
                    <div className="text-xl md:text-2xl font-black text-amber-400 tracking-wider mt-1">
                      {bankAccountNo}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankAccountNo, 'no')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {copiedAccountNo ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAccountNo ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Sao Chép Số TK' : 'Copy Acc No')}</span>
                  </button>
                </div>

                {/* Account Holder */}
                <div className="p-4 rounded-2xl bg-[#11243e] border border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'vi' ? 'Chủ tài khoản' : 'Account Holder'}
                      </div>
                      <div className="text-base font-extrabold text-white mt-0.5 uppercase tracking-wide">
                        {bankAccountHolder}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankAccountHolder, 'holder')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {copiedAccountHolder ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAccountHolder ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Sao chép' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Right Side VietQR Card */}
              <div className="md:col-span-5 bg-white rounded-3xl p-5 border-2 border-amber-400/80 shadow-2xl text-slate-900 flex flex-col items-center justify-between space-y-3 text-center">
                <div className="flex items-center justify-between w-full text-xs font-extrabold text-slate-900">
                  <span>VIETQR CHUYỂN KHOẢN</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-950 text-white font-bold text-[10px] uppercase">
                    {bankCode}
                  </span>
                </div>

                {/* VietQR Code Image */}
                <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 w-full flex flex-col items-center justify-center">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Payment Code"
                    className="max-w-[200px] w-full h-auto object-contain rounded-lg shadow-sm"
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="text-lg font-black text-slate-950 tracking-wider">{bankAccountNo}</div>
                  <div className="text-xs font-extrabold text-slate-800 uppercase">{bankAccountHolder}</div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium max-w-[240px] leading-tight">
                  {language === 'vi' 
                    ? 'Mở App Ngân hàng hoặc MoMo để quét mã QR tự động điền số tiền và thông tin'
                    : 'Open Bank App or MoMo to scan QR code and auto-fill payment details'}
                </div>

                <div className="pt-2 border-t border-slate-200 w-full text-center text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>Xác nhận qua Hotline/Zalo: {phoneNum}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

