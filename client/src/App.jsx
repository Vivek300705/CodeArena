import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket.js';
import Chatbot from './components/Chatbot';
import { useAuthStore } from './store/useAuthStore.js';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Initialise the WebSocket connection for the logged-in user.
  // The hook handles connect, reconnect, and disconnect automatically.
  useSocket();

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0B0E14',
            color: '#E8EFF5',
            border: '1px solid rgba(255,107,53,0.3)',
            boxShadow: '0 0 15px rgba(255,107,53,0.1)',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          },
          success: {
            iconTheme: { primary: '#00D97E', secondary: '#0B0E14' },
            style: { borderColor: 'rgba(0,217,126,0.3)' }
          },
          error: {
            iconTheme: { primary: '#FF4757', secondary: '#0B0E14' },
            style: { borderColor: 'rgba(255,71,87,0.3)' }
          }
        }}
      />
      <RouterProvider router={router} />
      {isAuthenticated && <Chatbot />}
    </>
  );
}

export default App;

