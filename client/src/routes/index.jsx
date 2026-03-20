import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ProblemList from '../pages/ProblemList.jsx';
import ProblemDetail from '../pages/ProblemDetail.jsx';
import SubmissionHistory from '../pages/SubmissionHistory.jsx';
import Leaderboard from '../pages/Leaderboard.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import DuelDashboard from '../pages/DuelDashboard.jsx';
import DuelArena from '../pages/DuelArena.jsx';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-black text-zinc-700 mb-4">404</h1>
      <p className="text-xl text-zinc-400 mb-8">This page doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-colors">
        Go Home
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'problems', element: <ProblemList /> },
      { path: 'problems/:id', element: <ProblemDetail /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'history', element: <SubmissionHistory /> },
        ],
      },
      {
        path: 'admin',
        element: <ProtectedAdminRoute />,
        children: [
          { index: true, element: <AdminDashboard /> },
        ],
      },
      {
        path: 'duel',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DuelDashboard /> },
          { path: ':id', element: <DuelArena /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
