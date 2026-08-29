
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, RefreshCw } from 'lucide-react';
import UserSearchCard from './UserSearchCard';
import LoadMoreButton from './LoadMoreButton';
import { DiscoverableUser } from '@/hooks/useUserDiscovery';

interface UserResultsProps {
  activeTab: 'search' | 'suggestions';
  searchQuery: string;
  searchResults: DiscoverableUser[];
  suggestions: DiscoverableUser[];
  loading: boolean;
  totalUsers: number;
  hasMoreSuggestions: boolean;
  onSendRequest: (userId: string) => void;
  onStartConversation: (userId: string, userName: string, userAvatar?: string) => void;
  onLoadMore: () => void;
  onRefreshSuggestions: () => void;
  loadingMore: boolean;
}

const UserResults = ({
  activeTab,
  searchQuery,
  searchResults,
  suggestions,
  loading,
  totalUsers,
  hasMoreSuggestions,
  onSendRequest,
  onStartConversation,
  onLoadMore,
  onRefreshSuggestions,
  loadingMore
}: UserResultsProps) => {
  if (activeTab === 'suggestions') {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">All Public Users</h3>
        {loading && suggestions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">Loading users...</div>
            </CardContent>
          </Card>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No public users found</p>
              <div className="text-sm mt-2 space-y-2">
                <p>This could be because:</p>
                <ul className="list-disc list-inside text-left max-w-xs mx-auto space-y-1">
                  <li>No users have set their profile to "Public"</li>
                  <li>There may be a temporary connection issue</li>
                  <li>Database permissions are still updating</li>
                </ul>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={onRefreshSuggestions}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map((user) => (
              <UserSearchCard
                key={user.id}
                user={user}
                onSendRequest={onSendRequest}
                onStartConversation={onStartConversation}
              />
            ))}
            
            <LoadMoreButton 
              onLoadMore={onLoadMore}
              loading={loadingMore}
              hasMore={hasMoreSuggestions}
            />
            
            <div className="text-center text-sm text-muted-foreground pt-4">
              Showing {suggestions.length} of {totalUsers} users
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Search Results {searchQuery && `for "${searchQuery}"`}
      </h3>
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">Searching...</div>
          </CardContent>
        </Card>
      ) : searchResults.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found for "{searchQuery}"</p>
            <div className="text-sm mt-2 space-y-1">
              <p>Try searching for:</p>
              <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                <li>Names or usernames</li>
                <li>Departments (e.g., "Computer Science")</li>
                <li>Interests or hobbies</li>
                <li>Bio content</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searchResults.map((user) => (
            <UserSearchCard
              key={user.id}
              user={user}
              onSendRequest={onSendRequest}
              onStartConversation={onStartConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserResults;
