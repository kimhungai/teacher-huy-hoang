import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TeachingPage } from './pages/TeachingPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';

// Admin CMS Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminHeroPage } from './pages/admin/AdminHeroPage';
import { AdminTeachingPage } from './pages/admin/AdminTeachingPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCourseRegsPage } from './pages/admin/AdminCourseRegsPage';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage';
import { AdminResourceOrdersPage } from './pages/admin/AdminResourceOrdersPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminAchievementsPage } from './pages/admin/AdminAchievementsPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import { DB } from './services/db';
import { applyPrimaryColor } from './utils/themeUtils';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  React.useEffect(() => {
    const initThemeColor = () => {
      DB.getSiteSettings().then((s) => {
        if (s?.primaryColor) {
          applyPrimaryColor(s.primaryColor);
        }
      });
    };

    DB.initDiskSync().then(() => {
      initThemeColor();
    });

    window.addEventListener('site-settings-updated', initThemeColor);
    return () => {
      window.removeEventListener('site-settings-updated', initThemeColor);
    };
  }, []);
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Website Routes */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <HomePage />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <AboutPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/teaching"
                element={
                  <PublicLayout>
                    <TeachingPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/projects"
                element={
                  <PublicLayout>
                    <ProjectsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/projects/:slug"
                element={
                  <PublicLayout>
                    <ProjectDetailPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/courses"
                element={
                  <PublicLayout>
                    <CoursesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/courses/:slug"
                element={
                  <PublicLayout>
                    <CourseDetailPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/resources"
                element={
                  <PublicLayout>
                    <ResourcesPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/resources/:slug"
                element={
                  <PublicLayout>
                    <ResourceDetailPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/blog"
                element={
                  <PublicLayout>
                    <BlogPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <PublicLayout>
                    <BlogDetailPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/achievements"
                element={
                  <PublicLayout>
                    <AchievementsPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/gallery"
                element={
                  <PublicLayout>
                    <GalleryPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayout>
                    <ContactPage />
                  </PublicLayout>
                }
              />

              {/* Admin CMS Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin CMS Protected Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="hero" element={<AdminHeroPage />} />
                <Route path="teaching" element={<AdminTeachingPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="course-registrations" element={<AdminCourseRegsPage />} />
                <Route path="resources" element={<AdminResourcesPage />} />
                <Route path="resource-orders" element={<AdminResourceOrdersPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="achievements" element={<AdminAchievementsPage />} />
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
