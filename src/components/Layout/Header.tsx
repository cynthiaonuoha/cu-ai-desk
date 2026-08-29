import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserDropdown from "../UserDropdown";
import Navigation from "./Navigation";
import NotificationDropdown from "../NotificationDropdown";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const Header = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');

  // Initialize notifications system
  useNotifications();

  const fetchUserProfile = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to email username if profile fetch fails
          const emailUsername = user.email?.split('@')[0] || 'User';
          setDisplayName(emailUsername);
          return;
        }

        if (data) {
          // Priority: display_name > username > email prefix
          const name = data.display_name || data.username || user.email?.split('@')[0] || 'User';
          setDisplayName(name);
        } else {
          // Fallback to email username if no profile data
          const emailUsername = user.email?.split('@')[0] || 'User';
          setDisplayName(emailUsername);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to email username on any error
        const emailUsername = user.email?.split('@')[0] || 'User';
        setDisplayName(emailUsername);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="cu-gradient shadow-xl sticky top-0 z-50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <motion.img 
                src="/lovable-uploads/d7726cc8-b266-4fe1-b563-dbfcbbbf7e9c.png" 
                alt="Covenant University Logo" 
                className="h-12 w-12 rounded-full"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              />
              <div>
                <h1 className="text-xl font-bold text-white font-playfair">CU AI Desk</h1>
                <div className="flex items-center space-x-1 text-purple-100 text-xs">
                  <GraduationCap className="w-3 h-3" />
                  <span>Covenant University</span>
                </div>
              </div>
            </div>
            
            {displayName && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden md:flex items-center space-x-2 text-purple-100 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Welcome back, {displayName}! 😊
                </span>
              </motion.div>
            )}
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Navigation />
            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationDropdown />
                <UserDropdown />
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
