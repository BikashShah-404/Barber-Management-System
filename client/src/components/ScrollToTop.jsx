import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Temporarily override the 'scroll-behavior: smooth' from index.css
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    
    // Jump instantly to the top
    window.scrollTo(0, 0);

    // Wait a brief moment for the new page DOM to mount and paint
    const timeout = setTimeout(() => {
      // Restore the CSS smooth scroll behavior
      document.documentElement.style.removeProperty('scroll-behavior');
      // Refresh all GSAP ScrollTriggers to recalculate positions correctly
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
