
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { toast } from '@/components/ui/sonner';

interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

export const NotificationSettings = ({ 
  notificationsEnabled, 
  onToggleNotifications 
}: NotificationSettingsProps) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setPermission(notificationService.getPermission());
    setIsSupported(notificationService.isSupported());
  }, []);

  const handleRequestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      toast.success('Notifications enabled successfully!');
      onToggleNotifications(true);
    } else if (newPermission === 'denied') {
      toast.error('Notifications were denied. Please enable them in your browser settings.');
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      handleRequestPermission();
    } else {
      onToggleNotifications(enabled);
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return { text: 'Not Supported', color: 'bg-gray-100 text-gray-600', icon: BellOff };
    }
    
    switch (permission) {
      case 'granted':
        return { text: 'Enabled', color: 'bg-green-100 text-green-800', icon: Bell };
      case 'denied':
        return { text: 'Blocked', color: 'bg-red-100 text-red-800', icon: BellOff };
      default:
        return { text: 'Not Enabled', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="border-purple-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell size={20} className="text-purple-600" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon size={20} className={permission === 'granted' ? 'text-green-600' : 'text-gray-400'} />
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-gray-500">Get notified when reminders are due</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={status.color}>
              {status.text}
            </Badge>
            <Switch
              checked={notificationsEnabled && permission === 'granted'}
              onCheckedChange={handleToggleNotifications}
              disabled={!isSupported}
            />
          </div>
        </div>

        {permission === 'denied' && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle size={16} className="inline mr-2" />
            Notifications are blocked. To enable them, click the notification icon in your browser's address bar or check your browser settings.
          </div>
        )}

        {permission === 'default' && (
          <Button
            onClick={handleRequestPermission}
            variant="outline"
            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            Enable Browser Notifications
          </Button>
        )}

        <div className="text-xs text-gray-500 mt-2">
          💡 Notifications will appear 1 minute before your reminder time and show a toast message as backup.
        </div>
      </CardContent>
    </Card>
  );
};
