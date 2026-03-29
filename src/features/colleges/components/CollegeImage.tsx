import React, { useState, useEffect } from 'react';

// Function to get college image from local assets
const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "/src/assets/fallback-campus.jpg";
  }
  const imagePath = `/src/assets/${collegeCode}/campus.png`;
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
  className?: string;
  alt?: string;
}

export const CollegeImage: React.FC<CollegeImageProps> = ({ 
  collegeCode, 
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
      try {
        const localImageUrl = getCollegeImage(collegeCode);
        const img = new Image();
        img.onload = () => {
          setImageSrc(localImageUrl);
          setLoading(false);
        };
        img.onerror = () => {
          setImageSrc(getRandomFallbackImage());
          setError(true);
          setLoading(false);
        };
        img.src = localImageUrl;
      } catch (err) {
        setImageSrc(getRandomFallbackImage());
        setError(true);
        setLoading(false);
      }
    };
    loadImage();
  }, [collegeCode]);

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
      className={`${className} ${error ? "grayscale opacity-75" : ""}`}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = getRandomFallbackImage();
      }}
    />
  );
};
