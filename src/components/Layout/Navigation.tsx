
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Clock, 
  BookOpen, 
  Heart, 
  Calculator, 
  Settings,
  Users,
  User,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriendships } from '@/hooks/useFriendships';
import { notificationService } from '@/services/notificationService';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { friendRequests } = useFriendships();

  // Track unread notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(() => {
      setUnreadCount(notificationService.getUnreadCount());
    });

    // Initialize with current count
    setUnreadCount(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home', tooltip: 'Dashboard and overview' },
    { path: '/chatbot', icon: MessageSquare, label: 'AI Chat', tooltip: 'Chat with AI assistant' },
    { path: '/summarize', icon: FileText, label: 'Summarize', tooltip: 'Summarize your notes with AI' },
    { path: '/todo', icon: CheckSquare, label: 'Tasks', tooltip: 'Manage your to-do list' },
    { path: '/reminders', icon: Clock, label: 'Reminders', tooltip: 'Set and manage reminders' },
    { path: '/study-tips', icon: BookOpen, label: 'Study Tips', tooltip: 'Get study tips and advice' },
    { path: '/health-tips', icon: Heart, label: 'Health', tooltip: 'Health and wellness tips' },
    { path: '/calculator', icon: Calculator, label: 'Calculator', tooltip: 'Scientific calculator' },
    { 
      path: '/social', 
      icon: Users, 
      label: 'Social',
      tooltip: 'Connect with other students',
      badge: friendRequests.length > 0 ? friendRequests.length : undefined
    },
    { path: '/about', icon: User, label: 'About', tooltip: 'Learn about the creator' },
    { path: '/settings', icon: Settings, label: 'Settings', tooltip: 'Account and app settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <TooltipProvider delayDuration={50}>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      relative text-white transition-all duration-300
                      ${active 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  sideOffset={10}
                  avoidCollisions={true}
                  sticky="always"
                  className="bg-white text-gray-900 border shadow-lg z-50"
                >
                  <p className="text-sm font-medium">{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:bg-white/10"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl md:hidden z-50"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Button
                      key={item.path}
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        relative flex items-center justify-start space-x-2 text-white w-full
                        ${active 
                          ? 'bg-white/20 text-white' 
                          : 'hover:bg-white/10'
                        }
                      `}
                      title={item.tooltip}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default Navigation;
