import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { APP_CONFIG } from "@/constants/config";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
}

/**
 * SEO Component for managing page metadata using react-helmet-async.
 * Standardizes titles and meta tags across the application.
 */
export default function SEO({
    title = `${APP_CONFIG.PLATFORM_NAME} | Engineering Admission Intelligence`,
    description = APP_CONFIG.PLATFORM_TAGLINE,
    keywords = "engineering, admission, CET, percentile, cutoff, engineering colleges, Maharashtra",
    ogImage = "/og-image.jpg"
}: SEOProps) {
    const location = useLocation();
    const siteTitle = title.includes(APP_CONFIG.PLATFORM_NAME) ? title : `${title} | ${APP_CONFIG.PLATFORM_NAME}`;
    const canonicalUrl = `${window.location.origin}${location.pathname}`;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Canonical link */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Tags */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:type" content="website" />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
}
