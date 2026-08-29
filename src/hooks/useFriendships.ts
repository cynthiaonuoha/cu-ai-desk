
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface FriendProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
  level: string | null;
  social_bio: string | null;
}

export const useFriendships = () => {
  const { user } = useAuth();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = async () => {
    if (!user) return;

    try {
      console.log('Fetching friendships for user:', user.id);
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched friendships data:', data);

      // Type cast the data to match our interface
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'accepted' | 'declined' | 'blocked'
      }));

      const accepted = typedData.filter(f => f.status === 'accepted');
      const incomingRequests = typedData.filter(f => f.status === 'pending' && f.addressee_id === user.id);
      const outgoingRequests = typedData.filter(f => f.status === 'pending' && f.requester_id === user.id);

      console.log('Processed data:', {
        accepted: accepted.length,
        incoming: incomingRequests.length,
        outgoing: outgoingRequests.length
      });

      setFriendships(accepted);
      setFriendRequests(incomingRequests);
      setSentRequests(outgoingRequests);

      // Fetch friend profiles for accepted friendships
      if (accepted.length > 0) {
        const friendIds = accepted.map(f => 
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        );

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, department, level, social_bio')
          .in('id', friendIds);

        if (profilesError) throw profilesError;

        setFriends(profilesData || []);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friendships:', error);
      toast.error('Failed to load friendships');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Friend request sent!');
      fetchFriendships(); // Refresh to show the new sent request
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  };

  const respondToFriendRequest = async (friendshipId: string, response: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ 
          status: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success(response === 'accepted' ? 'Friend request accepted!' : 'Friend request declined');
      fetchFriendships(); // Refresh the lists
      return true;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast.error('Failed to respond to friend request');
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend removed');
      fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      return false;
    }
  };

  useEffect(() => {
    fetchFriendships();
  }, [user]);

  return {
    friendships,
    friends,
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    refetch: fetchFriendships
  };
};
