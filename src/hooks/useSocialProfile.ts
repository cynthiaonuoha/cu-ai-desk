
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface SocialProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  privacy_level: 'public' | 'friends' | 'private';
  show_email: boolean;
  show_phone: boolean;
  allow_friend_requests: boolean;
  social_bio: string | null;
  social_links: Record<string, string>;
  department: string | null;
  level: string | null;
}

export const useSocialProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name, avatar_url, bio,
          interests, privacy_level, show_email, show_phone,
          allow_friend_requests, social_bio, social_links,
          department, level
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedProfile: SocialProfile = {
        ...data,
        privacy_level: (data.privacy_level as 'public' | 'friends' | 'private') || 'public',
        social_links: (data.social_links as Record<string, string>) || {}
      };
      
      setProfile(typedProfile);
    } catch (error) {
      console.error('Error fetching social profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<SocialProfile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};
