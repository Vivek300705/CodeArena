import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden text-foreground bg-background">
      <Navbar />
      
      <main className="flex-1 w-full relative z-10 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
