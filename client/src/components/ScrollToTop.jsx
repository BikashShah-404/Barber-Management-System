import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // 1. Tell GSAP to completely forget the previous page's scroll position!
    // This stops GSAP from forcing the window back down after it recalculates animations.
    if (typeof ScrollTrigger.clearScrollMemory === 'function') {
      ScrollTrigger.clearScrollMemory();
    }

    // 2. Disable browser's native scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 3. Jump to top instantly
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 4. Give the DOM a tiny fraction of a second to render the new page, 
    // ensure we are at the top, and tell GSAP to recalculate triggers from 0.
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh(true); // Force a hard refresh
    }, 50);

    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
