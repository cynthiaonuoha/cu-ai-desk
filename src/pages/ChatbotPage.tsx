
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, BookOpen, Heart, Calculator, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';  // Changed from 'bot' to 'ai' to match database constraint
  timestamp: Date;
}

const ChatbotPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when user is authenticated
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data.length === 0) {
        // Add welcome message for new users
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          content: "Hello! I'm your CU AI Assistant! 🤖✨ I'm here to help you with study tips, health advice, university life, and much more. What would you like to know today?",
          sender: 'ai',  // Changed from 'bot' to 'ai'
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await supabase.from('chat_history').insert({
          content: welcomeMessage.content,
          sender: welcomeMessage.sender,
          user_id: user!.id
        });
      } else {
        // Convert database messages to UI format
        const formattedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender as 'user' | 'ai',  // Changed from 'bot' to 'ai'
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
      // Still show welcome message if loading fails
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: "Hello! I'm your CU AI Assistant! 🤖✨ I'm here to help you with study tips, health advice, university life, and much more. What would you like to know today?",
        sender: 'ai',  // Changed from 'bot' to 'ai'
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const suggestedQuestions = [
    "How can I improve my study habits?",
    "What are some healthy eating tips for students?",
    "How do I manage stress during exams?",
    "Tell me about time management techniques"
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('chat_history').insert({
        content: userMessage.content,
        sender: userMessage.sender,
        user_id: user.id
      });

      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      console.log('Calling AI chat function...');
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: currentMessage,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI response failed');
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',  // Changed from 'bot' to 'ai'
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save AI response to database - this was the missing piece!
      const { error: saveError } = await supabase.from('chat_history').insert({
        content: botMessage.content,
        sender: botMessage.sender,  // Now using 'ai' instead of 'bot'
        user_id: user.id
      });

      if (saveError) {
        console.error('Error saving AI response:', saveError);
        // Don't show error to user since the message was displayed successfully
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting to my AI brain right now. Please try again in a moment, or check if your internet connection is stable. 🤖",
        sender: 'ai',  // Changed from 'bot' to 'ai'
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      
      // Save fallback message to database
      try {
        await supabase.from('chat_history').insert({
          content: fallbackMessage.content,
          sender: fallbackMessage.sender,  // Now using 'ai' instead of 'bot'
          user_id: user.id
        });
      } catch (dbError) {
        console.error('Error saving fallback message:', dbError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-800 via-purple-600 to-blue-600 bg-clip-text text-transparent font-playfair mb-2"
          >
            CU-AI Chat Assistant
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-purple-600 font-medium"
          >
            Your intelligent study companion for university life 🎓
          </motion.p>
        </div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cu-card min-h-[600px] flex flex-col"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-6 max-h-96">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-purple-600">Loading your chat history...</span>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <motion.div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                          message.sender === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {message.sender === 'user' ? 
                          <User size={16} className="text-white" /> : 
                          <Bot size={16} className="text-white" />
                        }
                      </motion.div>
                      <motion.div 
                        className={`p-4 rounded-2xl shadow-md backdrop-blur-sm ${
                          message.sender === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-tr-none' 
                            : 'bg-white/80 text-gray-800 rounded-tl-none border border-purple-100'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <span className={`text-xs block mt-2 ${
                          message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none shadow-md backdrop-blur-sm border border-purple-100">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && !loadingMessages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="px-6 pb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="p-3 text-sm text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-all duration-300 hover:shadow-md"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-purple-100">
            <div className="flex gap-3">
              <Input
                placeholder="Ask me anything about study tips, health, or university life..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white/70 backdrop-blur-sm"
                disabled={isLoading || loadingMessages}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !newMessage.trim() || loadingMessages}
                className="cu-button"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
            
            <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-purple-600">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Study Tips</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>Health Advice</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calculator className="w-4 h-4" />
                <span>Academic Help</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ChatbotPage;
