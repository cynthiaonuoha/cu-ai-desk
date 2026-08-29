
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  message_type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isOptimistic?: boolean;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export const useMessages = (conversationPartnerId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch conversations for the current user
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Add status to existing messages
      const messagesWithStatus = (data || []).map(msg => ({
        ...msg,
        status: msg.is_read ? 'read' as const : 'delivered' as const
      }));
      
      setMessages(messagesWithStatus);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a new message with optimistic updates
  const sendMessage = async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return;

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: false,
      message_type: 'text',
      status: 'sending',
      isOptimistic: true
    };

    // Add optimistic message immediately to UI
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // First, ensure conversation exists
      await createOrGetConversation(receiverId);

      // Send the actual message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...data, status: 'sent' as const }
          : msg
      ));

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${receiverId}),and(participant_1.eq.${receiverId},participant_2.eq.${user.id})`);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark optimistic message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, status: 'failed' as const }
          : msg
      ));

      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Retry failed message
  const retryMessage = async (failedMessage: Message) => {
    if (!failedMessage.isOptimistic) return;

    // Remove the failed message first
    setMessages(prev => prev.filter(msg => msg.id !== failedMessage.id));
    
    // Retry sending
    return sendMessage(failedMessage.receiver_id, failedMessage.content);
  };

  // Create or get existing conversation
  const createOrGetConversation = async (partnerId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${partnerId}),and(participant_1.eq.${partnerId},participant_2.eq.${user.id})`)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: partnerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state to reflect read status
      setMessages(prev => prev.map(msg => 
        msg.sender_id === senderId && msg.receiver_id === user.id && !msg.is_read
          ? { ...msg, is_read: true, status: 'read' as const }
          : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add if message involves current user
          if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
            setMessages(prev => {
              // Don't add if we already have this message
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
              
              return [...prev, { ...newMessage, status: 'delivered' as const }];
            });
            
            // Refresh conversations to update last_message_at
            fetchConversations();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          // Update message status when is_read changes
          if (updatedMessage.sender_id === user.id || updatedMessage.receiver_id === user.id) {
            setMessages(prev => prev.map(msg =>
              msg.id === updatedMessage.id
                ? { 
                    ...msg, 
                    is_read: updatedMessage.is_read,
                    status: updatedMessage.is_read ? 'read' as const : msg.status
                  }
                : msg
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to conversation changes
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1.eq.${user.id},participant_2.eq.${user.id})`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Fetch messages when conversation partner changes
  useEffect(() => {
    if (conversationPartnerId) {
      fetchMessages(conversationPartnerId);
      markMessagesAsRead(conversationPartnerId);
    }
  }, [conversationPartnerId, user]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    retryMessage,
    fetchMessages,
    fetchConversations,
    markMessagesAsRead,
  };
};
