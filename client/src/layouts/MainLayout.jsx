import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import EmberParticles from '../components/EmberParticles.jsx';
import CustomCursor from '../components/CustomCursor.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden text-[var(--forge-white)] bg-[var(--forge-bg)]">
      <CustomCursor />
      <EmberParticles count={25} />
      <Navbar />
      
      <main className="flex-1 w-full relative z-10 pt-16 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
