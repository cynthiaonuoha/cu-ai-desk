
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, BookOpen, Clock, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  created_at: Date;
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data.length === 0) {
        // Add welcome message for new users
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Hello! I'm your Covenant University AI Assistant. How can I help you today?",
          sender: 'ai',
          created_at: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await supabase.from('chat_history').insert({
          content: welcomeMessage.content,
          sender: welcomeMessage.sender,
          user_id: user!.id
        });
      } else {
        // Convert string dates to Date objects and ensure sender is 'ai' or 'user'
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender as 'ai' | 'user',
          created_at: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      created_at: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    
    // Save user message to database
    try {
      await supabase.from('chat_history').insert({
        content: userMessage.content,
        sender: userMessage.sender,
        user_id: user.id
      });
      
      // Simulate AI response (in real app, you'd call an API here)
      setTimeout(async () => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm working on providing the best answer for you. This is a simulated response for the demo.",
          sender: 'ai',
          created_at: new Date()
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        // Save AI message to database
        await supabase.from('chat_history').insert({
          content: aiMessage.content,
          sender: aiMessage.sender,
          user_id: user.id
        });
      }, 1000);
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-covenant-primary/5 to-covenant-accent/5 rounded-lg shadow-lg">
      <div className="p-4 bg-covenant-primary text-white rounded-t-lg">
        <h2 className="text-xl font-playfair font-semibold">AI Assistant</h2>
        <p className="text-sm opacity-80">Ask me anything about your studies or schedule</p>
      </div>
      
      {/* Quick command buttons */}
      <div className="flex gap-2 p-3 bg-covenant-primary/10 overflow-x-auto scrollbar-none">
        <Button size="sm" variant="outline" className="flex gap-1 whitespace-nowrap">
          <BookOpen size={16} /> Summarize Notes
        </Button>
        <Button size="sm" variant="outline" className="flex gap-1 whitespace-nowrap">
          <Clock size={16} /> Set Reminder
        </Button>
        <Button size="sm" variant="outline" className="flex gap-1 whitespace-nowrap">
          <Lightbulb size={16} /> Study Tips
        </Button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-covenant-primary"></div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-covenant-primary text-white rounded-tr-none' 
                    : 'bg-white border border-covenant-accent/20 rounded-tl-none'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {message.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t">
        <form 
          className="flex gap-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            className="bg-covenant-primary hover:bg-covenant-primary/90"
            disabled={loading || !newMessage.trim()}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
