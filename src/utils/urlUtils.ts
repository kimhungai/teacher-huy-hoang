/**
 * Sanitizes and normalizes media image/video URLs.
 * Handles missing protocol, typos like "ttps://", and encodes spaces in file paths.
 */
export function sanitizeMediaUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';

  // Fix common typos in protocol
  if (url.startsWith('ttps://')) {
    url = 'https://' + url.slice(7);
  } else if (url.startsWith('ttp://')) {
    url = 'http://' + url.slice(6);
  } else if (url.startsWith('tps://')) {
    url = 'https://' + url.slice(6);
  } else if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//') && !url.startsWith('data:')) {
    url = 'https://' + url;
  }

  // Encode unescaped spaces in image URLs
  try {
    if (url.includes(' ')) {
      url = encodeURI(url);
    }
  } catch (e) {
    // ignore encoding error
  }

  return url;
}
