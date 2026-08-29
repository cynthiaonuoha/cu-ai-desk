
import { Button } from '@/components/ui/button';
import { Sparkles, Users, RefreshCw } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'search' | 'suggestions';
  setActiveTab: (tab: 'search' | 'suggestions') => void;
  searchQuery: string;
  searchResultsCount: number;
  totalUsers: number;
  onRefreshSuggestions: () => void;
  loading: boolean;
}

const TabNavigation = ({
  activeTab,
  setActiveTab,
  searchQuery,
  searchResultsCount,
  totalUsers,
  onRefreshSuggestions,
  loading
}: TabNavigationProps) => {
  return (
    <div className="flex gap-2 justify-between items-center">
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'suggestions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('suggestions')}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          All Users ({totalUsers})
        </Button>
        <Button
          variant={activeTab === 'search' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-2"
          disabled={!searchQuery.trim()}
        >
          <Users className="h-4 w-4" />
          Search Results {searchQuery && `(${searchResultsCount})`}
        </Button>
      </div>
      {activeTab === 'suggestions' && (
        <Button variant="outline" size="sm" onClick={onRefreshSuggestions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
    </div>
  );
};

export default TabNavigation;
