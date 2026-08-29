
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Friendship } from '@/hooks/useFriendships';

interface FriendRequestCardProps {
  friendship: Friendship;
  onRespond: (friendshipId: string, response: 'accepted' | 'declined') => void;
}

interface ProfileData {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
}

const FriendRequestCard = ({ friendship, onRespond }: FriendRequestCardProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, department')
          .eq('id', friendship.requester_id)
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
  }, [friendship.requester_id]);

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
              <AvatarFallback className="bg-purple-100 text-purple-600">
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
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onRespond(friendship.id, 'accepted')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRespond(friendship.id, 'declined')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendRequestCard;
