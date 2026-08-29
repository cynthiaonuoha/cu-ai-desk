
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface DiscoverableUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
  level: string | null;
  interests: string[] | null;
  bio: string | null;
  social_bio: string | null;
  social_links: Record<string, string> | null;
  show_email: boolean;
  show_phone: boolean;
  privacy_level: 'public' | 'friends' | 'private';
}

export const useUserDiscovery = () => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<DiscoverableUser[]>([]);
  const [suggestions, setSuggestions] = useState<DiscoverableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);

  const SUGGESTIONS_PER_PAGE = 20;

  const searchUsers = async (query: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    console.log('🔍 Searching for users with query:', query);
    console.log('🔐 Current authenticated user:', user.id);
    
    try {
      // Enhanced search - include interests and bio content
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name, avatar_url, 
          department, level, interests, bio, social_bio, privacy_level,
          social_links, show_email, show_phone
        `)
        .neq('id', user.id)
        .eq('privacy_level', 'public')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,department.ilike.%${query}%,bio.ilike.%${query}%,social_bio.ilike.%${query}%`)
        .limit(50);

      if (error) {
        console.error('❌ Search error:', error);
        throw error;
      }

      console.log('✅ Search results found:', data?.length || 0);
      console.log('📊 Raw search data:', data);
      
      const typedResults = (data || []).map(item => ({
        ...item,
        interests: item.interests as string[] | null,
        bio: item.bio || item.social_bio,
        social_bio: item.social_bio,
        social_links: item.social_links as Record<string, string> | null,
        privacy_level: item.privacy_level as 'public' | 'friends' | 'private'
      }));

      setSearchResults(typedResults);
    } catch (error) {
      console.error('💥 Error searching users:', error);
      toast.error('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (reset = true) => {
    if (!user) {
      console.log('⚠️ No authenticated user found, skipping suggestions fetch');
      setSuggestions([]);
      setTotalUsers(0);
      return;
    }

    if (reset) {
      console.log('🚀 Fetching public user suggestions');
      console.log('🔐 Authenticated user ID:', user.id);
      console.log('📧 User email:', user.email);
      setLoading(true);
    }
    
    try {
      // First, verify authentication status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Authentication error');
      }
      
      if (!session) {
        console.error('❌ No active session found');
        throw new Error('No active session');
      }

      console.log('✅ Active session confirmed for user:', session.user.id);

      // Get total count of public users first
      const { count: totalCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('id', user.id)
        .eq('privacy_level', 'public');

      if (countError) {
        console.error('❌ Error getting user count:', countError);
        throw countError;
      }

      console.log('📊 Total public users available:', totalCount);
      setTotalUsers(totalCount || 0);

      // Get suggestions with enhanced logging
      const offset = reset ? 0 : suggestions.length;
      console.log('📄 Fetching suggestions with offset:', offset);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name, avatar_url, 
          department, level, interests, bio, social_bio, privacy_level,
          social_links, show_email, show_phone
        `)
        .neq('id', user.id)
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + SUGGESTIONS_PER_PAGE - 1);

      if (error) {
        console.error('❌ Error fetching suggestions:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Raw suggestions query successful');
      console.log('📊 Suggestions data received:', data);
      console.log('📝 Number of suggestions:', data?.length || 0);

      const typedSuggestions = (data || []).map(item => ({
        ...item,
        interests: item.interests as string[] | null,
        bio: item.bio || item.social_bio,
        social_bio: item.social_bio,
        social_links: item.social_links as Record<string, string> | null,
        privacy_level: item.privacy_level as 'public' | 'friends' | 'private'
      }));

      console.log('🔄 Processed suggestions:', typedSuggestions);
      
      if (reset) {
        setSuggestions(typedSuggestions);
        console.log('🔄 Set new suggestions (reset)');
      } else {
        setSuggestions(prev => {
          const newSuggestions = [...prev, ...typedSuggestions];
          console.log('🔄 Appended suggestions, total:', newSuggestions.length);
          return newSuggestions;
        });
      }

      // Check if there are more suggestions to load
      const hasMore = (offset + typedSuggestions.length) < (totalCount || 0);
      setHasMoreSuggestions(hasMore);
      console.log('🔄 Has more suggestions:', hasMore);

    } catch (error) {
      console.error('💥 Error fetching suggestions:', error);
      if (error instanceof Error) {
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
      }
      toast.error('Failed to load user suggestions. Please refresh the page.');
    } finally {
      if (reset) {
        setLoading(false);
      }
    }
  };

  const loadMoreSuggestions = () => {
    if (!hasMoreSuggestions || loading) {
      console.log('⚠️ Cannot load more suggestions:', { hasMoreSuggestions, loading });
      return;
    }
    console.log('📄 Loading more suggestions...');
    fetchSuggestions(false);
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user]);

  // Fetch suggestions when user changes
  useEffect(() => {
    if (user) {
      console.log('🔄 User authenticated, fetching suggestions for:', user.id);
      // Add a small delay to ensure RLS policies are ready
      setTimeout(() => {
        fetchSuggestions();
      }, 100);
    } else {
      console.log('⚠️ No user, clearing suggestions');
      setSuggestions([]);
      setTotalUsers(0);
      setHasMoreSuggestions(true);
    }
  }, [user]);

  return {
    searchResults,
    suggestions,
    loading,
    searchQuery,
    setSearchQuery,
    totalUsers,
    hasMoreSuggestions,
    loadMoreSuggestions,
    refetchSuggestions: () => fetchSuggestions(true)
  };
};
