import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and SEO meta tags.
 * 
 * @param {Object} param0 
 * @param {string} param0.title - The title of the page
 * @param {string} param0.description - The description of the page
 * @param {boolean} param0.exact - If true, uses exact title. Otherwise, appends ' | CodeArena'
 */
export function useSEO({ title, description, exact = false }) {
  useEffect(() => {
    const defaultTitle = 'CodeArena | Real-time Coding Battles & Practice';
    const finalTitle = title ? (exact ? title : `${title} | CodeArena`) : defaultTitle;
    
    document.title = finalTitle;
    
    // Update generic meta tags
    const _updateMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) {
        el.setAttribute('content', content);
      } else {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        el.setAttribute('content', content);
        document.head.appendChild(el);
      }
    };

    _updateMeta('title', finalTitle);
    _updateMeta('og:title', finalTitle, 'property');
    _updateMeta('twitter:title', finalTitle, 'property');

    if (description) {
      _updateMeta('description', description);
      _updateMeta('og:description', description, 'property');
      _updateMeta('twitter:description', description, 'property');
    }

    // Since this is a SPA, we could also update canonical tag if needed
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    return () => {
      // Optional: don't necessarily reset on unmount to prevent flickering during fast navigation
    };
  }, [title, description, exact]);
}
