import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import ProfileModal from './ProfileModal';

interface ConversationsListProps {
  onSelectConversation: (partnerId: string, partnerName: string, partnerAvatar?: string) => void;
}

interface ConversationWithProfile {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

const ConversationsList = ({ onSelectConversation }: ConversationsListProps) => {
  const { user } = useAuth();
  const { conversations } = useMessages();
  const [conversationsWithProfiles, setConversationsWithProfiles] = useState<ConversationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchConversationProfiles = async () => {
      if (!user || conversations.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const conversationData: ConversationWithProfile[] = [];

        for (const conversation of conversations) {
          const partnerId = conversation.participant_1 === user.id 
            ? conversation.participant_2 
            : conversation.participant_1;

          // Fetch partner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', partnerId)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', partnerId)
            .eq('receiver_id', user.id)
            .eq('is_read', false);

          const partnerName = profile?.display_name || profile?.username || 'Unknown User';

          conversationData.push({
            id: conversation.id,
            partnerId,
            partnerName,
            partnerAvatar: profile?.avatar_url || undefined,
            lastMessageAt: conversation.last_message_at,
            unreadCount: unreadCount || 0,
          });
        }

        setConversationsWithProfiles(conversationData);
      } catch (error) {
        console.error('Error fetching conversation profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationProfiles();
  }, [conversations, user]);

  const handleOpenProfile = async (partnerId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (profile) {
        setSelectedUser(profile);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading conversations...</div>
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
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {conversationsWithProfiles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with your friends!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {conversationsWithProfiles.map((conversation) => {
                  const initials = conversation.partnerName.substring(0, 2).toUpperCase();
                  
                  return (
                    <div
                      key={conversation.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onSelectConversation(
                        conversation.partnerId, 
                        conversation.partnerName, 
                        conversation.partnerAvatar
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar 
                            className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProfile(conversation.partnerId);
                            }}
                          >
                            <AvatarImage src={conversation.partnerAvatar} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {conversation.partnerAvatar ? initials : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1">
                            <OnlineStatusIndicator userId={conversation.partnerId} size="sm" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p 
                              className="font-medium truncate cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProfile(conversation.partnerId);
                              }}
                            >
                              {conversation.partnerName}
                            </p>
                            <div className="flex items-center gap-2">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 px-2 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              {conversation.lastMessageAt && (
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-1">
                            <OnlineStatusIndicator 
                              userId={conversation.partnerId} 
                              showText={true} 
                              size="sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <ProfileModal
        user={selectedUser}
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
      />
    </>
  );
};

export default ConversationsList;
