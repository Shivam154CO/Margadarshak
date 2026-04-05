import React, { useState, useEffect } from 'react';

// Use Vite's glob import to get all college images (mapping of path -> url)
const campusImages = import.meta.glob("../../../assets/*/campus.png", {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const logoImages = import.meta.glob("../../../assets/*/logo.png", {
  eager: true,
  import: 'default'
}) as Record<string, string>;

// Pre-map college logos to their asset URLs for O(1) lookup and robust path handling
const collegeLogoMap = Object.entries(logoImages).reduce((acc, [path, url]) => {
  const parts = path.split(/[/\\]/);
  const code = parts[parts.length - 2]; 
  if (code && code !== 'assets') {
    acc[code] = url as string;
  }
  return acc;
}, {} as Record<string, string>);

// Pre-map college campus images to their asset URLs
const collegeCampusMap = Object.entries(campusImages).reduce((acc, [path, url]) => {
  const parts = path.split(/[/\\]/);
  const code = parts[parts.length - 2]; 
  if (code && code !== 'assets') {
    acc[code] = url as string;
  }
  return acc;
}, {} as Record<string, string>);

// Function to get college image from local assets — now using pre-mapped dictionaries
const getCollegeImage = (collegeCode: string, type: 'logo' | 'campus' = 'campus'): string => {
  if (!collegeCode) return "";
  const code = String(collegeCode).trim();
  return type === 'logo' ? collegeLogoMap[code] || "" : collegeCampusMap[code] || "";
};

// Fallback Unsplash images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

const getRandomFallbackImage = (): string => {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

interface CollegeImageProps {
  collegeCode: string;
  type?: 'logo' | 'campus';
  imageOverride?: string;
  className?: string;
  alt?: string;
}

export const CollegeImage: React.FC<CollegeImageProps> = ({
  collegeCode,
  type = 'campus',
  imageOverride,
  className = "",
  alt = "College campus"
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);

      const localImageUrl = getCollegeImage(collegeCode, type);
      const logoFallback = "https://placehold.co/400x400/indigo/white?text=LOGO";
      const campusFallback = getRandomFallbackImage();

      const tryLoad = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          if (!url) {
            resolve(false);
            return;
          }
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
      };

      // Priority 1: Local Asset (usually more reliable for specific types)
      if (collegeCode) {
        const localSuccess = await tryLoad(localImageUrl);
        if (localSuccess) {
          setImageSrc(localImageUrl);
          setLoading(false);
          return;
        }
      }

      // Priority 2: Database Override
      if (imageOverride) {
        const overrideSuccess = await tryLoad(imageOverride);
        if (overrideSuccess) {
          setImageSrc(imageOverride);
          setLoading(false);
          return;
        }
      }

      // Priority 3: Fallbacks
      setImageSrc(type === 'logo' ? logoFallback : campusFallback);
      setError(true);
      setLoading(false);
    };
    loadImage();
  }, [collegeCode, type, imageOverride]);

  if (loading) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center`}
      >
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${error && type === 'campus' ? "grayscale opacity-75" : ""}`}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = type === 'logo' ? "/src/assets/logo.png" : getRandomFallbackImage();
      }}
    />
  );
};
