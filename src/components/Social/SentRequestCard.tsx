
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Friendship } from '@/hooks/useFriendships';

interface SentRequestCardProps {
  friendship: Friendship;
  onCancel?: (friendshipId: string) => void;
}

interface ProfileData {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
}

const SentRequestCard = ({ friendship, onCancel }: SentRequestCardProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, department')
          .eq('id', friendship.addressee_id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [friendship.addressee_id]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel(friendship.id);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const displayName = profile?.display_name || profile?.username || 'Unknown User';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {profile?.avatar_url ? initials : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              {profile?.department && (
                <Badge variant="outline" className="text-xs">
                  {profile.department}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
            {onCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentRequestCard;
