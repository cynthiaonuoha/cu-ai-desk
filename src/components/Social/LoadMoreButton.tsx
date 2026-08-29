
import { Button } from '@/components/ui/button';
import { Users, RefreshCw } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
}

const LoadMoreButton = ({ onLoadMore, loading, hasMore }: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-4">
      <Button 
        variant="outline" 
        onClick={onLoadMore}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Users className="h-4 w-4" />
        )}
        {loading ? 'Loading...' : 'Load More Users'}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
