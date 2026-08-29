
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, RotateCcw, Clock, Check, CheckCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import ProfileModal from './ProfileModal';

interface ChatInterfaceProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  onBack: () => void;
}

const ChatInterface = ({ partnerId, partnerName, partnerAvatar, onBack }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, retryMessage, loading } = useMessages(partnerId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await sendMessage(partnerId, newMessage);
    setNewMessage('');
    setSending(false);
  };

  const handleRetry = async (message: any) => {
    await retryMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name, avatar_url, 
          department, level, interests, bio, social_bio, privacy_level,
          social_links, show_email, show_phone
        `)
        .eq('id', partnerId)
        .single();

      if (profile) {
        setSelectedUser({
          ...profile,
          interests: profile.interests as string[] | null,
          social_links: profile.social_links as Record<string, string> | null,
          privacy_level: profile.privacy_level as 'public' | 'friends' | 'private'
        });
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

  const initials = partnerName.substring(0, 2).toUpperCase();

  const getMessageStatusIcon = (message: any) => {
    if (message.status === 'sending') {
      return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />;
    }
    if (message.status === 'sent') {
      return <Check className="h-3 w-3 text-gray-500" />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck className="h-3 w-3 text-gray-500" />;
    }
    if (message.status === 'read') {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    if (message.status === 'failed') {
      return (
        <button
          onClick={() => handleRetry(message)}
          className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs"
        >
          <X className="h-3 w-3" />
          <RotateCcw className="h-3 w-3" />
        </button>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Avatar 
                className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleOpenProfile}
              >
                <AvatarImage src={partnerAvatar} />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <OnlineStatusIndicator userId={partnerId} size="sm" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle 
                className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleOpenProfile}
              >
                {partnerName}
              </CardTitle>
              <OnlineStatusIndicator 
                userId={partnerId} 
                showText={true} 
                size="sm" 
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-muted-foreground">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>No messages yet</p>
                  <p className="text-sm">Start a conversation with {partnerName}!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          isOwn
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        } ${message.status === 'failed' ? 'border-2 border-red-300' : ''}`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 gap-2`}>
                          <p
                            className={`text-xs ${
                              isOwn ? 'text-purple-200' : 'text-gray-500'
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                          {isOwn && getMessageStatusIcon(message)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                {sending ? (
                  <Clock className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
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

export default ChatInterface;
