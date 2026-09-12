import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://rfzvtgmhqlbaxlyemwxt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmenZ0Z21ocWxiYXhseWVtd3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTM0MDYsImV4cCI6MjEwMzg4OTQwNn0.Tr8emeA9DpU6JDgKJNdRHnEhi5V1iWu_g5Is_2WmI7o';

function getFirstSentence(text) {
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

export default async function handler(req, res) {
  let html = '';
  try {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      html = fs.readFileSync(indexPath, 'utf8');
    } else {
      const rootIndexPath = path.join(process.cwd(), 'index.html');
      html = fs.readFileSync(rootIndexPath, 'utf8');
    }
  } catch (err) {
    console.error('Error reading index.html:', err);
    return res.status(500).send('Internal Server Error');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&order=updated_at.desc&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const p = data[0];
        const rawName = p.full_name?.trim() || 'Nguyễn Trọng Huy Hoàng';
        const teacherName = rawName.startsWith('Thầy') ? rawName : `Thầy ${rawName}`;
        const titleEn = p.title_en?.trim() || 'Primary English Teacher & EdTech';
        const titleVi = p.title_vi?.trim() || 'Giáo viên Tiếng Anh | Giáo dục Tiểu học';
        const cleanTitleVi = titleVi.replace(/[-.]$/, '').trim();
        const firstBioSentence = getFirstSentence(p.bio_vi) || 'Với hơn 25 năm kinh nghiệm giảng dạy tiếng Anh tiểu học tại TP.HCM, tôi chuyên sâu về phương pháp Học theo dự án (PBL), học qua trò chơi và ứng dụng công nghệ giáo dục EdTech trong nhà trường.';
        
        let avatarUrl = p.avatar_url?.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2';
        if (avatarUrl.includes('unsplash.com') && !avatarUrl.includes('fm=jpg')) {
          avatarUrl += (avatarUrl.includes('?') ? '&' : '?') + 'fm=jpg';
        }

        const seoTitle = `${teacherName} — ${titleEn}`;
        const seoDesc = `Website chính thức của ${teacherName} - ${cleanTitleVi} - ${firstBioSentence}`;

        const escapeHtml = (str) => str.replace(/"/g, '&quot;');

        html = html
          .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(seoTitle)}</title>`)
          .replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${escapeHtml(seoTitle)}" />`)
          .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(seoDesc)}" />`)
          .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(seoTitle)}" />`)
          .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(seoDesc)}" />`)
          .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${escapeHtml(avatarUrl)}" />`)
          .replace(/<meta property="og:image:secure_url" content=".*?" \/>/, `<meta property="og:image:secure_url" content="${escapeHtml(avatarUrl)}" />`)
          .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(seoTitle)}" />`)
          .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(seoDesc)}" />`)
          .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${escapeHtml(avatarUrl)}" />`);
      }
    }
  } catch (err) {
    console.error('Error fetching profile from Supabase in api/index.js:', err);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
  return res.status(200).send(html);
}
