/**
 * Utility to dynamically inject & update SEO meta tags, OpenGraph, Twitter Cards, Canonical links, and JSON-LD Schemas.
 */

export interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'course';
  lang?: 'vi' | 'en';
  breadcrumbs?: Array<{ name: string; item: string }>;
  schema?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Extracts the 1st sentence of a text string (e.g. bioVi)
 */
export function getFirstSentence(text?: string): string {
  if (!text) return '';
  const clean = text.trim().replace(/\s+/g, ' ');
  const sentences = clean.split(/(?<=[.!?])\s+/);
  if (sentences.length > 0) {
    let first = sentences[0];
    if (sentences.length > 1 && (first.endsWith('TP.HCM') || first.endsWith('TP.HCM.'))) {
      first = first.trim();
      if (!first.endsWith('.')) first += '.';
      first = first + ' ' + sentences[1];
    }
    return first.trim();
  }
  return clean;
}

/**
 * Requirement 2: Title format = "Họ và tên (Tiếng Việt)" + " — " + "Chức danh (Tiếng Anh)"
 */
export function buildSocialPreviewTitle(profile?: any): string {
  const rawName = profile?.fullName?.trim() || 'Nguyễn Trọng Huy Hoàng';
  const teacherName = rawName.startsWith('Thầy') ? rawName : `Thầy ${rawName}`;
  const titleEn = profile?.titleEn?.trim() || 'Primary English Teacher & EdTech';
  return `${teacherName} — ${titleEn}`;
}

/**
 * Requirement 3: Description format = "Website chính thức của" + "Họ và tên (Tiếng Việt)" + "Chức danh (Tiếng Việt)" + " - " + 1 câu đầu tiên của "Nội Dung Tiểu Sử (Tiếng Việt)"
 */
export function buildSocialPreviewDescription(profile?: any): string {
  const rawName = profile?.fullName?.trim() || 'Nguyễn Trọng Huy Hoàng';
  const teacherName = rawName.startsWith('Thầy') ? rawName : `Thầy ${rawName}`;
  const titleVi = profile?.titleVi?.trim() || 'Giáo viên Tiếng Anh Trường Tiểu học Dương Minh Châu, Quận 10';
  const cleanTitleVi = titleVi.replace(/[-.]$/, '').trim();
  const firstBioSentence = getFirstSentence(profile?.bioVi) || 'Với hơn 25 năm kinh nghiệm giảng dạy tiếng Anh tiểu học tại TP.HCM, tôi chuyên sâu về phương pháp Học theo dự án (PBL), học qua trò chơi và ứng dụng công nghệ giáo dục EdTech trong nhà trường.';
  
  return `Website chính thức của ${teacherName} - ${cleanTitleVi} - ${firstBioSentence}`;
}

export function updateSEOMetaTags({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  lang = 'vi',
  breadcrumbs,
  schema
}: SEOProps) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 0. Update <html> lang attribute
  document.documentElement.setAttribute('lang', lang);

  const currentDomain = window.location.origin;
  const canonicalUrl = url ? (url.startsWith('http') ? url : `${currentDomain}${url}`) : window.location.href;
  const defaultMetaImage = 'https://ik.imagekit.io/hkh/OK_0.jpg?updatedAt=1787823395930';
  const metaImage = image ? (image.startsWith('http') ? image : `${currentDomain}${image}`) : defaultMetaImage;

  // 1. Update Document Title
  const siteSuffix = lang === 'vi' ? 'Thầy Nguyễn Trọng Huy Hoàng' : 'Teacher Nguyen Trong Huy Hoang';
  document.title = title.includes(siteSuffix) ? title : `${title} — ${siteSuffix}`;

  // Helper to set or create meta tag
  const setMetaTag = (attribute: string, key: string, content: string) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Helper to set link tag
  const setLinkTag = (rel: string, href: string, hreflang?: string) => {
    if (!href) return;
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      if (hreflang) element.setAttribute('hreflang', hreflang);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', description || (lang === 'vi' 
    ? 'Website chính thức của Thầy Nguyễn Trọng Huy Hoàng - Giáo viên Tiếng Anh Tiểu học trường TH Dương Minh Châu, Quận 10. Chuyên cung cấp khóa học Tiếng Anh trẻ em, giáo cụ & học liệu số EdTech.' 
    : 'Official website of Teacher Nguyen Trong Huy Hoang - Primary English Teacher at Duong Minh Chau School. Offering young learner courses, EdTech teaching resources & digital learning materials.'));

  setMetaTag('name', 'keywords', keywords || (lang === 'vi'
    ? 'Thầy Nguyễn Trọng Huy Hoàng, Tiếng Anh tiểu học, Dương Minh Châu Quận 10, Giáo cụ tiếng Anh, Học liệu số, Khóa học Anh văn trẻ em, Phonics, Gamification'
    : 'Teacher Nguyen Trong Huy Hoang, Primary English Teacher, Duong Minh Chau School, English Teaching Resources, EdTech, Young Learners English, Phonics, Gamification'));

  setMetaTag('name', 'author', 'Nguyễn Trọng Huy Hoàng');
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. Canonical & Hreflang Tags for Multilingual SEO
  setLinkTag('canonical', canonicalUrl);
  setLinkTag('alternate', canonicalUrl, 'vi-VN');
  setLinkTag('alternate', canonicalUrl, 'en-US');
  setLinkTag('alternate', canonicalUrl, 'x-default');

  // 4. OpenGraph Tags for Zalo, Facebook, Messenger, LinkedIn, Telegram Rich Previews
  setMetaTag('property', 'og:site_name', lang === 'vi' ? 'Thầy Nguyễn Trọng Huy Hoàng - Tiếng Anh Tiểu Học' : 'Teacher Nguyen Trong Huy Hoang - Primary English');
  setMetaTag('property', 'og:title', document.title);
  setMetaTag('property', 'og:description', description || document.title);
  setMetaTag('property', 'og:type', type);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', metaImage);
  setMetaTag('property', 'og:image:secure_url', metaImage);
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');
  setMetaTag('property', 'og:image:alt', title);
  setMetaTag('property', 'og:image:type', metaImage.endsWith('.png') ? 'image/png' : 'image/jpeg');
  setMetaTag('property', 'og:locale', lang === 'vi' ? 'vi_VN' : 'en_US');

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', document.title);
  setMetaTag('name', 'twitter:description', description || document.title);
  setMetaTag('name', 'twitter:image', metaImage);

  // 6. JSON-LD Structured Data Schema for Google Rich Snippets
  let schemaScript = document.querySelector('script[id="json-ld-schema"]') as HTMLScriptElement;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'json-ld-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  // Base Person / Teacher Schema
  const defaultPersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'Nguyễn Trọng Huy Hoàng',
    'alternateName': 'Nguyen Trong Huy Hoang',
    'jobTitle': lang === 'vi' ? 'Giáo viên Tiếng Anh Tiểu học' : 'Primary English Teacher',
    'worksFor': {
      '@type': 'EducationalOrganization',
      'name': lang === 'vi' ? 'Trường Tiểu học Dương Minh Châu' : 'Duong Minh Chau Primary School',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Quận 10',
        'addressRegion': 'TP. Hồ Chí Minh',
        'addressCountry': 'VN'
      }
    },
    'url': currentDomain,
    'sameAs': [
      'https://zalo.me/0987654321'
    ]
  };

  // Base WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': lang === 'vi' ? 'Thầy Nguyễn Trọng Huy Hoàng - Tiếng Anh Tiểu Học' : 'Teacher Nguyen Trong Huy Hoang - Primary English',
    'url': currentDomain
  };

  const schemasToInclude: any[] = [defaultPersonSchema, websiteSchema];

  // Optional BreadcrumbList Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((bc, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': bc.name,
        'item': bc.item.startsWith('http') ? bc.item : `${currentDomain}${bc.item}`
      }))
    };
    schemasToInclude.push(breadcrumbSchema);
  }

  if (schema) {
    if (Array.isArray(schema)) {
      schemasToInclude.push(...schema);
    } else {
      schemasToInclude.push(schema);
    }
  }

  schemaScript.text = JSON.stringify(schemasToInclude);
}
