import React, { useEffect, useState } from 'react';
import { DB } from '../../services/db';
import type { SiteSettings, AdminAccount } from '../../types';
import {
  Save, Download, Upload, Database, Key, ShieldCheck, CheckCircle2, XCircle, Mail, Send, HelpCircle, X, Globe,
  UserPlus, Edit3, Trash2, Eye, EyeOff, UserCheck, ShieldAlert, RefreshCw
} from 'lucide-react';
import { Toast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { sendTestEmail } from '../../services/emailNotifier';

export const AdminSettingsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [showEmailHelpModal, setShowEmailHelpModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Super Admin Client Account Management State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingAdminAccount, setEditingAdminAccount] = useState<AdminAccount | null>(null);
  const [deletingAdminAccount, setDeletingAdminAccount] = useState<AdminAccount | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  useEffect(() => {
    document.title = 'Cấu hình Website — Admin CMS';
    DB.getSiteSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await DB.updateSiteSettings(settings);
    setSaving(false);
    setToast({ msg: 'Cập nhật cấu hình website thành công!', type: 'success' });
  };

  const clientAccounts: AdminAccount[] = settings?.clientAdminAccounts || [
    {
      id: 'ca_default',
      email: settings?.contactEmail || 'huynhkimhungabmthaydangtu@gmail.com',
      password: settings?.adminPassword || 'Admin@123',
      name: 'Tài khoản bàn giao Khách hàng',
      role: 'client_admin',
      createdAt: '2026-01-01'
    }
  ];

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setShowAddAdminModal(true);
  };

  const handleOpenEditModal = (acc: AdminAccount) => {
    setEditingAdminAccount(acc);
    setAdminName(acc.name || '');
    setAdminEmail(acc.email);
    setAdminPassword(acc.password);
  };

  const handleSaveNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const emailTrim = adminEmail.toLowerCase().trim();
    if (!emailTrim || !emailTrim.includes('@')) {
      setToast({ msg: 'Vui lòng nhập Email Admin Client hợp lệ!', type: 'error' });
      return;
    }

    if (emailTrim === 'huynhkimhung727@gmail.com') {
      setToast({ msg: 'Email này trùng với Super Admin Master! Vui lòng chọn Email khác cho Client Admin.', type: 'error' });
      return;
    }

    if (clientAccounts.some(a => a.email.toLowerCase().trim() === emailTrim)) {
      setToast({ msg: 'Email này đã tồn tại trong danh sách Admin Client!', type: 'error' });
      return;
    }

    if (!adminPassword || adminPassword.length < 4) {
      setToast({ msg: 'Mật khẩu phải có ít nhất 4 ký tự!', type: 'error' });
      return;
    }

    const newAccount: AdminAccount = {
      id: 'ca_' + Date.now(),
      email: emailTrim,
      password: adminPassword,
      name: adminName.trim() || `Tài khoản Client Admin ${clientAccounts.length + 1}`,
      role: 'client_admin',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const updatedAccounts = [...clientAccounts, newAccount];
    const updatedSettings: SiteSettings = {
      ...settings,
      clientAdminAccounts: updatedAccounts
    };

    await DB.updateSiteSettings(updatedSettings);
    setSettings(updatedSettings);
    setShowAddAdminModal(false);
    setToast({ msg: `Thêm tài khoản Admin Client (${emailTrim}) thành công!`, type: 'success' });
  };

  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !editingAdminAccount) return;

    const emailTrim = adminEmail.toLowerCase().trim();
    if (!emailTrim || !emailTrim.includes('@')) {
      setToast({ msg: 'Vui lòng nhập Email Admin Client hợp lệ!', type: 'error' });
      return;
    }

    if (emailTrim === 'huynhkimhung727@gmail.com') {
      setToast({ msg: 'Email này trùng với Super Admin Master! Vui lòng chọn Email khác.', type: 'error' });
      return;
    }

    if (clientAccounts.some(a => a.id !== editingAdminAccount.id && a.email.toLowerCase().trim() === emailTrim)) {
      setToast({ msg: 'Email này đã được sử dụng bởi một tài khoản Admin khác!', type: 'error' });
      return;
    }

    if (!adminPassword || adminPassword.length < 4) {
      setToast({ msg: 'Mật khẩu phải có ít nhất 4 ký tự!', type: 'error' });
      return;
    }

    const updatedAccounts = clientAccounts.map(a => {
      if (a.id === editingAdminAccount.id) {
        return {
          ...a,
          email: emailTrim,
          password: adminPassword,
          name: adminName.trim() || a.name
        };
      }
      return a;
    });

    let extraSettings: Partial<SiteSettings> = {};
    if (editingAdminAccount.id === 'ca_default' || editingAdminAccount.email === settings.contactEmail) {
      extraSettings.contactEmail = emailTrim;
      extraSettings.adminPassword = adminPassword;
    }

    const updatedSettings: SiteSettings = {
      ...settings,
      ...extraSettings,
      clientAdminAccounts: updatedAccounts
    };

    await DB.updateSiteSettings(updatedSettings);
    setSettings(updatedSettings);
    setEditingAdminAccount(null);
    setToast({ msg: `Cập nhật thông tin tài khoản (${emailTrim}) thành công!`, type: 'success' });
  };

  const handleConfirmDeleteAdmin = async () => {
    if (!settings || !deletingAdminAccount) return;

    if (clientAccounts.length <= 1) {
      setToast({ msg: 'Hệ thống cần ít nhất 01 tài khoản Admin Client. Không thể xóa tài khoản cuối cùng!', type: 'error' });
      return;
    }

    const updatedAccounts = clientAccounts.filter(a => a.id !== deletingAdminAccount.id);
    const updatedSettings: SiteSettings = {
      ...settings,
      clientAdminAccounts: updatedAccounts
    };

    await DB.updateSiteSettings(updatedSettings);
    setSettings(updatedSettings);
    setDeletingAdminAccount(null);
    setToast({ msg: `Đã xóa tài khoản Admin Client (${deletingAdminAccount.email}) khỏi hệ thống!`, type: 'success' });
  };

  const handleExportBackup = async () => {
    const jsonStr = await DB.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `huyhoang-english-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ msg: 'Đã xuất file sao lưu toàn bộ dữ liệu website thành công!', type: 'success' });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = await DB.importFullDatabase(content);
        if (ok) {
          await DB.syncAllDataToSupabase();
          setToast({ msg: 'Khôi phục dữ liệu từ file backup & đồng bộ lên Supabase Cloud thành công!', type: 'success' });
          setTimeout(() => window.location.reload(), 1200);
        } else {
          setToast({ msg: 'Lỗi: File backup không đúng định dạng!', type: 'error' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleTestSendEmail = async () => {
    const receiverMail = (settings?.contactEmail || '').trim();
    if (!receiverMail) {
      setToast({ msg: 'Vui lòng điền Contact Email (Mail Nhận Thông Báo) trước khi gửi thử!', type: 'error' });
      return;
    }
    setTestingEmail(true);
    const result = await sendTestEmail(receiverMail);
    setTestingEmail(false);

    if (result.success) {
      setToast({ msg: `✅ Đã gửi email test thành công đến hòm thư nhận: ${receiverMail}`, type: 'success' });
    } else {
      setToast({ msg: `❌ Lỗi gửi email: ${result.message}`, type: 'error' });
    }
  };

  const handleSyncAllToSupabase = async () => {
    setSyncingSupabase(true);
    const res = await DB.syncAllDataToSupabase();
    setSyncingSupabase(false);
    if (res.success) {
      setToast({ msg: `✅ ${res.message}`, type: 'success' });
    } else {
      setToast({ msg: `❌ ${res.message}`, type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const currentPass = isSuperAdmin
      ? (settings.superAdminPassword || 'Admin@2020')
      : (settings.adminPassword || 'Admin@123');

    if (oldPassword !== currentPass) {
      setToast({ msg: 'Mật khẩu hiện tại không chính xác!', type: 'error' });
      return;
    }

    if (!isPasswordValid) {
      setToast({
        msg: 'Mật khẩu mới chưa đạt yêu cầu độ khó (gồm chữ cái, chữ số và ký tự đặc biệt)!',
        type: 'error'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ msg: 'Xác nhận mật khẩu mới không trùng khớp!', type: 'error' });
      return;
    }

    setChangingPass(true);
    const updatedSettings = isSuperAdmin
      ? { ...settings, superAdminPassword: newPassword }
      : { ...settings, adminPassword: newPassword };

    await DB.updateSiteSettings(updatedSettings);
    setSettings(updatedSettings);
    setChangingPass(false);

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToast({
      msg: `Đổi mật khẩu ${isSuperAdmin ? 'Super Admin Master' : 'Admin Khách Hàng'} thành công! Mật khẩu mới đã được lưu trực tiếp vào hệ thống.`,
      type: 'success'
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 text-left max-w-4xl pb-12">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cấu Hình Website & Mạng Xã Hội</h1>
        <p className="text-xs text-slate-500">Chỉnh sửa tên website, màu sắc chủ đạo, email liên hệ và mạng xã hội</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên Logo Text</label>
            <input
              type="text"
              value={settings.logoText}
              onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Ảnh Logo (Tùy chọn)</label>
            <input
              type="text"
              value={settings.logoUrl || ''}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              placeholder="https://.../logo.png"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Contact Email (Mail Nhận Thông Tin Liên Hệ & Nhận Thông Báo Đơn Hàng)
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số Điện Thoại Liên Hệ</label>
            <input
              type="text"
              value={settings.contactPhone || ''}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>

          {/* Link Website Chính Thức */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>Link Website Chính Thức (Official Domain URL)</span>
              </span>
              <span className="text-[10px] text-sky-500 font-normal">Cập nhật link chính thức khi upload Vercel / Web host</span>
            </label>
            <input
              type="url"
              value={settings.websiteUrl || ''}
              onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
              placeholder="Ví dụ: https://thaydangtu.com hoặc https://huyhoangenglish.vercel.app"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Màu chủ đạo (Primary Color)</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border-0"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ngôn ngữ mặc định</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <option value="vi">Tiếng Việt (VI)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chế độ nền mặc định (Default Theme)</label>
            <select
              value={settings.defaultTheme || 'dark'}
              onChange={(e) => setSettings({ ...settings, defaultTheme: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              <option value="dark">Giao diện Tối (Dark Mode)</option>
              <option value="light">Giao diện Sáng (Light Mode)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🌐</span>
            <span>Liên Kết Mạng Xã Hội</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Facebook Page URL</label>
              <input
                type="text"
                value={settings.facebookUrl || ''}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">YouTube Channel URL</label>
              <input
                type="text"
                value={settings.youtubeUrl || ''}
                onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Instagram URL</label>
              <input
                type="text"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">X / Twitter URL</label>
              <input
                type="text"
                value={settings.xUrl || ''}
                onChange={(e) => setSettings({ ...settings, xUrl: e.target.value })}
                placeholder="https://x.com/..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">TikTok URL</label>
              <input
                type="text"
                value={settings.tiktokUrl || ''}
                onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">LinkedIn URL</label>
              <input
                type="text"
                value={settings.linkedinUrl || ''}
                onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer Text & Copyright Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nội Dung Dòng Chân Trang Footer (Copyright & Thông Điệp Tagline)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chỉnh sửa thông tin bản quyền bên trái và dòng thông điệp tagline bên phải ở dưới cùng chân trang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dòng Bản Quyền Copyright (Tiếng Việt - Bên Trái)</label>
              <input
                type="text"
                value={settings.footerCopyrightVi || settings.footerTextVi || ''}
                onChange={(e) => setSettings({ ...settings, footerCopyrightVi: e.target.value, footerTextVi: e.target.value })}
                placeholder="© 2026 Thầy giáo Nguyễn Trọng Huy Hoàng. Trường TH Dương Minh Châu."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dòng Bản Quyền Copyright (Tiếng Anh - Bên Trái)</label>
              <input
                type="text"
                value={settings.footerCopyrightEn || settings.footerTextEn || ''}
                onChange={(e) => setSettings({ ...settings, footerCopyrightEn: e.target.value, footerTextEn: e.target.value })}
                placeholder="© 2026 Teacher Nguyen Trong Huy Hoang. Duong Minh Chau Primary School."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Thông Điệp Footer Tagline (Tiếng Việt - Bên Phải)</label>
              <input
                type="text"
                value={settings.footerTaglineVi || ''}
                onChange={(e) => setSettings({ ...settings, footerTaglineVi: e.target.value })}
                placeholder="Được tạo với ❤️ cho Giáo Dục"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Thông Điệp Footer Tagline (Tiếng Anh - Bên Phải)</label>
              <input
                type="text"
                value={settings.footerTaglineEn || ''}
                onChange={(e) => setSettings({ ...settings, footerTaglineEn: e.target.value })}
                placeholder="Crafted with ❤️ for Primary Education"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Custom Footer HTML / Script Plugins */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mã HTML / Script Plugin Chèn Vào Footer (Tùy chọn)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dán đoạn mã HTML hoặc Script của Chatbot, Nút chia sẻ, Tawk.to, Zalo Chat Widget, Facebook Messenger... để hiển thị ở Footer website.
            </p>
          </div>
          <textarea
            rows={5}
            value={settings.customFooterHtml || ''}
            onChange={(e) => setSettings({ ...settings, customFooterHtml: e.target.value })}
            placeholder={`<script src="https://embed.tawk.to/..."></script>\nhoặc\n<div className="custom-widget">...</div>`}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Menu On/Off Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bật / Tắt Menu Trên Website</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tùy chọn ẩn hoặc hiện các chuyên mục trên thanh menu, trang chủ và footer ở cả giao diện Tiếng Việt & Tiếng Anh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Projects Menu Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Menu "Dự án" (Projects)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Ẩn / hiện danh mục dự án sáng tạo</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showProjectsMenu !== false}
                  onChange={(e) => setSettings({ ...settings, showProjectsMenu: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* Achievements Menu Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Menu "Thành tựu" (Achievements)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Ẩn / hiện danh hiệu & chứng chỉ chuyên môn</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAchievementsMenu !== false}
                  onChange={(e) => setSettings({ ...settings, showAchievementsMenu: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* Blog Menu Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Menu "Góc chia sẻ" (Blog)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Ẩn / hiện bài viết blog trên menu & trang chủ</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showBlogMenu !== false}
                  onChange={(e) => setSettings({ ...settings, showBlogMenu: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* Gallery Menu Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Menu "Thư viện ảnh" (Gallery)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Ẩn / hiện thư viện hình ảnh & video</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showGalleryMenu !== false}
                  onChange={(e) => setSettings({ ...settings, showGalleryMenu: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* CẤU HÌNH TỰ ĐỘNG GỬI EMAIL NOTIFICATIONS */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>Cấu Hình Tự Động Gửi Email Thông Báo (Email Notification Service)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thiết lập tự động gửi email xác nhận cho Khách hàng & email thông báo cho Admin khi có đăng ký Khóa học / Học liệu mới.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowEmailHelpModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 text-xs font-bold transition-all border border-amber-500/30 cursor-pointer shadow-sm"
                title="Xem hướng dẫn chi tiết quy trình thay đổi Email Admin & Kết nối EmailJS"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Hướng Dẫn Cấu Hình Mail (Help)</span>
              </button>

              <button
                type="button"
                onClick={handleTestSendEmail}
                disabled={testingEmail}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingEmail ? 'Đang gửi thử...' : 'Gửi Thử Email Test'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-4">
            {/* Toggle Enable */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Bật tự động gửi Email thông báo</div>
                <div className="text-[11px] text-slate-500">Tự động kích hoạt luồng gửi mail khi có lượt đăng ký mới</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableEmailNotification !== false}
                  onChange={(e) => setSettings({ ...settings, enableEmailNotification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Select Provider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phương thức gửi Email</label>
                <select
                  value={settings.emailProvider || 'emailjs'}
                  onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="emailjs">🌟 Phương án 1: EmailJS API (Khuyên Dùng — Gửi mail trực tiếp đứng tên Gmail Admin chính chủ 100%)</option>
                  <option value="direct_web">⚡ Phương án 2: Direct Web Gateway (Dự phòng — Tự động gửi qua FormSubmit, không cần API key)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email để Gửi Thông Báo (Gmail Kết Nối EmailJS)
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail !== undefined ? settings.notificationEmail : (settings.contactEmail || '')}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  placeholder="huynhkimhung2023@gmail.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 leading-relaxed">
                  💡 <strong>Lưu ý quan trọng:</strong> Địa chỉ hòm thư gửi thực tế (Từ/From) hiển thị trong Gmail người nhận được quy định bởi tài khoản Gmail đã được ủy quyền kết nối vào <strong>Service ID</strong> trên <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="underline font-bold">EmailJS.com</a>. Nếu thay đổi hòm thư gửi ở ô này, bạn cần vào EmailJS ủy quyền Gmail mới và dán lại 3 thông số bên dưới.
                </p>
              </div>
            </div>


            {/* EmailJS Credentials Fields */}
            {settings.emailProvider === 'emailjs' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Thông số kết nối EmailJS API (https://emailjs.com):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Service ID</label>
                    <input
                      type="text"
                      value={settings.emailjsServiceId || ''}
                      onChange={(e) => setSettings({ ...settings, emailjsServiceId: e.target.value })}
                      placeholder="service_xxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Public Key (User ID)</label>
                    <input
                      type="text"
                      value={settings.emailjsPublicKey || ''}
                      onChange={(e) => setSettings({ ...settings, emailjsPublicKey: e.target.value })}
                      placeholder="user_xxxxxx"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Template ID (Khách)</label>
                    <input
                      type="text"
                      value={settings.emailjsTemplateIdCustomer || ''}
                      onChange={(e) => setSettings({ ...settings, emailjsTemplateIdCustomer: e.target.value })}
                      placeholder="template_cust"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Template ID (Admin)</label>
                    <input
                      type="text"
                      value={settings.emailjsTemplateIdAdmin || ''}
                      onChange={(e) => setSettings({ ...settings, emailjsTemplateIdAdmin: e.target.value })}
                      placeholder="template_admin"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Webhook Endpoint */}
            {settings.emailProvider === 'custom_api' && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Webhook API Endpoint</label>
                <input
                  type="text"
                  value={settings.customEmailEndpoint || ''}
                  onChange={(e) => setSettings({ ...settings, customEmailEndpoint: e.target.value })}
                  placeholder="https://api.yourdomain.com/send-email"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Backup & Restore Data Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-500" />
              <span>Sao Lưu & Phôi Phục Dữ Liệu Website (Backup & Restore)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Xuất toàn bộ dữ liệu Backend thành file `.json` để cất giữ an toàn, hoặc tải file `.json` lên để phôi phục lại ngay tức thì.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncAllToSupabase}
              disabled={syncingSupabase}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
              title="Đồng bộ cưỡng bức toàn bộ dữ liệu (Học viên đăng ký, Đơn hàng, Cấu hình...) từ Localhost lên Supabase Cloud"
            >
              <RefreshCw className={`w-4 h-4 ${syncingSupabase ? 'animate-spin' : ''}`} />
              <span>{syncingSupabase ? 'Đang đồng bộ dữ liệu...' : '⚡ Đồng Bộ Cưỡng Bức Lên Supabase Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-400 text-xs font-bold transition-all shadow-sm cursor-pointer border border-sky-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Tải Về File Sao Lưu (.json)</span>
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all shadow-sm cursor-pointer border border-emerald-500/20">
              <Upload className="w-4 h-4" />
              <span>Khôi Phục Từ File Backup (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
          </button>
        </div>
      </form>

      {/* ĐỔI MẬT KHẨU ADMIN SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Bảo Mật & Đổi Mật Khẩu Admin</h2>
          </div>
          {isSuperAdmin && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              🛡️ Hệ thống đa tài khoản kích hoạt (Super Admin View)
            </span>
          )}
        </div>

        {/* Danh sách các tài khoản Admin & Công cụ quản lý - CHỈ HIỂN THỊ KHI ĐĂNG NHẬP BẰNG TÀI KHOẢN SUPER ADMIN MASTER */}
        {isSuperAdmin && (
          <div className="space-y-4 pt-1 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-500" />
                  <span>Quản Lý Chi Tiết Danh Sách Tài Khoản Admin Client</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Super Admin có toàn quyền Thêm tài khoản mới, Sửa Email/Mật khẩu hoặc Xóa tài khoản Admin Client.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm Admin Client Mới</span>
              </button>
            </div>

            {/* Grid Các Tài Khoản Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Card 1: Super Admin Master (Tài khoản tối cao - Bảo vệ) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-indigo-500/10 border border-amber-500/40 space-y-2 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>1. Tài Khoản Tác Giả Tối Cao</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-sm">
                    Super Admin Master
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span className="text-slate-500">Email Super Admin:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono font-extrabold">huynhkimhung727@gmail.com</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Mật khẩu hiện tại:</span>
                    <div className="flex items-center gap-1.5">
                      <code className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono font-extrabold text-xs">
                        {visiblePasswords['super'] ? (settings.superAdminPassword || 'Admin@2020') : '••••••••••••'}
                      </code>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('super')}
                        className="text-slate-400 hover:text-amber-500 p-1"
                        title={visiblePasswords['super'] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {visiblePasswords['super'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 italic pt-1 border-t border-amber-500/20 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                  <span>Tài khoản gốc bảo mật tối cao của Tác giả (Không thể xóa)</span>
                </div>
              </div>

              {/* Dynamic Client Admin Accounts */}
              {clientAccounts.map((acc, index) => (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm relative group hover:border-sky-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      {index + 2}. {acc.name || `Tài Khoản Client Admin ${index + 1}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-extrabold">
                      Client Admin
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span className="text-slate-500">Email Admin Client:</span>
                      <span className="text-sky-600 dark:text-sky-400 font-mono font-semibold truncate max-w-[200px]" title={acc.email}>
                        {acc.email}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Mật khẩu hiện tại:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono font-extrabold text-xs">
                          {visiblePasswords[acc.id] ? acc.password : '••••••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(acc.id)}
                          className="text-slate-400 hover:text-sky-500 p-1"
                          title={visiblePasswords[acc.id] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {visiblePasswords[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-slate-400">Tạo ngày: {acc.createdAt || '2026-01-01'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(acc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-400 font-bold transition-all cursor-pointer"
                        title="Chỉnh sửa Email hoặc Mật khẩu của tài khoản Admin này"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingAdminAccount(acc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold transition-all cursor-pointer"
                        title="Xóa tài khoản Admin Client này ra khỏi hệ thống"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Mật khẩu hiện tại..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Real-time Checklist độ khó */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>Yêu cầu độ khó mật khẩu an toàn:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-semibold">
              <div className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5" : "text-slate-400 flex items-center gap-1.5"}>
                {hasMinLength ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span>Tối thiểu 6 ký tự</span>
              </div>
              <div className={hasLetter ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5" : "text-slate-400 flex items-center gap-1.5"}>
                {hasLetter ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span>Chứa chữ cái (a-z, A-Z)</span>
              </div>
              <div className={hasNumber ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5" : "text-slate-400 flex items-center gap-1.5"}>
                {hasNumber ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span>Chứa chữ số (0-9)</span>
              </div>
              <div className={hasSpecial ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5" : "text-slate-400 flex items-center gap-1.5"}>
                {hasSpecial ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <span>Ký tự đặc biệt (@#$...)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={changingPass}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>{changingPass ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Admin'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* MODAL HƯỚNG DẪN CHI TIẾT CẤU HÌNH EMAILJS & ĐỔI EMAIL ADMIN */}
      {showEmailHelpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-amber-500/40 shadow-2xl space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowEmailHelpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng Hướng Dẫn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  📘 Hướng Dẫn Chi Tiết Cấu Hình Email & Quy Trình Đổi Gmail Admin
                </h2>
                <p className="text-xs text-slate-500">Kết nối EmailJS gửi mail chính chủ dưới nhãn Gmail Admin cá nhân</p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4 pt-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-amber-600 dark:text-amber-400">
                🚀 Quy Trình 4 Bước Tạo Mới Hoặc Đổi Gmail Admin (Thực Hiện Trong 2 Phút):
              </h3>

              <div className="space-y-3 text-xs">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black">1</span>
                    <span>Đăng nhập hoặc Đăng ký tài khoản EmailJS (Miễn phí 200 mail/tháng)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 pl-8">
                    Truy cập trang chủ <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-bold">https://www.emailjs.com</a> và bấm Sign Up (miễn phí 100%).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black">2</span>
                    <span>Kết nối Hòm thư Gmail Admin mới (Lấy Service ID)</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 pl-8 space-y-1">
                    <li>Vào mục menu bên trái: <strong>Email Services</strong> ➔ Bấm <strong>Add New Service</strong>.</li>
                    <li>Chọn biểu tượng <strong>Gmail</strong> ➔ Đăng nhập cho phép kết nối hòm thư Gmail của Admin.</li>
                    <li>Bấm <strong>Create Service</strong> ➔ Copy mã <strong>Service ID</strong> (Ví dụ: <code>service_zs3o9xk</code>).</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black">3</span>
                    <span>Tạo Mẫu Thư Thông Báo (Lấy Template ID)</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 pl-8 space-y-1">
                    <li>Vào mục menu <strong>Email Templates</strong> ➔ Bấm <strong>Create New Template</strong>.</li>
                    <li>Đặt ô <code>To Email *</code> là <strong><code>{"{{to_email}}"}</code></strong></li>
                    <li>Đặt ô <code>Subject *</code> là <strong><code>{"{{subject}}"}</code></strong></li>
                    <li>Đặt ô <code>Content</code> chứa <strong><code>{"{{message}}"}</code></strong></li>
                    <li>Bấm <strong>Save</strong> ➔ Copy mã <strong>Template ID</strong> (Ví dụ: <code>template_x0sq81m</code>).</li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black">4</span>
                    <span>Lấy Public Key & Dán Vào Backend CMS</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 pl-8 space-y-1">
                    <li>Vào mục menu <strong>Account</strong> ➔ Copy mã <strong>Public Key</strong> (Ví dụ: <code>WO1ouvFyJLF61TfZ8</code>).</li>
                    <li>Quay lại trang Backend này, dán 3 thông số vào 3 ô tương ứng và nhấn <strong>Lưu Cấu Hình</strong>.</li>
                    <li>Bấm nút <strong>"Gửi Thử Email Test"</strong> để kiểm tra nhận mail thành công!</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer Close */}
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowEmailHelpModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md cursor-pointer"
              >
                Đã Hiểu & Đóng Hướng Dẫn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM TÀI KHOẢN ADMIN CLIENT MỚI */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Thêm Tài Khoản Admin Client Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên gợi nhớ / Ghi chú</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tài khoản Bàn giao Khách hàng 2"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Admin Client mới</label>
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: troly.thaydangtu@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu đăng nhập</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Admin@2026"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA TÀI KHOẢN ADMIN CLIENT */}
      {editingAdminAccount && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Sửa Tài Khoản Admin Client</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdminAccount(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tên gợi nhớ / Ghi chú</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Admin Client</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                <input
                  type="text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAdminAccount(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA TÀI KHOẢN ADMIN CLIENT */}
      {deletingAdminAccount && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-rose-500/30 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Xác Nhận Xóa Tài Khoản</h3>
                <p className="text-xs text-rose-500 font-semibold mt-0.5">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản Admin Client <strong className="text-sky-500">{deletingAdminAccount.email}</strong> khỏi hệ thống không? Sau khi xóa, tài khoản này sẽ không thể đăng nhập vào hệ thống CMS nữa.
            </p>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAdminAccount(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAdmin}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Xóa Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
