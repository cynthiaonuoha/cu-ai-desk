
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NotificationSettings } from '@/components/NotificationSettings';

interface RemindersHeaderProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

export const RemindersHeader = ({ 
  notificationsEnabled, 
  onToggleNotifications 
}: RemindersHeaderProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-3xl md:text-4xl font-bold text-purple-800 mb-2 font-serif"
        >
          ⏰ Smart Reminders
        </motion.h1>
        <p className="text-purple-600">Never miss an important deadline</p>
        {notificationsEnabled && (
          <Badge className="bg-green-100 text-green-800 mt-2">
            <Bell size={12} className="mr-1" />
            Notifications Active
          </Badge>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Settings size={16} className="mr-2" />
              Notification Settings
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <NotificationSettings
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={onToggleNotifications}
            />
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    </>
  );
};
