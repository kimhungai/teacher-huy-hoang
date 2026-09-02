function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return { h: 199, s: 89, l: 48 };

  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const applyPrimaryColor = (hexColor?: string) => {
  if (!hexColor || typeof document === 'undefined') return;
  const root = document.documentElement;

  try {
    const { h, s, l } = hexToHsl(hexColor);

    const color500 = hexColor;
    const color600 = hslToHex(h, s, Math.max(15, l - 10));
    const color700 = hslToHex(h, s, Math.max(10, l - 20));
    const color400 = hslToHex(h, s, Math.min(90, l + 10));
    const color300 = hslToHex(h, s, Math.min(95, l + 25));

    root.style.setProperty('--brand-primary', hexColor);
    root.style.setProperty('--color-sky-300', color300);
    root.style.setProperty('--color-sky-400', color400);
    root.style.setProperty('--color-sky-500', color500);
    root.style.setProperty('--color-sky-600', color600);
    root.style.setProperty('--color-sky-700', color700);
  } catch {
    root.style.setProperty('--brand-primary', hexColor);
    root.style.setProperty('--color-sky-500', hexColor);
    root.style.setProperty('--color-sky-600', hexColor);
  }
};
