import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
}

export default function SEO({
    title = "SmartCF | Engineering Admission Intelligence",
    description = "Advanced engine for engineering college predictions and admission assistance in Maharashtra.",
    keywords = "engineering, admission, CET, percentile, cutoff, engineering colleges, Maharashtra",
    ogImage = "/og-image.jpg"
}: SEOProps) {
    const location = useLocation();

    useEffect(() => {
        // Update Title
        document.title = title.includes("SmartCF") ? title : `${title} | SmartCF`;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // Update Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords);

        // OpenGraph Tags
        const updateOG = (property: string, content: string) => {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        updateOG('og:title', title);
        updateOG('og:description', description);
        updateOG('og:url', window.location.href);
        updateOG('og:image', ogImage);
        updateOG('og:type', 'website');

    }, [title, description, keywords, ogImage, location]);

    return null;
}
