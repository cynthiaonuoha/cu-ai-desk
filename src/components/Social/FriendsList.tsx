
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import { useFriendships } from '@/hooks/useFriendships';
import { isAdminUser } from '@/utils/adminUtils';
import AdminBadge from './AdminBadge';
import ProfileModal from './ProfileModal';

interface FriendsListProps {
  onStartConversation?: (userId: string, userName: string, userAvatar?: string) => void;
}

const FriendsList = ({ onStartConversation }: FriendsListProps) => {
  const { friends, loading } = useFriendships();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const handleStartConversation = (friendId: string, friendName: string, friendAvatar?: string) => {
    if (onStartConversation) {
      onStartConversation(friendId, friendName, friendAvatar);
    }
  };

  const handleOpenProfile = (friend: any) => {
    setSelectedFriend(friend);
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setSelectedFriend(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading friends...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Friends
            {friends.length > 0 && (
              <Badge variant="secondary">{friends.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No friends yet</p>
              <p className="text-sm">Start by discovering and connecting with classmates!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => {
                const displayName = friend.display_name || friend.username || 'Unknown User';
                const initials = displayName.substring(0, 2).toUpperCase();
                const showAdminBadge = isAdminUser(friend.id, friend.username);
                
                return (
                  <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleOpenProfile(friend)}
                      >
                        <AvatarImage src={friend.avatar_url || ''} />
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {friend.avatar_url ? initials : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p 
                            className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleOpenProfile(friend)}
                          >
                            {displayName}
                          </p>
                          {showAdminBadge && <AdminBadge />}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {friend.department && (
                            <Badge variant="outline" className="text-xs">
                              {friend.department}
                            </Badge>
                          )}
                          {friend.level && (
                            <Badge variant="outline" className="text-xs">
                              {friend.level}
                            </Badge>
                          )}
                        </div>
                        {friend.social_bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {friend.social_bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStartConversation(friend.id, displayName, friend.avatar_url || undefined)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ProfileModal
        user={selectedFriend}
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
        onStartConversation={onStartConversation}
      />
    </>
  );
};

export default FriendsList;
