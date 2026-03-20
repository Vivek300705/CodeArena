import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the document title.
 * Automatically appends ' | CodeArena' to the title unless specified.
 * 
 * @param {string} title - The specific title for the current page
 * @param {boolean} exact - If true, uses the exact title provided without appending the site name
 */
export function useDocumentTitle(title, exact = false) {
  useEffect(() => {
    const defaultTitle = 'CodeArena | Real-time Coding Battles & Practice';
    
    if (!title) {
      document.title = defaultTitle;
    } else {
      document.title = exact ? title : `${title} | CodeArena`;
    }

    // Optional: Reset title when component unmounts
    return () => {
      document.title = defaultTitle;
    };
  }, [title, exact]);
}
