
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for new friend requests
    const friendRequestsChannel = supabase
      .channel('friend-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: `addressee_id=eq.${user.id}`,
        },
        async (payload) => {
          const newFriendship = payload.new;
          
          // Fetch the requester's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', newFriendship.requester_id)
            .single();

          const name = profile?.display_name || profile?.username || 'Someone';
          
          notificationService.addNotification({
            user_id: user.id,
            type: 'friend_request',
            title: 'New Friend Request',
            message: `${name} sent you a friend request`,
            data: { friendshipId: newFriendship.id, requesterId: newFriendship.requester_id },
          });
        }
      )
      .subscribe();

    // Listen for friend request acceptances
    const friendAcceptedChannel = supabase
      .channel('friend-accepted')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${user.id}`,
        },
        async (payload) => {
          const updatedFriendship = payload.new;
          
          if (updatedFriendship.status === 'accepted') {
            // Fetch the addressee's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('id', updatedFriendship.addressee_id)
              .single();

            const name = profile?.display_name || profile?.username || 'Someone';
            
            notificationService.addNotification({
              user_id: user.id,
              type: 'friend_accepted',
              title: 'Friend Request Accepted',
              message: `${name} accepted your friend request`,
              data: { friendshipId: updatedFriendship.id, friendId: updatedFriendship.addressee_id },
            });
          }
        }
      )
      .subscribe();

    // Listen for new messages
    const messagesChannel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Fetch the sender's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', newMessage.sender_id)
            .single();

          const name = profile?.display_name || profile?.username || 'Someone';
          
          notificationService.addNotification({
            user_id: user.id,
            type: 'message',
            title: 'New Message',
            message: `${name} sent you a message`,
            data: { messageId: newMessage.id, senderId: newMessage.sender_id },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendRequestsChannel);
      supabase.removeChannel(friendAcceptedChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);
};
