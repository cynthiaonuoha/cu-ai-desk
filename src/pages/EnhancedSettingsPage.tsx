import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, MapPin, Calendar, GraduationCap, KeyRound, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import Layout from "@/components/Layout/Layout";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import ProfileCompletionProgress from "@/components/ProfileCompletionProgress";

const EnhancedSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    display_name: '',
    bio: '',
    phone_number: '',
    location: '',
    date_of_birth: '',
    student_id: '',
    department: '',
    level: '',
    avatar_url: '',
    profile_completion_percentage: 0
  });
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching full profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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
          bio: data.bio || '',
          phone_number: data.phone_number || '',
          location: data.location || '',
          date_of_birth: data.date_of_birth || '',
          student_id: data.student_id || '',
          department: data.department || '',
          level: data.level || '',
          avatar_url: data.avatar_url || '',
          profile_completion_percentage: data.profile_completion_percentage || 0
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
      console.log('Creating full profile for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email?.split('@')[0] || '',
          display_name: user.email?.split('@')[0] || '',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      // Fetch the newly created profile
      await fetchUserProfile();
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const updateProfile = async (section: string) => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Updating profile section:', section, 'for user:', user.id);
      console.log('Profile data:', profileData);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      toast.success(`${section} updated successfully`);
      await fetchUserProfile(); // Refresh to get updated completion percentage
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update ${section.toLowerCase()}: ${error.message || 'Unknown error'}`);
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
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully');
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

  const handleAvatarUpdate = (url: string) => {
    setProfileData(prev => ({ ...prev, avatar_url: url }));
    fetchUserProfile(); // Refresh to update completion percentage
  };

  const getCompletedFields = () => {
    const fields = [];
    if (profileData.username) fields.push('Username');
    if (profileData.display_name) fields.push('Display Name');
    if (profileData.bio) fields.push('Bio');
    if (profileData.phone_number) fields.push('Phone');
    if (profileData.location) fields.push('Location');
    if (profileData.date_of_birth) fields.push('Date of Birth');
    if (profileData.student_id) fields.push('Student ID');
    if (profileData.avatar_url) fields.push('Profile Picture');
    return fields;
  };

  const totalFields = ['Username', 'Display Name', 'Bio', 'Phone', 'Location', 'Date of Birth', 'Student ID', 'Profile Picture'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-purple-800 mb-2 font-playfair"
            >
              ⚙️ Account Settings
            </motion.h1>
            <p className="text-purple-600">Manage your profile and account preferences</p>
          </div>

          <ProfileCompletionProgress 
            completionPercentage={profileData.profile_completion_percentage}
            completedFields={getCompletedFields()}
            totalFields={totalFields}
          />

          <Card className="shadow-xl border-purple-100">
            <CardContent className="p-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center justify-center gap-2">
                      <User size={24} />
                      Personal Information
                    </h3>
                    <ProfilePictureUpload 
                      currentAvatarUrl={profileData.avatar_url}
                      onAvatarUpdate={handleAvatarUpdate}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-700">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter username"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profileData.display_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Enter display name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="text-gray-700">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-gray-700">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.date_of_birth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => updateProfile('Personal Information')}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Updating...' : 'Update Personal Info'}
                  </Button>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Phone size={24} />
                    Contact Information
                  </h3>

                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50 mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed here</p>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-gray-700">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profileData.phone_number}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+234 xxx xxx xxxx"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={() => updateProfile('Contact Information')}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Updating...' : 'Update Contact Info'}
                  </Button>
                </TabsContent>

                <TabsContent value="student" className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <GraduationCap size={24} />
                    Student Information
                  </h3>

                  <div>
                    <Label htmlFor="studentId" className="text-gray-700">Student ID</Label>
                    <Input
                      id="studentId"
                      value={profileData.student_id}
                      onChange={(e) => setProfileData(prev => ({ ...prev, student_id: e.target.value }))}
                      placeholder="Enter your student ID"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department" className="text-gray-700">Department</Label>
                    <Select
                      value={profileData.department}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {/* College of Engineering */}
                        <SelectItem value="chemical-engineering">Chemical Engineering</SelectItem>
                        <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                        <SelectItem value="computer-engineering">Computer Engineering</SelectItem>
                        <SelectItem value="electrical-electronics-engineering">Electrical & Electronics Engineering</SelectItem>
                        <SelectItem value="information-communication-engineering">Information & Communication Engineering</SelectItem>
                        <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="petroleum-engineering">Petroleum Engineering</SelectItem>
                        
                        {/* College of Science & Technology */}
                        <SelectItem value="biochemistry">Biochemistry</SelectItem>
                        <SelectItem value="biological-sciences">Biological Sciences</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="industrial-chemistry">Industrial Chemistry</SelectItem>
                        <SelectItem value="information-technology">Information Technology</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="microbiology">Microbiology</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="statistics">Statistics</SelectItem>
                        
                        {/* College of Business & Social Sciences */}
                        <SelectItem value="accounting">Accounting</SelectItem>
                        <SelectItem value="banking-finance">Banking & Finance</SelectItem>
                        <SelectItem value="business-administration">Business Administration</SelectItem>
                        <SelectItem value="economics">Economics</SelectItem>
                        <SelectItem value="international-relations">International Relations</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="political-science">Political Science</SelectItem>
                        <SelectItem value="psychology">Psychology</SelectItem>
                        <SelectItem value="sociology">Sociology</SelectItem>
                        
                        {/* College of Leadership Development Studies */}
                        <SelectItem value="economics-development-studies">Economics & Development Studies</SelectItem>
                        <SelectItem value="political-science-international-relations">Political Science & International Relations</SelectItem>
                        <SelectItem value="psychology-human-development">Psychology & Human Development</SelectItem>
                        <SelectItem value="sociology-anthropology">Sociology & Anthropology</SelectItem>
                        
                        {/* College of Health Sciences */}
                        <SelectItem value="anatomy">Anatomy</SelectItem>
                        <SelectItem value="medical-laboratory-science">Medical Laboratory Science</SelectItem>
                        <SelectItem value="medicine-surgery">Medicine & Surgery</SelectItem>
                        <SelectItem value="nursing-science">Nursing Science</SelectItem>
                        <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                        
                        {/* College of Development Studies */}
                        <SelectItem value="architecture">Architecture</SelectItem>
                        <SelectItem value="building-technology">Building Technology</SelectItem>
                        <SelectItem value="estate-management">Estate Management</SelectItem>
                        <SelectItem value="quantity-surveying">Quantity Surveying</SelectItem>
                        <SelectItem value="urban-regional-planning">Urban & Regional Planning</SelectItem>
                        
                        {/* Omega Schools */}
                        <SelectItem value="mass-communication">Mass Communication</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="performing-arts">Performing Arts</SelectItem>
                        <SelectItem value="visual-arts">Visual Arts</SelectItem>
                        
                        {/* School of Environmental Sciences */}
                        <SelectItem value="environmental-biology">Environmental Biology</SelectItem>
                        <SelectItem value="environmental-chemistry">Environmental Chemistry</SelectItem>
                        <SelectItem value="environmental-management">Environmental Management & Toxicology</SelectItem>
                        
                        {/* School of Postgraduate Studies */}
                        <SelectItem value="postgraduate-studies">Postgraduate Studies</SelectItem>
                        
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level" className="text-gray-700">Level</Label>
                    <Select
                      value={profileData.level}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 Level</SelectItem>
                        <SelectItem value="200">200 Level</SelectItem>
                        <SelectItem value="300">300 Level</SelectItem>
                        <SelectItem value="400">400 Level</SelectItem>
                        <SelectItem value="500">500 Level</SelectItem>
                        <SelectItem value="postgraduate">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => updateProfile('Student Information')}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Updating...' : 'Update Student Info'}
                  </Button>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <KeyRound size={24} />
                    Security Settings
                  </h3>

                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-700">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-gray-700">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={changePassword}
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EnhancedSettingsPage;
