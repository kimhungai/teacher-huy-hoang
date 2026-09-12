export type Language = 'en' | 'vi';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface EducationItem {
  id?: string;
  titleVi: string;
  titleEn: string;
  detailVi: string;
  detailEn: string;
}

export interface Profile {
  id: string;
  fullName: string;
  fullNameEn?: string;
  titleEn: string;
  titleVi: string;
  schoolEn: string;
  schoolVi: string;
  locationEn: string;
  locationVi: string;
  adminEmail: string;
  phone?: string;
  brandMessageEn: string;
  brandMessageVi: string;
  avatarUrl: string;
  bioEn: string;
  bioVi: string;
  skills: string[];
  philosophyTextVi?: string;
  philosophyTextEn?: string;
  educationHistory?: EducationItem[];
  experienceYears: number;
  completedProjectsCount?: number;
  teachingResourcesCount?: number;
  happyStudentsCount?: number;
}

export interface HeroSettings {
  headlineEn: string;
  headlineVi: string;
  subtitleEn: string;
  subtitleVi: string;
  avatarUrl: string;
  backgroundUrl: string;
}

export interface TeachingApproach {
  id: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  icon: string;
  imageUrl: string;
  orderIndex: number;
}

export interface Project {
  id: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  categoryName: string;
  categoryEn?: string;
  grade: string;
  gradeEn?: string;
  year: string;
  descriptionEn: string;
  descriptionVi: string;
  objectivesEn: string[];
  objectivesVi: string[];
  activitiesEn: string[];
  activitiesVi: string[];
  methodsEn: string[];
  methodsVi: string[];
  outcomesEn: string[];
  outcomesVi: string[];
  thumbnailUrl: string;
  galleryUrls: string[];
  videoUrl?: string;
  attachments?: { name: string; url: string; type: string }[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  orderIndex?: number;
  createdAt: string;
}

export interface Course {
  id: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  categoryName: string;
  categoryEn?: string;
  priceType: 'free' | 'paid';
  priceEn: string;
  priceVi: string;
  discountPriceEn?: string;
  discountPriceVi?: string;
  gradeLevel: string;
  gradeLevelEn?: string;
  durationEn: string;
  durationVi: string;
  scheduleEn: string;
  scheduleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  objectivesEn: string[];
  objectivesVi: string[];
  curriculumEn: string[];
  curriculumVi: string[];
  thumbnailUrl: string;
  galleryUrls?: string[];
  videoUrl?: string;
  registrationFormUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  orderIndex?: number;
  createdAt: string;
}

export interface CourseRegistration {
  id: string;
  courseId: string;
  courseTitle: string;
  fullName: string;
  phone: string;
  email: string;
  gradeLevel: string;
  note?: string;
  coursePrice?: string;
  discountPrice?: string;
  status: 'new' | 'confirmed' | 'enrolled' | 'cancelled';
  createdAt: string;
}

export interface StudentWork {
  id: string;
  titleEn: string;
  titleVi: string;
  category: string;
  grade: string;
  studentName?: string;
  descriptionEn: string;
  descriptionVi: string;
  privacyMode: 'public' | 'private' | 'anonymous' | 'group';
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  imageUrl?: string;
  objectiveEn?: string;
  objectiveVi?: string;
  isPublished?: boolean;
  createdAt: string;
}

export interface TeachingResource {
  id: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  categoryName: string;
  categoryEn?: string;
  resourceType: 'book' | 'software' | 'digital_file' | 'teaching_tool' | 'audio_visual';
  priceType: 'free' | 'paid';
  priceEn: string;
  priceVi: string;
  discountPriceEn?: string;
  discountPriceVi?: string;
  grade: string;
  gradeEn?: string;
  fileType: string;
  fileTypeEn?: string;
  fileUrl?: string;
  previewUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
  downloadCount: number;
  specificationsEn?: string[];
  specificationsVi?: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  orderIndex?: number;
  createdAt: string;
}

export interface ResourceOrder {
  id: string;
  resourceId: string;
  resourceTitle: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  note?: string;
  resourcePrice?: string;
  discountPrice?: string;
  status: 'new' | 'confirmed' | 'sent' | 'cancelled';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  excerptEn: string;
  excerptVi: string;
  contentEn: string;
  contentVi: string;
  featuredImage: string;
  galleryUrls?: string[];
  videoUrl?: string;
  categoryName: string;
  categoryEn?: string;
  tags: string[];
  author: string;
  readingTimeEn: string;
  readingTimeVi: string;
  status: 'draft' | 'published' | 'unpublished' | 'scheduled';
  scheduledDate?: string;
  isFeatured: boolean;
  orderIndex?: number;
  publishedAt: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  titleEn: string;
  titleVi: string;
  organizationEn: string;
  organizationVi: string;
  date: string;
  category: string;
  categoryEn?: string;
  certificateUrl?: string;
  galleryUrls?: string[];
  descriptionEn: string;
  descriptionVi: string;
  orderIndex?: number;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleVi: string;
  category: string;
  categoryEn?: string;
  mediaType: 'image' | 'video' | 'youtube';
  mediaUrl: string;
  galleryUrls?: string[];
  thumbnailUrl?: string;
  descriptionEn?: string;
  descriptionVi?: string;
  isPublished: boolean;
  orderIndex?: number;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  isStarred?: boolean;
  replyNote?: string;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  password: string;
  name?: string;
  role: 'client_admin';
  createdAt: string;
}

export interface SiteSettings {
  siteTitleEn: string;
  siteTitleVi: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  notificationEmail?: string;
  defaultLanguage: Language;
  defaultTheme?: 'light' | 'dark';
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  zaloUrl?: string;
  footerTextEn: string;
  footerTextVi: string;
  footerCopyrightEn?: string;
  footerCopyrightVi?: string;
  footerTaglineEn?: string;
  footerTaglineVi?: string;
  customFooterHtml?: string;
  showBlogMenu?: boolean;
  showGalleryMenu?: boolean;
  showProjectsMenu?: boolean;
  showAchievementsMenu?: boolean;
  adminPassword?: string;
  superAdminPassword?: string;
  clientAdminAccounts?: AdminAccount[];
  enableEmailNotification?: boolean;
  emailProvider?: 'direct_web' | 'emailjs' | 'custom_api' | 'simulation';
  emailjsServiceId?: string;
  emailjsTemplateIdCustomer?: string;
  emailjsTemplateIdAdmin?: string;
  emailjsPublicKey?: string;
  customEmailEndpoint?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountHolder?: string;
  bankCode?: string;
}
