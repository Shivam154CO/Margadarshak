import React, { useState, useEffect } from "react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

const getRandomFallbackImage = (): string => {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

const getCollegeImageUrl = (collegeCode: string | number, type: 'campus' | 'logo'): string => {
  if (!collegeCode || collegeCode === "N/A" || collegeCode === "undefined") return "";
  const code = String(collegeCode).trim();
  const filename = type === 'campus' ? 'campus.png' : 'logo.png';
  // Use root-relative path for Vite development, also try /src/assets and /assets fallback
  return `/src/assets/${code}/${filename}`;
};

interface CollegeImageProps {
  collegeCode: string | number;
  type: 'campus' | 'logo';
  className?: string;
  alt?: string;
  imageOverride?: string;
}

export const CollegeImage: React.FC<CollegeImageProps> = ({
  collegeCode,
  type,
  className = '',
  alt = 'College',
  imageOverride,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);

      // 1. Check for external override first
      if (imageOverride && imageOverride.trim() !== '' && !imageOverride.includes('N/A')) {
        setImageSrc(imageOverride);
        setLoading(false);
        return;
      }

      const localImageUrl = getCollegeImageUrl(collegeCode, type);
      
      if (!localImageUrl) {
        setImageSrc(type === 'logo' 
          ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
          : getRandomFallbackImage()
        );
        setError(true);
        setLoading(false);
        return;
      }

      const checkImage = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
      };

      // Try local URL
      const exists = await checkImage(localImageUrl);
      if (exists) {
        setImageSrc(localImageUrl);
        setLoading(false);
      } else {
        // Fallback for some common alternate path or format
        const altUrl = localImageUrl.replace('.png', '.jpg');
        const altExists = await checkImage(altUrl);
        if (altExists) {
          setImageSrc(altUrl);
          setLoading(false);
        } else {
          setImageSrc(type === 'logo'
            ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            : getRandomFallbackImage()
          );
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();
  }, [collegeCode, type, imageOverride]);

  if (loading) {
    return (
      <div className={`${className} bg-slate-100 animate-pulse flex items-center justify-center rounded-2xl border border-slate-200`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Scanning...</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`block transition-all duration-700 ${className} ${error && type === 'logo' ? 'rounded-full grayscale-0' : ''} ${!className.includes('object-') ? (type === 'logo' ? 'object-contain' : 'object-cover') : ''}`}
      loading="lazy"
    />
  );
};
