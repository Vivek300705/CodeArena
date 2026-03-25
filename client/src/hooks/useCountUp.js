import { useState, useEffect, useRef } from 'react';

export function useCountUp(endValue, durationMs = 2000) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!elementRef.current || hasAnimated) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setHasAnimated(true);
        let startTimestamp = null;
        
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
          // easeOutQuart
          const easeOut = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeOut * endValue));
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setCount(endValue);
          }
        };
        
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [endValue, durationMs, hasAnimated]);

  return { count, elementRef };
}
