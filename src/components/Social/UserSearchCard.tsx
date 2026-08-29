
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, User, MessageSquare, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { DiscoverableUser } from '@/hooks/useUserDiscovery';
import { isAdminUser } from '@/utils/adminUtils';
import AdminBadge from './AdminBadge';
import ProfileModal from './ProfileModal';

interface UserSearchCardProps {
  user: DiscoverableUser;
  onSendRequest: (userId: string) => void;
  onStartConversation: (userId: string, userName: string, userAvatar?: string) => void;
}

const UserSearchCard = ({ user, onSendRequest, onStartConversation }: UserSearchCardProps) => {
  const { user: currentUser } = useAuth();
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends' | 'sent'>('none');
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const displayName = user.display_name || user.username || 'Unknown User';
  const initials = displayName.substring(0, 2).toUpperCase();
  const showAdminBadge = isAdminUser(user.id, user.username);

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('friendships')
          .select('status, requester_id, addressee_id')
          .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${currentUser.id})`)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking friendship status:', error);
          return;
        }

        if (data) {
          if (data.status === 'accepted') {
            setFriendshipStatus('friends');
          } else if (data.requester_id === currentUser.id) {
            setFriendshipStatus('sent');
          } else {
            setFriendshipStatus('pending');
          }
        }
      } catch (error) {
        console.error('Error checking friendship status:', error);
      }
    };

    checkFriendshipStatus();
  }, [currentUser, user.id]);

  const handleSendRequest = async () => {
    if (!currentUser || loading) return;

    setLoading(true);
    try {
      await onSendRequest(user.id);
      setFriendshipStatus('sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = () => {
    onStartConversation(user.id, displayName, user.avatar_url || undefined);
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
  };

  const getActionButton = () => {
    switch (friendshipStatus) {
      case 'friends':
        return (
          <Button 
            size="sm" 
            onClick={handleStartConversation}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
        );
      case 'sent':
        return (
          <Button size="sm" variant="outline" disabled>
            Request Sent
          </Button>
        );
      case 'pending':
        return (
          <Button size="sm" variant="outline" disabled>
            Pending
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            onClick={handleSendRequest}
            disabled={loading}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        );
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Avatar 
                className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={handleOpenProfile}
              >
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {user.avatar_url ? initials : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p 
                    className="font-medium text-base cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleOpenProfile}
                  >
                    {displayName}
                  </p>
                  {showAdminBadge && <AdminBadge />}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.department && (
                    <Badge variant="outline" className="text-xs">
                      {user.department}
                    </Badge>
                  )}
                  {user.level && (
                    <Badge variant="outline" className="text-xs">
                      {user.level}
                    </Badge>
                  )}
                </div>
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {user.bio}
                  </p>
                )}
                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.interests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {user.interests.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{user.interests.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleOpenProfile}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Profile
              </Button>
              {getActionButton()}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSendRequest={onSendRequest}
        onStartConversation={onStartConversation}
      />
    </>
  );
};

export default UserSearchCard;
