import { useState, useCallback, useMemo } from 'react';

// Use Vite's glob import to get all college images (mapping of path -> url)
const campusImages = import.meta.glob("../../../assets/*/campus.png", {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const logoImages = import.meta.glob("../../../assets/*/logo.png", {
  eager: true,
  import: 'default'
}) as Record<string, string>;

// Pre-map college campus images for O(1) lookup
const collegeCampusMap = Object.entries(campusImages).reduce((acc, [path, url]) => {
  const parts = path.split(/[/\\]/);
  const code = parts[parts.length - 2]; 
  if (code && code !== 'assets') {
    acc[code] = url as string;
  }
  return acc;
}, {} as Record<string, string>);

// Pre-map college logos for O(1) lookup
const collegeLogoMap = Object.entries(logoImages).reduce((acc, [path, url]) => {
  const parts = path.split(/[/\\]/);
  const code = parts[parts.length - 2]; 
  if (code && code !== 'assets') {
    acc[code] = url as string;
  }
  return acc;
}, {} as Record<string, string>);

// Ordered list of deterministic fallbacks (no Math.random — prevents React flicker)
const FALLBACKS = [
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=800&q=80',
];

function buildSrcSet(src: string, widths: number[], quality = 90): string {
  if (!src) return '';

  // Supabase Storage URL — has built-in image transformation API
  if (src.includes('.supabase.co/storage/v1/object/public/')) {
    const renderBase = src.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    return widths
      .map(w => `${renderBase}?width=${w}&quality=${quality} ${w}w`)
      .join(', ');
  }

  // Unsplash URLs — support transformation via query params
  if (src.includes('images.unsplash.com')) {
    const base = src.split('?')[0];
    return widths
      .map(w => `${base}?auto=format&fit=crop&w=${w}&q=${quality} ${w}w`)
      .join(', ');
  }

  // All other URLs (local assets, external) — single src
  return `${src} 1x`;
}

interface CollegeCardImageProps {
  /** URL of the college image (Supabase Storage, Unsplash, or local path) */
  src?: string;
  /** College code to look up local asset */
  collegeCode?: string;
  /** Image type: campus (hero/card) or logo */
  type?: 'campus' | 'logo';
  /** Alt text */
  alt?: string;
  /** CSS classes to apply to the <img> element */
  className?: string;
  /** Index used for deterministic fallback selection (no random flicker) */
  fallbackIndex?: number;
  /** Sizes hint for browser — how wide this image will be rendered */
  sizes?: string;
  /** loading strategy: 'lazy' for off-screen cards, 'eager' for first visible */
  loading?: 'lazy' | 'eager';
}

export function CollegeCardImage({
  src,
  collegeCode,
  type = 'campus',
  alt = 'College campus',
  className = '',
  fallbackIndex = 0,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy',
}: CollegeCardImageProps) {
  // Determine the primary source: Local globbed path or passed src
  const initialSrc = useMemo(() => {
    // 1. Check local assets if collegeCode is provided
    if (collegeCode) {
      const code = String(collegeCode).trim();
      const localUrl = type === 'campus' ? collegeCampusMap[code] : collegeLogoMap[code];
      if (localUrl) return localUrl;
    }
    
    // 2. Fallback to passed src
    if (src) return src;
    
    // 3. Fallback to deterministic placeholder
    if (type === 'logo') return "https://placehold.co/400x400/indigo/white?text=LOGO";
    return FALLBACKS[fallbackIndex % FALLBACKS.length];
  }, [src, collegeCode, type, fallbackIndex]);

  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Responsive srcset — quality 90, widths: 400 / 700 / 1000 / 1400
  const srcSet = useMemo(() => 
    !errored ? buildSrcSet(imgSrc, [400, 700, 1000, 1400], 90) : undefined
  , [imgSrc, errored]);

  const handleError = useCallback(() => {
    // If the primary image failed (local or src), fall back to Unsplash or Logo Placeholder
    const fallback = type === 'logo' 
      ? "https://placehold.co/400x400/indigo/white?text=LOGO" 
      : FALLBACKS[fallbackIndex % FALLBACKS.length];
      
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
      setErrored(true);
    }
  }, [imgSrc, fallbackIndex, type]);


  return (
    <>
      {/* Static placeholder shown while image loads */}
      {!loaded && (
        <div
          className={`${className} absolute inset-0 bg-slate-100 flex items-center justify-center`}
          aria-hidden="true"
        >
          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imgSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  );
}

export default CollegeCardImage;

