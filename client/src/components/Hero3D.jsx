import Spline from '@splinetool/react-spline';

export default function Hero3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-auto bg-[#03030a] w-full h-full">
      {/* Fallback gradient if 3D context is slow */ }
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#03030a]/90 to-[#03030a] z-0 pointer-events-none" />
      
      <div className="absolute inset-0 z-10 w-full h-full overflow-hidden opacity-60 mix-blend-screen md:opacity-80">
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      </div>
      
      {/* Overlay gradient to ensure text remains perfectly readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#03030a] via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#03030a]/50 via-transparent to-transparent z-10 pointer-events-none" />
    </div>
  );
}
