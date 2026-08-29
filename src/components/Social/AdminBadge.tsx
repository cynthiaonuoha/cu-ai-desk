
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface AdminBadgeProps {
  className?: string;
}

const AdminBadge = ({ className = '' }: AdminBadgeProps) => {
  return (
    <Badge 
      variant="default" 
      className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-500 shadow-md hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 ${className}`}
    >
      <Crown className="h-3 w-3 mr-1" />
      Admin
    </Badge>
  );
};

export default AdminBadge;
