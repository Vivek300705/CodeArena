import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const trailRef = useRef({ x: -100, y: -100 });
  const requestRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const updateTrail = () => {
    trailRef.current.x += (mousePos.x - trailRef.current.x) * 0.15;
    trailRef.current.y += (mousePos.y - trailRef.current.y) * 0.15;
    
    const trailEl = document.getElementById('cursor-trail');
    if (trailEl) {
      trailEl.style.transform = `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0)`;
    }
    requestRef.current = requestAnimationFrame(updateTrail);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePos]);

  return (
    <>
      <div 
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }}
      >
        <div className="relative -left-2 -top-2 w-4 h-4 flex items-center justify-center">
          <div className="absolute w-full h-[2px] bg-[var(--forge-ember)]" />
          <div className="absolute h-full w-[2px] bg-[var(--forge-ember)]" />
        </div>
      </div>
      <div 
        id="cursor-trail"
        className="fixed top-0 left-0 pointer-events-none z-[9998] hidden md:block"
      >
        <div className="relative -left-1 -top-1 w-2 h-2 rounded-full bg-[var(--forge-ember)] opacity-60 blur-[1px]" />
      </div>
    </>
  );
};

export default CustomCursor;
