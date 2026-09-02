import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DB } from '../../services/db';
import type { ContactMessage, CourseRegistration, ResourceOrder } from '../../types';
import { FolderKanban, FileText, Newspaper, GraduationCap, Images, Mail, UserCheck, Package } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [counts, setCounts] = useState({
    projects: 0,
    courses: 0,
    courseRegs: 0,
    resources: 0,
    resourceOrders: 0,
    blog: 0,
    gallery: 0,
    achievements: 0,
    messages: 0
  });

  useEffect(() => {
    document.title = 'Admin Dashboard — Huy Hoang CMS';
    Promise.all([
      DB.getProjects(),
      DB.getCourses(),
      DB.getCourseRegistrations(),
      DB.getResources(),
      DB.getResourceOrders(),
      DB.getBlogPosts(),
      DB.getGalleryItems(),
      DB.getAchievements(),
      DB.getContactMessages()
    ]).then(([p, c, cr, r, ro, b, g, a, m]) => {
      setCounts({
        projects: p.length,
        courses: c.length,
        courseRegs: cr.filter((reg: CourseRegistration) => reg.status === 'new').length,
        resources: r.length,
        resourceOrders: ro.filter((ord: ResourceOrder) => ord.status === 'new').length,
        blog: b.length,
        gallery: g.length,
        achievements: a.length,
        messages: m.filter((msg: ContactMessage) => msg.status === 'new').length
      });
    });
  }, []);

  const statsCards = [
    { title: 'Dự án (Projects)', count: counts.projects, icon: FolderKanban, color: 'text-sky-500 bg-sky-500/10', link: '/admin/projects' },
    { title: 'Các Khóa Học', count: counts.courses, icon: GraduationCap, color: 'text-emerald-500 bg-emerald-500/10', link: '/admin/courses' },
    { title: 'Đăng ký Khóa học mới', count: counts.courseRegs, icon: UserCheck, color: 'text-purple-500 bg-purple-500/10', link: '/admin/course-registrations' },
    { title: 'Kho Học liệu', count: counts.resources, icon: FileText, color: 'text-amber-500 bg-amber-500/10', link: '/admin/resources' },
    { title: 'Đăng ký Học liệu mới', count: counts.resourceOrders, icon: Package, color: 'text-indigo-500 bg-indigo-500/10', link: '/admin/resource-orders' },
    { title: 'Bài viết Blog', count: counts.blog, icon: Newspaper, color: 'text-emerald-500 bg-emerald-500/10', link: '/admin/blog' },
    { title: 'Thư viện Media', count: counts.gallery, icon: Images, color: 'text-blue-500 bg-blue-500/10', link: '/admin/gallery' },
    { title: 'Tin nhắn mới', count: counts.messages, icon: Mail, color: 'text-rose-500 bg-rose-500/10', link: '/admin/messages' }
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tổng quan số liệu và quản lý toàn bộ nội dung website Nguyễn Trọng Huy Hoàng
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((st, i) => {
          const Icon = st.icon;
          return (
            <Link
              key={i}
              to={st.link}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className={`p-4 rounded-2xl ${st.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{st.count}</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{st.title}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
