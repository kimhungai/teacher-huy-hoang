import React, { useEffect, useState } from 'react';
import { DB } from '../services/db';
import type { HeroSettings, Profile, Project, TeachingResource, BlogPost, Course, SiteSettings } from '../types';
import { HeroSection } from '../components/home/HeroSection';
import { QuickStats } from '../components/home/QuickStats';
import { PhilosophySection } from '../components/home/PhilosophySection';
import { FeaturedProjects } from '../components/home/FeaturedProjects';
import { FeaturedCourses } from '../components/home/FeaturedCourses';
import { FeaturedResources } from '../components/home/FeaturedResources';
import { LatestBlog } from '../components/home/LatestBlog';
import { CtaSection } from '../components/home/CtaSection';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

import { SEO } from '../components/common/SEO';
import { buildSocialPreviewTitle, buildSocialPreviewDescription } from '../utils/seoUtils';

export const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const [hero, setHero] = useState<HeroSettings | null>(() => {
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<TeachingResource[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    Promise.all([
      DB.getHeroSettings(),
      DB.getProfile(),
      DB.getSiteSettings(),
      DB.getProjects(),
      DB.getCourses(),
      DB.getResources(),
      DB.getBlogPosts()
    ]).then(([heroRes, profileRes, settingsRes, projRes, courseRes, resRes, blogRes]) => {
      setHero(heroRes);
      setProfile(profileRes);
      setSettings(settingsRes);
      setProjects(projRes);
      setCourses(courseRes);
      setResources(resRes);
      setPosts(blogRes);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('profile-updated', loadData);
    window.addEventListener('hero-updated', loadData);
    window.addEventListener('site-settings-updated', loadData);
    return () => {
      window.removeEventListener('profile-updated', loadData);
      window.removeEventListener('hero-updated', loadData);
      window.removeEventListener('site-settings-updated', loadData);
    };
  }, []);

  if (loading || !hero || !profile || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <LoadingSkeleton count={3} />
        </div>
      </div>
    );
  }

  const seoTitle = buildSocialPreviewTitle(profile);
  const seoDesc = buildSocialPreviewDescription(profile);

  return (
    <div className="space-y-12 sm:space-y-16">
      <SEO
        title={seoTitle}
        description={seoDesc}
        url="/"
        lang={language as 'vi' | 'en'}
        image={profile?.avatarUrl}
        keywords={language === 'vi' 
          ? 'Thầy Nguyễn Trọng Huy Hoàng, Tiếng Anh Tiểu học, Dương Minh Châu Quận 10, EdTech, Gamification Tiếng Anh, Khóa học Anh văn trẻ em'
          : 'Teacher Nguyen Trong Huy Hoang, Primary English Teacher, Duong Minh Chau School, EdTech, Gamification, Young Learners English'}
        schema={{
          '@type': 'Teacher',
          'name': profile.fullName || 'Nguyễn Trọng Huy Hoàng',
          'description': seoDesc,
          'worksFor': profile.schoolVi || 'Trường Tiểu học Dương Minh Châu'
        }}
      />
      <HeroSection hero={hero} profile={profile} />
      <QuickStats profile={profile} />
      <PhilosophySection />
      {settings?.showProjectsMenu !== false && <FeaturedProjects projects={projects} />}
      <FeaturedCourses courses={courses} />
      <FeaturedResources resources={resources} />
      {settings?.showBlogMenu !== false && <LatestBlog posts={posts} />}
      <CtaSection />
    </div>
  );
};
