
-- Add new columns to the profiles table for enhanced user information
ALTER TABLE public.profiles 
ADD COLUMN bio TEXT,
ADD COLUMN phone_number TEXT,
ADD COLUMN location TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN student_id TEXT,
ADD COLUMN department TEXT,
ADD COLUMN level TEXT,
ADD COLUMN profile_completion_percentage INTEGER DEFAULT 0;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create RLS policies for the avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_count INTEGER := 0;
    total_fields INTEGER := 8;
BEGIN
    SELECT 
        (CASE WHEN username IS NOT NULL AND username != '' THEN 1 ELSE 0 END) +
        (CASE WHEN display_name IS NOT NULL AND display_name != '' THEN 1 ELSE 0 END) +
        (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
        (CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 ELSE 0 END) +
        (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
        (CASE WHEN date_of_birth IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN student_id IS NOT NULL AND student_id != '' THEN 1 ELSE 0 END) +
        (CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END)
    INTO completion_count
    FROM public.profiles
    WHERE id = profile_id;
    
    RETURN (completion_count * 100 / total_fields);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();
