
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface OnlineStatusIndicatorProps {
  userId: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OnlineStatusIndicator = ({ userId, showText = false, size = 'sm' }: OnlineStatusIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [showActivityStatus, setShowActivityStatus] = useState(true);

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_online, last_seen, show_activity_status')
          .eq('id', userId)
          .single();

        if (data) {
          setIsOnline(data.is_online || false);
          setLastSeen(data.last_seen);
          setShowActivityStatus(data.show_activity_status !== false);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setIsOnline(newData.is_online || false);
          setLastSeen(newData.last_seen);
          setShowActivityStatus(newData.show_activity_status !== false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!showActivityStatus) {
    return null;
  }

  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (lastSeen) {
      return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
    }
    return 'Offline';
  };

  return (
    <div className="flex items-center gap-1">
      <div 
        className={`${sizeClasses[size]} rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {showText && (
        <span className="text-xs text-muted-foreground">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default OnlineStatusIndicator;
