
-- Extend profiles table with social fields
ALTER TABLE public.profiles 
ADD COLUMN interests TEXT[],
ADD COLUMN privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
ADD COLUMN show_email BOOLEAN DEFAULT false,
ADD COLUMN show_phone BOOLEAN DEFAULT false,
ADD COLUMN allow_friend_requests BOOLEAN DEFAULT true,
ADD COLUMN social_bio TEXT,
ADD COLUMN social_links JSONB DEFAULT '{}';

-- Create friendships table for managing connections between users
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Create groups table for community features
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT DEFAULT 'study' CHECK (group_type IN ('study', 'department', 'interest', 'project')),
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'invite_only')),
  department TEXT,
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table for managing group membership
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create social_interactions table for tracking likes, follows, etc.
CREATE TABLE public.social_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL, -- Can reference users, posts, notes, etc.
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'note', 'post', 'group')),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'follow', 'bookmark', 'report')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type, interaction_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" 
  ON public.friendships 
  FOR ALL 
  USING (auth.uid() IN (requester_id, addressee_id));

-- RLS Policies for groups
CREATE POLICY "Users can view public groups" 
  ON public.groups 
  FOR SELECT 
  USING (privacy_level = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create groups" 
  ON public.groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
  ON public.groups 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view group memberships for public groups" 
  ON public.group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id AND privacy_level = 'public'
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own group memberships" 
  ON public.group_members 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for social_interactions
CREATE POLICY "Users can manage their own social interactions" 
  ON public.social_interactions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_groups_type ON public.groups(group_type);
CREATE INDEX idx_groups_department ON public.groups(department);
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_social_interactions_target ON public.social_interactions(target_id, target_type);
CREATE INDEX idx_social_interactions_user ON public.social_interactions(user_id);

-- Create function to get mutual friends count
CREATE OR REPLACE FUNCTION get_mutual_friends_count(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
DECLARE
    mutual_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO mutual_count
    FROM (
        SELECT addressee_id as friend_id FROM public.friendships 
        WHERE requester_id = user1_id AND status = 'accepted'
        UNION
        SELECT requester_id as friend_id FROM public.friendships 
        WHERE addressee_id = user1_id AND status = 'accepted'
    ) user1_friends
    INNER JOIN (
        SELECT addressee_id as friend_id FROM public.friendships 
        WHERE requester_id = user2_id AND status = 'accepted'
        UNION
        SELECT requester_id as friend_id FROM public.friendships 
        WHERE addressee_id = user2_id AND status = 'accepted'
    ) user2_friends ON user1_friends.friend_id = user2_friends.friend_id;
    
    RETURN mutual_count;
END;
$$ LANGUAGE plpgsql;

-- Update profile completion calculation to include new social fields
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_count INTEGER := 0;
    total_fields INTEGER := 12; -- Updated from 8 to 12
BEGIN
    SELECT 
        (CASE WHEN username IS NOT NULL AND username != '' THEN 1 ELSE 0 END) +
        (CASE WHEN display_name IS NOT NULL AND display_name != '' THEN 1 ELSE 0 END) +
        (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
        (CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 ELSE 0 END) +
        (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
        (CASE WHEN date_of_birth IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN student_id IS NOT NULL AND student_id != '' THEN 1 ELSE 0 END) +
        (CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END) +
        (CASE WHEN department IS NOT NULL AND department != '' THEN 1 ELSE 0 END) +
        (CASE WHEN level IS NOT NULL AND level != '' THEN 1 ELSE 0 END) +
        (CASE WHEN interests IS NOT NULL AND array_length(interests, 1) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN social_bio IS NOT NULL AND social_bio != '' THEN 1 ELSE 0 END)
    INTO completion_count
    FROM public.profiles
    WHERE id = profile_id;
    
    RETURN (completion_count * 100 / total_fields);
END;
$$ LANGUAGE plpgsql;
