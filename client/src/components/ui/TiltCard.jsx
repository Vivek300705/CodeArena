import { useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '', intensity = 12, glare = true }) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    const rotX = -dy * intensity;
    const rotY = dx * intensity;

    cardRef.current.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare && glareRef.current) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.12) 0%, transparent 70%)`;
      glareRef.current.style.opacity = '1';
    }
  }, [intensity, glare]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [glare]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card relative transition-transform duration-200 ease-out ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-inherit pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{ opacity: 0 }}
        />
      )}
    </div>
  );
}
