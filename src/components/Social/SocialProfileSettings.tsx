import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useSocialProfile } from '@/hooks/useSocialProfile';

const SocialProfileSettings = () => {
  const { profile, updateProfile, loading } = useSocialProfile();
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [localSocialBio, setLocalSocialBio] = useState('');
  const [localSocialLinks, setLocalSocialLinks] = useState<Record<string, string>>({});
  const isInitialized = useRef(false);

  // Initialize local state when profile loads
  useEffect(() => {
    if (profile && !isInitialized.current) {
      setInterests(profile.interests || []);
      setLocalSocialBio(profile.social_bio || '');
      setLocalSocialLinks(profile.social_links || {});
      isInitialized.current = true;
    }
  }, [profile]);

  // Debounced update for social bio
  useEffect(() => {
    if (!profile || !isInitialized.current) return;
    
    const timer = setTimeout(() => {
      if (localSocialBio !== profile.social_bio) {
        console.log('Updating social bio:', localSocialBio);
        updateProfile({ social_bio: localSocialBio });
      }
    }, 1000); // Increased debounce time

    return () => clearTimeout(timer);
  }, [localSocialBio]);

  // Debounced update for social links
  useEffect(() => {
    if (!profile || !isInitialized.current) return;
    
    const timer = setTimeout(() => {
      const currentLinks = profile.social_links || {};
      const hasChanges = Object.keys(localSocialLinks).some(
        key => localSocialLinks[key] !== currentLinks[key]
      ) || Object.keys(currentLinks).some(
        key => localSocialLinks[key] !== currentLinks[key]
      );

      if (hasChanges) {
        console.log('Updating social links:', localSocialLinks);
        updateProfile({ social_links: localSocialLinks });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [localSocialLinks]);

  if (loading) {
    return <div>Loading profile settings...</div>;
  }

  if (!profile) {
    return <div>Failed to load profile</div>;
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      const updatedInterests = [...interests, newInterest.trim()];
      setInterests(updatedInterests);
      updateProfile({ interests: updatedInterests });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    const updatedInterests = interests.filter(i => i !== interest);
    setInterests(updatedInterests);
    updateProfile({ interests: updatedInterests });
  };

  const handleSocialLinksUpdate = (platform: string, url: string) => {
    setLocalSocialLinks(prev => ({ ...prev, [platform]: url }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Profile</CardTitle>
          <CardDescription>
            Manage your social profile settings and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="socialBio">Social Bio</Label>
              <Textarea
                id="socialBio"
                placeholder="Tell others about yourself..."
                value={localSocialBio}
                onChange={(e) => setLocalSocialBio(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Changes are saved automatically after you stop typing
              </p>
            </div>
            <div>
              <Label htmlFor="privacyLevel">Privacy Level</Label>
              <Select
                value={profile.privacy_level}
                onValueChange={(value: 'public' | 'friends' | 'private') => 
                  updateProfile({ privacy_level: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Privacy Settings</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showEmail">Show email to others</Label>
                <Switch
                  id="showEmail"
                  checked={profile.show_email}
                  onCheckedChange={(checked) => updateProfile({ show_email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showPhone">Show phone number to others</Label>
                <Switch
                  id="showPhone"
                  checked={profile.show_phone}
                  onCheckedChange={(checked) => updateProfile({ show_phone: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowRequests">Allow friend requests</Label>
                <Switch
                  id="allowRequests"
                  checked={profile.allow_friend_requests}
                  onCheckedChange={(checked) => updateProfile({ allow_friend_requests: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
          <CardDescription>
            Add your interests so others can find you based on common interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
              />
              <Button onClick={handleAddInterest} disabled={!newInterest.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveInterest(interest)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Add links to your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/username"
                value={localSocialLinks.twitter || ''}
                onChange={(e) => handleSocialLinksUpdate('twitter', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={localSocialLinks.linkedin || ''}
                onChange={(e) => handleSocialLinksUpdate('linkedin', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/username"
                value={localSocialLinks.instagram || ''}
                onChange={(e) => handleSocialLinksUpdate('instagram', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                value={localSocialLinks.github || ''}
                onChange={(e) => handleSocialLinksUpdate('github', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Social links are saved automatically after you stop typing
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProfileSettings;
