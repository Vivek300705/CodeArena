import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ProblemList from '../pages/ProblemList.jsx';
import ProblemDetail from '../pages/ProblemDetail.jsx';
import SubmissionHistory from '../pages/SubmissionHistory.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'problems',
        element: <ProblemList />,
      },
      {
        path: 'problems/:id',
        element: <ProblemDetail />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'history',
            element: <SubmissionHistory />,
          }
        ]
      },
      {
        path: 'admin',
        element: <ProtectedAdminRoute />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          }
        ]
      }
    ]
  }
]);
