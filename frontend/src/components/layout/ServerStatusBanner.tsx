import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, WifiOff } from 'lucide-react';
import { SERVER_WAKING_EVENT, warmUpServer } from '../../services/api';

export const ServerStatusBanner = () => {
  const [waking, setWaking] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    void warmUpServer();
  }, []);

  useEffect(() => {
    const handleWaking = (event: Event) => {
      setWaking((event as CustomEvent<boolean>).detail);
    };
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);

    window.addEventListener(SERVER_WAKING_EVENT, handleWaking);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener(SERVER_WAKING_EVENT, handleWaking);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const visible = offline || waking;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500"
        >
          {offline ? (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You are offline. We will reconnect automatically.</span>
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waking up the server — this can take up to a minute on the free tier.</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
