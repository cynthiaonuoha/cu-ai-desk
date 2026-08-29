import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, KeyRound, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    display_name: '',
    avatar_url: '',
    interests: [] as string[],
    social_bio: ''
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, interests, social_bio')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await createUserProfile();
        }
        return;
      }

      if (data) {
        setProfileData({
          username: data.username || '',
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
          interests: data.interests || [],
          social_bio: data.social_bio || ''
        });
      } else {
        // Profile doesn't exist, create it
        await createUserProfile();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      console.log('Creating profile for user:', user.id);
      const emailUsername = user.email?.split('@')[0] || '';
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: emailUsername,
          display_name: emailUsername,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      // Update local state with the new profile data
      setProfileData({
        username: emailUsername,
        display_name: emailUsername,
        avatar_url: '',
        interests: [],
        social_bio: ''
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    // Ensure we have at least a username if display_name is empty
    const usernameToSave = profileData.username || user.email?.split('@')[0] || '';
    const displayNameToSave = profileData.display_name || usernameToSave;

    setLoading(true);
    try {
      console.log('Updating profile for user:', user.id, { 
        username: usernameToSave, 
        display_name: displayNameToSave,
        social_bio: profileData.social_bio,
        interests: profileData.interests
      });
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: usernameToSave,
          display_name: displayNameToSave,
          social_bio: profileData.social_bio,
          interests: profileData.interests,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      // Update local state
      setProfileData(prev => ({
        ...prev,
        username: usernameToSave,
        display_name: displayNameToSave
      }));

      toast.success('Profile updated successfully');
      setShowSettings(false);
      
      // Force a refresh of the header component by triggering a window event
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (profileData.display_name) return profileData.display_name;
    if (profileData.username) return profileData.username;
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileData.avatar_url} />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {getDisplayName()}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Quick Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Full Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/social')}>
            <User className="mr-2 h-4 w-4" />
            <span>Social Hub</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Settings Dialog - keep existing structure but add social fields */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Settings</DialogTitle>
            <DialogDescription>
              Update your basic profile information. For more options, visit the full settings page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                className="col-span-3"
                placeholder="Enter username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={profileData.display_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                className="col-span-3"
                placeholder="Enter display name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="socialBio" className="text-right">
                Bio
              </Label>
              <Input
                id="socialBio"
                value={profileData.social_bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, social_bio: e.target.value }))}
                className="col-span-3"
                placeholder="Tell others about yourself"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowSettings(false);
                navigate('/settings');
              }}
            >
              Full Settings
            </Button>
            <Button
              type="submit"
              onClick={updateProfile}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog - keep existing code */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentPassword" className="text-right">
                Current
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter current password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter new password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Confirm
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={changePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDropdown;
