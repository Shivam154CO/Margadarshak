import React, { useState, useEffect } from 'react';

// Function to get college image from local assets
const getCollegeImage = (collegeCode: string, type: 'logo' | 'campus' = 'campus'): string => {
  if (!collegeCode) {
    return type === 'logo' ? "/src/assets/logo.png" : "/src/assets/fallback-campus.jpg";
  }
  const fileName = type === 'logo' ? 'logo.png' : 'campus.png';
  const imagePath = `/src/assets/${collegeCode}/${fileName}`;
  return imagePath;
};

// Fallback Unsplash images
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
