/**
 
 *   - Mobile (320-640px): downloads ~80px-wide card image
 *   - Tablet (640-1024px): downloads ~180px image  
 *   - Desktop (1024px+): downloads ~300px image
 */

import { useState, useCallback } from 'react';

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

  // All other URLs (local assets, external) — single src, browser sizes hint handles layout
  return `${src} 1x`;
}

interface CollegeCardImageProps {
  /** URL of the college image (Supabase Storage, Unsplash, or local path) */
  src: string;
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
  alt = 'College campus',
  className = '',
  fallbackIndex = 0,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy',
}: CollegeCardImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACKS[fallbackIndex % FALLBACKS.length]);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Responsive srcset — quality 90, widths: 400 / 700 / 1000 / 1400
  const srcSet = !errored ? buildSrcSet(imgSrc, [400, 700, 1000, 1400], 90) : undefined;

  const handleError = useCallback(() => {
    const fallback = FALLBACKS[fallbackIndex % FALLBACKS.length];
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
      setErrored(true);
    }
  }, [imgSrc, fallbackIndex]);

  return (
    <>
      {/* Static placeholder shown while image loads */}
      {!loaded && (
        <div
          className={`${className} absolute inset-0 bg-slate-100 flex items-center justify-center`}
          aria-hidden="true"
        />
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
