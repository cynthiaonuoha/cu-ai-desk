
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useUserPresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set user as online when they connect
    const setOnline = async () => {
      await supabase
        .from('profiles')
        .update({ 
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
    };

    // Set user as offline when they disconnect
    const setOffline = async () => {
      await supabase
        .from('profiles')
        .update({ 
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
    };

    // Set online status on mount
    setOnline();

    // Update last_seen periodically while active
    const interval = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
    }, 30000); // Update every 30 seconds

    // Set offline on page unload
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/offline', JSON.stringify({ userId: user.id }));
    };

    // Set offline on visibility change (when tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setOffline();
    };
  }, [user]);

  return null;
};
