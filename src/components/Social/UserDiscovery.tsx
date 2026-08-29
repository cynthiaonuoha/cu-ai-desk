
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useUserDiscovery } from '@/hooks/useUserDiscovery';
import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import SearchBar from './SearchBar';
import TabNavigation from './TabNavigation';
import UserResults from './UserResults';

interface UserDiscoveryProps {
  onStartConversation?: (userId: string, userName: string, userAvatar?: string) => void;
}

const UserDiscovery = ({ onStartConversation }: UserDiscoveryProps) => {
  const { user, loading: authLoading } = useAuth();
  const { 
    searchResults, 
    suggestions, 
    loading, 
    searchQuery, 
    setSearchQuery,
    totalUsers,
    hasMoreSuggestions,
    loadMoreSuggestions,
    refetchSuggestions
  } = useUserDiscovery();
  
  const { sendFriendRequest } = useFriendships();
  const [activeTab, setActiveTab] = useState<'search' | 'suggestions'>('suggestions');
  const [loadingMore, setLoadingMore] = useState(false);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading authentication...</div>
        </CardContent>
      </Card>
    );
  }

  // Show auth prompt if not logged in
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <LogIn className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">
            Please sign in to discover and connect with other users.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      toast({
        title: "Friend request sent!",
        description: "Your friend request has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartConversation = (userId: string, userName: string, userAvatar?: string) => {
    if (onStartConversation) {
      onStartConversation(userId, userName, userAvatar);
    }
  };

  const refreshSuggestions = () => {
    console.log('🔄 User requested suggestions refresh');
    refetchSuggestions();
    toast({
      title: "Refreshed",
      description: "Updated your suggestions with the latest users.",
    });
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    loadMoreSuggestions();
    setTimeout(() => setLoadingMore(false), 500);
  };

  const handleSearchClick = () => {
    setActiveTab('search');
  };

  return (
    <div className="space-y-6">
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchClick={handleSearchClick}
      />

      <TabNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        searchResultsCount={searchResults.length}
        totalUsers={totalUsers}
        onRefreshSuggestions={refreshSuggestions}
        loading={loading}
      />

      <UserResults 
        activeTab={activeTab}
        searchQuery={searchQuery}
        searchResults={searchResults}
        suggestions={suggestions}
        loading={loading}
        totalUsers={totalUsers}
        hasMoreSuggestions={hasMoreSuggestions}
        onSendRequest={handleSendRequest}
        onStartConversation={handleStartConversation}
        onLoadMore={handleLoadMore}
        onRefreshSuggestions={refreshSuggestions}
        loadingMore={loadingMore}
      />
    </div>
  );
};

export default UserDiscovery;
