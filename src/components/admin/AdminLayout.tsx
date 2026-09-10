import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Image,
  BookOpen,
  FolderKanban,
  FileText,
  Newspaper,
  Award,
  Images,
  Mail,
  HardDrive,
  Settings,
  LogOut,
  GraduationCap,
  Globe,
  UserCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { LangToggle } from '../common/LangToggle';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-400">Truy cập bị từ chối / Access Denied</h2>
          <p className="text-xs text-slate-400">
            Bạn cần đăng nhập bằng tài khoản Admin để truy cập hệ thống Quản trị Dashboard.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full py-2.5 rounded-2xl bg-sky-600 font-bold text-xs"
          >
            Đăng nhập Admin
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/profile', label: 'Hồ sơ Cá nhân / Profile', icon: User },
    { path: '/admin/hero', label: 'Hero Banner', icon: Image },
    { path: '/admin/teaching', label: 'Phương pháp dạy', icon: BookOpen },
    { path: '/admin/projects', label: 'Dự án / Projects', icon: FolderKanban },
    { path: '/admin/courses', label: 'Quản lý Khóa học', icon: GraduationCap },
    { path: '/admin/course-registrations', label: 'Đăng ký Khóa học', icon: UserCheck },
    { path: '/admin/resources', label: 'Quản lý Kho Học liệu', icon: FileText },
    { path: '/admin/resource-orders', label: 'Đăng ký Học liệu', icon: Package },
    { path: '/admin/blog', label: 'Bài viết Blog', icon: Newspaper },
    { path: '/admin/achievements', label: 'Thành tựu & Chứng chỉ', icon: Award },
    { path: '/admin/gallery', label: 'Thư viện Ảnh & Video', icon: Images },
    { path: '/admin/messages', label: 'Hộp thư Liên hệ', icon: Mail },
    { path: '/admin/media', label: 'Media Library', icon: HardDrive },
    { path: '/admin/settings', label: 'Cấu hình Website', icon: Settings }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="font-bold text-white text-sm">Admin CMS</div>
            </Link>
            <Link to="/" title="Xem trang chủ" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
              <Globe className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                    active
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <ThemeToggle />
            <LangToggle />
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 truncate">Đã đăng nhập:</div>
            <div className="text-xs font-bold text-sky-400 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col justify-between min-h-screen">
        <div className="flex-1 pb-6">
          <Outlet />
        </div>
        {/* Author Signature (Backend Only) */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/80 flex justify-end text-xs text-slate-500 dark:text-slate-400">
          <p>
            Designed & Built by{' '}
            <a
              href="https://kimhungreno.floot.app/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline transition-colors"
            >
              KimHungReno
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
