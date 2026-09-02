-- ====================================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR
-- NGUYỄN TRỌNG HUY HOÀNG - DIGITAL TEACHER PORTFOLIO & TEACHING HUB
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'Nguyễn Trọng Huy Hoàng',
  full_name_en TEXT DEFAULT 'Nguyen Trong Huy Hoang',
  title_en TEXT NOT NULL DEFAULT 'English Teacher | Primary Education',
  title_vi TEXT NOT NULL DEFAULT 'Giáo viên Tiếng Anh | Giáo dục Tiểu học',
  school_en TEXT NOT NULL DEFAULT 'Duong Minh Chau Primary School',
  school_vi TEXT NOT NULL DEFAULT 'Trường Tiểu học Dương Minh Châu',
  location_en TEXT NOT NULL DEFAULT 'District 10, Ho Chi Minh City, Vietnam',
  location_vi TEXT NOT NULL DEFAULT 'Quận 10, Thành phố Hồ Chí Minh, Việt Nam',
  admin_email TEXT UNIQUE NOT NULL DEFAULT 'huynhkimhungabmthaydangtu@gmail.com',
  brand_message_en TEXT DEFAULT 'Making English fun, meaningful and memorable for every young learner.',
  brand_message_vi TEXT DEFAULT 'Biến việc học tiếng Anh thành một hành trình vui vẻ, ý nghĩa và đáng nhớ cho mỗi học sinh.',
  avatar_url TEXT,
  bio_en TEXT,
  bio_vi TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 25,
  happy_students_count INT DEFAULT 4500,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HERO SETTINGS
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline_en TEXT DEFAULT 'Inspiring Young Minds Through Creative English Learning',
  headline_vi TEXT DEFAULT 'Khơi nguồn cảm hứng học Tiếng Anh cho thế hệ trẻ qua phương pháp sáng tạo',
  subtitle_en TEXT DEFAULT 'Interactive lessons, project-based learning, and technology-enhanced education for primary students.',
  subtitle_vi TEXT DEFAULT 'Bài học tương tác, học theo dự án và ứng dụng công nghệ hiện đại cho học sinh tiểu học.',
  avatar_url TEXT,
  background_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TEACHING APPROACHES
CREATE TABLE IF NOT EXISTS public.teaching_approaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  icon TEXT DEFAULT 'Sparkles',
  image_url TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PROJECT CATEGORIES
CREATE TABLE IF NOT EXISTS public.project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_vi TEXT NOT NULL
);

-- 6. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  year TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  objectives_en TEXT[] DEFAULT '{}',
  objectives_vi TEXT[] DEFAULT '{}',
  activities_en TEXT[] DEFAULT '{}',
  activities_vi TEXT[] DEFAULT '{}',
  methods_en TEXT[] DEFAULT '{}',
  methods_vi TEXT[] DEFAULT '{}',
  outcomes_en TEXT[] DEFAULT '{}',
  outcomes_vi TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  category_name TEXT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('free', 'paid')),
  price_en TEXT NOT NULL,
  price_vi TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  duration_en TEXT NOT NULL,
  duration_vi TEXT NOT NULL,
  schedule_en TEXT NOT NULL,
  schedule_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  objectives_en TEXT[] DEFAULT '{}',
  objectives_vi TEXT[] DEFAULT '{}',
  curriculum_en TEXT[] DEFAULT '{}',
  curriculum_vi TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  video_url TEXT,
  registration_form_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. COURSE REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.course_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'enrolled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. STUDENT WORKS
CREATE TABLE IF NOT EXISTS public.student_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  student_name TEXT,
  description_en TEXT,
  description_vi TEXT,
  objective_en TEXT,
  objective_vi TEXT,
  image_url TEXT NOT NULL,
  privacy_mode TEXT CHECK (privacy_mode IN ('public', 'private', 'anonymous', 'group')) DEFAULT 'public',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. RESOURCE CATEGORIES
CREATE TABLE IF NOT EXISTS public.resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_vi TEXT NOT NULL
);

-- 11. RESOURCES
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  category_id UUID REFERENCES public.resource_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  level TEXT DEFAULT 'Beginner',
  file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'Images', 'Audio', 'Video')),
  file_url TEXT NOT NULL,
  preview_url TEXT,
  download_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. RESOURCE ORDERS
CREATE TABLE IF NOT EXISTS public.resource_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  resource_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  note TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. BLOG CATEGORIES
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_vi TEXT NOT NULL
);

-- 14. BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  excerpt_vi TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_vi TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'Nguyễn Trọng Huy Hoàng',
  reading_time_en TEXT DEFAULT '5 min read',
  reading_time_vi TEXT DEFAULT '5 phút đọc',
  status TEXT CHECK (status IN ('draft', 'published', 'scheduled')) DEFAULT 'published',
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  organization_en TEXT NOT NULL,
  organization_vi TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  certificate_url TEXT,
  description_en TEXT,
  description_vi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. GALLERY ITEMS
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  category TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'youtube')) DEFAULT 'image',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description_en TEXT,
  description_vi TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. MEDIA LIBRARY
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT DEFAULT 0,
  bucket_name TEXT DEFAULT 'media',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title_en TEXT DEFAULT 'Nguyen Trong Huy Hoang - Digital Teacher Portfolio',
  site_title_vi TEXT DEFAULT 'Nguyễn Trọng Huy Hoàng - Digital Teacher Portfolio',
  logo_text TEXT DEFAULT 'Huy Hoang English',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#0284C7',
  secondary_color TEXT DEFAULT '#0F172A',
  contact_email TEXT DEFAULT 'huynhkimhungabmthaydangtu@gmail.com',
  contact_phone TEXT DEFAULT '0987654321',
  website_url TEXT DEFAULT 'https://teacherhuyhoang.com',
  notification_email TEXT DEFAULT 'huynhkimhung2023@gmail.com',
  default_language TEXT DEFAULT 'vi',
  default_theme TEXT DEFAULT 'dark',
  facebook_url TEXT DEFAULT 'https://facebook.com',
  youtube_url TEXT DEFAULT 'https://youtube.com',
  tiktok_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT 'https://linkedin.com',
  footer_text_en TEXT DEFAULT '© 2026 Teacher Nguyen Trong Huy Hoang. All rights reserved.',
  footer_text_vi TEXT DEFAULT '© 2026 Thầy giáo Nguyễn Trọng Huy Hoàng. Giữ toàn bộ bản quyền.',
  client_admin_accounts JSONB DEFAULT '[]'::jsonb,
  enable_email_notification BOOLEAN DEFAULT TRUE,
  email_provider TEXT DEFAULT 'direct_web',
  emailjs_service_id TEXT DEFAULT '',
  emailjs_template_id_customer TEXT DEFAULT '',
  emailjs_template_id_admin TEXT DEFAULT '',
  emailjs_public_key TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES ENABLEMENT
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_approaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Hero" ON public.hero_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Teaching Approaches" ON public.teaching_approaches FOR SELECT USING (true);
CREATE POLICY "Public Read Project Categories" ON public.project_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Blog Categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Student Works" ON public.student_works FOR SELECT USING (is_published = true AND privacy_mode != 'private');
CREATE POLICY "Public Read Resource Categories" ON public.resource_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Resources" ON public.resources FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Blog Posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON public.gallery_items FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Insert Course Registrations" ON public.course_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Resource Orders" ON public.resource_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Contact Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ADMIN FULL ACCESS POLICIES
CREATE POLICY "Admin Full Access Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Admin Full Access Hero" ON public.hero_settings FOR ALL USING (true);
CREATE POLICY "Admin Full Access Teaching" ON public.teaching_approaches FOR ALL USING (true);
CREATE POLICY "Admin Full Access Project Categories" ON public.project_categories FOR ALL USING (true);
CREATE POLICY "Admin Full Access Projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Admin Full Access Blog Categories" ON public.blog_categories FOR ALL USING (true);
CREATE POLICY "Admin Full Access Courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Admin Full Access Course Registrations" ON public.course_registrations FOR ALL USING (true);
CREATE POLICY "Admin Full Access Student Works" ON public.student_works FOR ALL USING (true);
CREATE POLICY "Admin Full Access Resource Categories" ON public.resource_categories FOR ALL USING (true);
CREATE POLICY "Admin Full Access Resources" ON public.resources FOR ALL USING (true);
CREATE POLICY "Admin Full Access Resource Orders" ON public.resource_orders FOR ALL USING (true);
CREATE POLICY "Admin Full Access Blog" ON public.blog_posts FOR ALL USING (true);
CREATE POLICY "Admin Full Access Achievements" ON public.achievements FOR ALL USING (true);
CREATE POLICY "Admin Full Access Gallery" ON public.gallery_items FOR ALL USING (true);
CREATE POLICY "Admin Full Access Contact Messages" ON public.contact_messages FOR ALL USING (true);
CREATE POLICY "Admin Full Access Media" ON public.media_library FOR ALL USING (true);
CREATE POLICY "Admin Full Access Site Settings" ON public.site_settings FOR ALL USING (true);
