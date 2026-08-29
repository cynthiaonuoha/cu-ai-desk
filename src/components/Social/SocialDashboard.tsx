
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Search, UserPlus, Settings, Clock } from 'lucide-react';
import FriendsList from './FriendsList';
import UserDiscovery from './UserDiscovery';
import MessagingCenter from './MessagingCenter';
import FriendRequestCard from './FriendRequestCard';
import SentRequestCard from './SentRequestCard';
import SocialProfileSettings from './SocialProfileSettings';
import { useFriendships } from '@/hooks/useFriendships';
import { useUserPresence } from '@/hooks/useUserPresence';

const SocialDashboard = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedConversation, setSelectedConversation] = useState<{
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
  } | null>(null);
  
  const { friendRequests, sentRequests, respondToFriendRequest, removeFriend } = useFriendships();
  
  // Track user presence
  useUserPresence();

  const handleStartConversation = (userId: string, userName: string, userAvatar?: string) => {
    setSelectedConversation({ partnerId: userId, partnerName: userName, partnerAvatar: userAvatar });
    setActiveTab('messages');
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Clear selected conversation when switching away from messages tab
    if (newTab !== 'messages') {
      setSelectedConversation(null);
    }
  };

  const handleConversationChange = (conversation: {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
  } | null) => {
    setSelectedConversation(conversation);
  };

  const handleFriendRequestResponse = (friendshipId: string, response: 'accepted' | 'declined') => {
    respondToFriendRequest(friendshipId, response);
  };

  const handleCancelSentRequest = (friendshipId: string) => {
    removeFriend(friendshipId);
  };

  const hasAnyRequests = friendRequests.length > 0 || sentRequests.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Hub</h1>
          <p className="text-muted-foreground mt-1">Connect with classmates and build your network</p>
        </div>
      </div>

      {/* Friend Requests Section - Always show if there are any requests */}
      {hasAnyRequests && (
        <div className="space-y-4">
          {/* Incoming Friend Requests */}
          {friendRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Friend Requests ({friendRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {friendRequests.map((friendship) => (
                    <FriendRequestCard 
                      key={friendship.id} 
                      friendship={friendship} 
                      onRespond={handleFriendRequestResponse}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sent Friend Requests */}
          {sentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sent Requests ({sentRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sentRequests.map((friendship) => (
                    <SentRequestCard 
                      key={friendship.id} 
                      friendship={friendship} 
                      onCancel={handleCancelSentRequest}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Show empty state if no requests */}
      {!hasAnyRequests && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Friend Requests</h3>
            <p className="text-muted-foreground">
              When you send or receive friend requests, they'll appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-6">
          <FriendsList onStartConversation={handleStartConversation} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <MessagingCenter 
            selectedConversation={selectedConversation}
            onConversationChange={handleConversationChange}
          />
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <UserDiscovery onStartConversation={handleStartConversation} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SocialProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialDashboard;
