export const BLOG_CATEGORY_MAP: Record<string, { vi: string; en: string }> = {
  'Teaching Tips': { vi: 'Mẹo Giảng Dạy', en: 'Teaching Tips' },
  'English Learning Tips': { vi: 'Kinh Nghiệm Học Tiếng Anh', en: 'English Learning Tips' },
  'Classroom Management': { vi: 'Quản Lý Lớp Học', en: 'Classroom Management' },
  'Educational Technology': { vi: 'Công Nghệ Giáo Dục', en: 'Educational Technology' },
  'AI in Education': { vi: 'Ứng Dụng AI Trong Giảng Dạy', en: 'AI in Education' },
  'Lesson Ideas': { vi: 'Ý Tưởng Bài Giảng', en: 'Lesson Ideas' },
  'Teaching Experiences': { vi: 'Trải Nghiệm Thực Tế', en: 'Teaching Experiences' },
  'Student Activities': { vi: 'Hoạt Động Học Sinh', en: 'Student Activities' }
};

export const getBlogCategoryLabel = (
  categoryName: string,
  categoryEn?: string,
  language: 'vi' | 'en' = 'vi'
): string => {
  const found = BLOG_CATEGORY_MAP[categoryName];
  if (found) {
    return language === 'vi' ? found.vi : found.en;
  }
  if (language === 'en' && categoryEn && categoryEn.trim()) {
    return categoryEn;
  }
  return categoryName;
};
