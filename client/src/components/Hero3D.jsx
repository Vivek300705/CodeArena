import { useEffect, useRef } from 'react';

/* ─── Neural Network Canvas ─────────────────────────────────────
   Animated nodes connected by glowing edges. Very subtle, never
   competes with text. Pure 2D canvas, zero Three.js overhead.
─────────────────────────────────────────────────────────────── */
function NeuralCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, nodes, animId;
    const NODE_COUNT = 55;
    const MAX_DIST = 160;
    let mouse = { x: W / 2, y: H / 2 };

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    function init() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.8,
        hue: Math.random() > 0.5 ? 190 : 260, // cyan or purple
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            const hue = (a.hue + b.hue) / 2;
            ctx.strokeStyle = `hsla(${hue},90%,70%,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        const highlight = Math.max(0, 1 - md / 200);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + highlight * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue},90%,75%,${0.35 + highlight * 0.55})`;
        ctx.fill();

        if (highlight > 0.4) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue},90%,75%,${highlight * 0.12})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}

/* ─── Gradient mesh blobs (CSS only) ── */
function GradientMesh() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Cyan nebula — top left */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '60vw', height: '60vw', maxWidth: 700, maxHeight: 700,
        background: 'radial-gradient(ellipse, rgba(0,210,240,0.12) 0%, transparent 65%)',
        filter: 'blur(60px)',
        animation: 'float 16s ease-in-out infinite',
      }} />
      {/* Purple nebula — bottom right */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600,
        background: 'radial-gradient(ellipse, rgba(120,80,250,0.11) 0%, transparent 65%)',
        filter: 'blur(70px)',
        animation: 'float 20s ease-in-out infinite reverse',
      }} />
      {/* Mid blue */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
        background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />
    </div>
  );
}

export default function Hero3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden"
      style={{ background: 'linear-gradient(155deg, #02030c 0%, #030415 40%, #020210 100%)' }}>

      {/* Gradient blobs */}
      <GradientMesh />

      {/* Neural network canvas */}
      <NeuralCanvas />

      {/* Vignette: darkens edges so content in center is readable */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 3,
        background: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 35%, rgba(2,3,12,0.65) 75%, rgba(2,3,12,0.92) 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 4,
        background: 'linear-gradient(to top, #020310 0%, rgba(2,3,16,0.7) 25%, transparent 55%)',
      }} />
    </div>
  );
}
