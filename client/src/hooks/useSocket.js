import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService.js';
import { useAuthStore } from '../store/useAuthStore.js';

/**
 * useSocket — App-wide hook that manages the Socket.IO lifecycle.
 *
 * - Connects when the user logs in (userId becomes available)
 * - Reconnects automatically via socketService (infinite retries)
 * - Disconnects on logout or unmount
 *
 * @param {(data: object) => void} [onVerdictUpdate]  optional callback for live verdicts
 */
export function useSocket(onVerdictUpdate) {
  const user = useAuthStore((state) => state.user);
  const userId = user?._id || user?.id;
  const callbackRef = useRef(onVerdictUpdate);

  // Always keep the callback ref fresh so we never need to re-subscribe
  useEffect(() => {
    callbackRef.current = onVerdictUpdate;
  }, [onVerdictUpdate]);

  const stableCallback = useCallback((data) => {
    if (callbackRef.current) callbackRef.current(data);
  }, []);

  useEffect(() => {
    if (!userId) {
      // Not logged in — ensure socket is closed
      socketService.disconnect();
      return;
    }

    // Connect (or reuse existing connected socket)
    socketService.connect(userId);

    // Subscribe to live verdict updates
    socketService.onSubmissionUpdate(stableCallback);

    return () => {
      // Unsubscribe listener on cleanup (don't disconnect — stays alive app-wide)
      socketService.offSubmissionUpdate(stableCallback);
    };
  }, [userId, stableCallback]);
}
