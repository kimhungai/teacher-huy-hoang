import React, { useState, useEffect } from 'react';
import { DB } from '../../services/db';
import type { SiteSettings, Profile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, QrCode, Copy, Check, X, ShieldCheck, Building2, User, Phone } from 'lucide-react';

export const BankPaymentCardModal: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [copiedAccountNo, setCopiedAccountNo] = useState(false);
  const [copiedAccountHolder, setCopiedAccountHolder] = useState(false);

  useEffect(() => {
    DB.getSiteSettings().then(setSettings);
    DB.getProfile().then(setProfile);
  }, []);

  const bankName = settings?.bankName || 'Ngân hàng VPBank';
  const bankAccountNo = settings?.bankAccountNo || '268330518';
  const bankAccountHolder = settings?.bankAccountHolder || 'HUỲNH KIM HƯNG';
  const bankCode = settings?.bankCode || 'VPB';
  const bankBadgeName = bankCode === 'VPB' ? 'VPBank' : bankCode;

  const phoneNum = settings?.contactPhone || profile?.phone || '0987654321';
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

  return (
    <>
      {/* Trigger Card Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 border border-amber-500/40 text-white hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all text-left group cursor-pointer ${className}`}
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

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
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
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
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
    </>
  );
};
