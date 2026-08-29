
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, MapPin, Calendar, GraduationCap, Heart, MessageSquare, UserPlus, ExternalLink, Mail, Phone, Twitter, Linkedin, Instagram, Github } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { DiscoverableUser } from '@/hooks/useUserDiscovery';
import { isAdminUser } from '@/utils/adminUtils';
import AdminBadge from './AdminBadge';

interface ProfileModalProps {
  user: DiscoverableUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSendRequest?: (userId: string) => void;
  onStartConversation?: (userId: string, userName: string, userAvatar?: string) => void;
}

const ProfileModal = ({ user, isOpen, onClose, onSendRequest, onStartConversation }: ProfileModalProps) => {
  const { user: currentUser } = useAuth();
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends' | 'sent'>('none');
  const [loading, setLoading] = useState(false);

  const displayName = user?.display_name || user?.username || 'Unknown User';
  const initials = displayName.substring(0, 2).toUpperCase();
  const showAdminBadge = user ? isAdminUser(user.id) : false;

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!currentUser || !user) return;

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

    if (isOpen) {
      checkFriendshipStatus();
    }
  }, [currentUser, user, isOpen]);

  const handleSendRequest = async () => {
    if (!user || !onSendRequest || loading) return;
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
    if (!user || !onStartConversation) return;
    onStartConversation(user.id, displayName, user.avatar_url || undefined);
    onClose();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!user) return null;

  const socialLinks = user.social_links || {};
  const validSocialLinks = Object.entries(socialLinks).filter(([_, url]) => url && isValidUrl(url));
  const showContactInfo = friendshipStatus === 'friends' || user.privacy_level === 'public';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                {user.avatar_url ? initials : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                {showAdminBadge && <AdminBadge />}
              </div>
              {user.username && user.username !== displayName && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bio Section */}
          {(user.bio || user.social_bio) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  About
                </h3>
                {user.bio && (
                  <p className="text-muted-foreground mb-2">{user.bio}</p>
                )}
                {user.social_bio && user.social_bio !== user.bio && (
                  <p className="text-muted-foreground text-sm italic">{user.social_bio}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {showContactInfo && (user.show_email || user.show_phone) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {user.show_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>Email available to friends</span>
                    </div>
                  )}
                  {user.show_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Phone available to friends</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {validSocialLinks.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {validSocialLinks.map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => window.open(url, '_blank')}
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Info */}
          {(user.department || user.level) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Information
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.department && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.department}
                    </Badge>
                  )}
                  {user.level && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {user.level}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {friendshipStatus === 'friends' ? (
              <Button onClick={handleStartConversation} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            ) : friendshipStatus === 'sent' ? (
              <Button variant="outline" disabled className="flex-1">
                Request Sent
              </Button>
            ) : friendshipStatus === 'pending' ? (
              <Button variant="outline" disabled className="flex-1">
                Pending
              </Button>
            ) : (
              <Button onClick={handleSendRequest} disabled={loading} className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
