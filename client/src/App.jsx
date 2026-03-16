import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useSocket } from './hooks/useSocket.js';

function App() {
  // Initialise the WebSocket connection for the logged-in user.
  // The hook handles connect, reconnect, and disconnect automatically.
  useSocket();

  return <RouterProvider router={router} />;
}

export default App;

