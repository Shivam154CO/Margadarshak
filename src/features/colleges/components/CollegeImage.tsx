import React from 'react';
import { CollegeCardImage } from './CollegeCardImage';

interface CollegeImageProps {
  collegeCode: string;
  type?: 'logo' | 'campus';
  imageOverride?: string;
  className?: string;
  alt?: string;
}

/**
 * Robust College Image component that handles local assets (globbed), 
 * external overrides, and smart fallbacks.
 * Now unified with CollegeCardImage for consistent behavior.
 */
export const CollegeImage: React.FC<CollegeImageProps> = ({
  collegeCode,
  type = 'campus',
  imageOverride,
  className = "",
  alt = "College campus"
}) => {
  return (
    <CollegeCardImage
      collegeCode={collegeCode}
      src={imageOverride}
      type={type}
      className={className}
      alt={alt}
      // Since this is used in headers/sections, we might want it to load faster
      loading="eager"
    />
  );
};

