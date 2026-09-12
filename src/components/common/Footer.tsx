import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, School, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DB } from '../../services/db';
import type { SiteSettings, HeroSettings, Profile } from '../../types';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    try {
      const cached = localStorage.getItem('db_settings');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(() => {
    try {
      const cached = localStorage.getItem('db_hero');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('db_profile');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const pluginContainerRef = useRef<HTMLDivElement>(null);

  const loadSettings = () => {
    DB.getSiteSettings().then(setSettings);
    DB.getHeroSettings().then(setHeroSettings);
    DB.getProfile().then(setProfile);
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('site-settings-updated', loadSettings);
    window.addEventListener('profile-updated', loadSettings);
    return () => {
      window.removeEventListener('site-settings-updated', loadSettings);
      window.removeEventListener('profile-updated', loadSettings);
    };
  }, []);

  useEffect(() => {
    if (pluginContainerRef.current && settings?.customFooterHtml) {
      pluginContainerRef.current.innerHTML = settings.customFooterHtml;
      const scripts = pluginContainerRef.current.querySelectorAll('script');
      scripts.forEach((s) => {
        const newScript = document.createElement('script');
        Array.from(s.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        if (s.src) {
          newScript.src = s.src;
          newScript.async = true;
        } else {
          newScript.innerHTML = s.innerHTML;
        }
        document.body.appendChild(newScript);
      });
    }
  }, [settings?.customFooterHtml]);

  const renderLogoText = () => {
    const rawText = settings?.logoText || 'HUY HOÀNG';
    if (rawText.includes('/')) {
      const parts = rawText.split('/');
      return (
        <div className="text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 leading-none">
            {parts[0].trim()}
          </div>
          <div className="font-extrabold text-white text-base tracking-tight leading-tight mt-0.5">
            {parts[1].trim()}
          </div>
        </div>
      );
    }

    return (
      <div className="text-left">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 leading-none">
          TEACHER
        </div>
        <div className="font-extrabold text-white text-base tracking-tight leading-tight mt-0.5">
          {rawText}
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-sky-600/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
              )}
              {renderLogoText()}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {language === 'vi'
                ? (heroSettings?.headlineVi || 'Biến Tiếng Anh Thành Hành Trình Vui Vẻ, Ý Nghĩa & Đáng Nhớ')
                : (heroSettings?.headlineEn || 'Making English Fun, Meaningful & Memorable')}
            </p>
            {/* Social Links */}
            <div className="flex items-center flex-wrap gap-2.5 pt-2">
              {settings?.facebookUrl && settings.facebookUrl.trim() !== '' && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {settings?.youtubeUrl && settings.youtubeUrl.trim() !== '' && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white transition-colors"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {settings?.zaloUrl && settings.zaloUrl.trim() !== '' && (
                <a
                  href={settings.zaloUrl.startsWith('http') ? settings.zaloUrl : `https://zalo.me/${settings.zaloUrl.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-blue-500 hover:text-white transition-colors text-[11px] font-black tracking-tight flex items-center justify-center min-w-[32px] h-[32px]"
                  aria-label="Zalo"
                  title="Zalo"
                >
                  Zalo
                </a>
              )}
              {settings?.instagramUrl && settings.instagramUrl.trim() !== '' && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-pink-600 hover:text-white transition-colors"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings?.xUrl && settings.xUrl.trim() !== '' && (
                <a
                  href={settings.xUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                  title="X (Twitter)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {settings?.tiktokUrl && settings.tiktokUrl.trim() !== '' && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                  aria-label="TikTok"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.12V9.4a6.27 6.27 0 0 0-1-.08 6.34 6.34 0 1 0 6.34 6.34V9.28a8.16 8.16 0 0 0 4.95 1.66V7.49a4.79 4.79 0 0 1-1-.8z"/>
                  </svg>
                </a>
              )}
              {settings?.linkedinUrl && settings.linkedinUrl.trim() !== '' && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="font-bold text-white text-sm mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-sky-400 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/teaching" className="hover:text-sky-400 transition-colors">
                  {t('nav.teaching')}
                </Link>
              </li>
              {settings?.showProjectsMenu !== false && (
                <li>
                  <Link to="/projects" className="hover:text-sky-400 transition-colors">
                    {t('nav.projects')}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/courses" className="hover:text-sky-400 transition-colors">
                  {t('nav.courses')}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-sky-400 transition-colors">
                  {t('nav.resources')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Content Links */}
          <div className="text-left">
            <h4 className="font-bold text-white text-sm mb-4">{t('footer.resourcesTitle')}</h4>
            <ul className="space-y-2 text-xs">
              {settings?.showBlogMenu !== false && (
                <li>
                  <Link to="/blog" className="hover:text-sky-400 transition-colors">
                    {t('nav.blog')}
                  </Link>
                </li>
              )}
              {settings?.showAchievementsMenu !== false && (
                <li>
                  <Link to="/achievements" className="hover:text-sky-400 transition-colors">
                    {t('nav.achievements')}
                  </Link>
                </li>
              )}
              {settings?.showGalleryMenu !== false && (
                <li>
                  <Link to="/gallery" className="hover:text-sky-400 transition-colors">
                    {t('nav.gallery')}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-left">
            <h4 className="font-bold text-white text-sm mb-4">{t('footer.contactInfo')}</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <School className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'vi'
                    ? ((profile?.schoolVi && profile.schoolVi.trim() !== '') ? profile.schoolVi : (profile?.fullName || 'Nguyễn Trọng Huy Hoàng'))
                    : ((profile?.schoolEn && profile.schoolEn.trim() !== '') ? profile.schoolEn : (profile?.fullNameEn || profile?.fullName || 'Nguyen Trong Huy Hoang'))}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'vi'
                    ? (profile?.locationVi || 'Quận 10, Thành phố Hồ Chí Minh, Việt Nam')
                    : (profile?.locationEn || 'District 10, Ho Chi Minh City, Vietnam')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`mailto:${settings?.contactEmail || 'huynhkimhungabmthaydangtu@gmail.com'}`}
                  className="hover:text-sky-400 transition-colors truncate"
                >
                  {settings?.contactEmail || 'huynhkimhungabmthaydangtu@gmail.com'}
                </a>
              </li>
              {settings?.websiteUrl && settings.websiteUrl.trim() !== '' && (
                <li className="flex items-center gap-2 pt-0.5">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <a
                    href={settings.websiteUrl.startsWith('http') ? settings.websiteUrl : `https://${settings.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline hover:text-sky-300 font-bold transition-colors truncate"
                  >
                    {settings.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Custom Footer Plugins (Chatbot, Share, Widgets...) */}
        {settings?.customFooterHtml && (
          <div ref={pluginContainerRef} className="custom-footer-plugins mt-4" />
        )}

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            {language === 'vi'
              ? (settings?.footerCopyrightVi || settings?.footerTextVi || `© 2026 Thầy giáo ${profile?.fullName || 'Nguyễn Trọng Huy Hoàng'}.${profile?.schoolVi && profile.schoolVi.trim() !== '' ? ` ${profile.schoolVi}.` : ''}`)
              : (settings?.footerCopyrightEn || settings?.footerTextEn || `© 2026 Teacher ${profile?.fullNameEn || profile?.fullName || 'Nguyen Trong Huy Hoang'}.${profile?.schoolEn && profile.schoolEn.trim() !== '' ? ` ${profile.schoolEn}.` : ''}`)}
          </p>
          <div className="flex items-center gap-1">
            {language === 'vi'
              ? (settings?.footerTaglineVi || 'Được tạo với ❤️ cho Giáo Dục')
              : (settings?.footerTaglineEn || 'Crafted with ❤️ for Primary Education')}
          </div>
        </div>
      </div>
    </footer>
  );
};
