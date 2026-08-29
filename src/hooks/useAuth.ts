
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Clean up any existing auth state
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Welcome back to CU AI Desk! 😊");
      navigate("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      // Clean up any existing auth state
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username,
            display_name: username
          }
        }
      });
      if (error) throw error;
      
      if (data.user && data.session) {
        toast.success("Welcome to CU AI Desk! 🎉");
        navigate("/");
      } else if (data.user && !data.session) {
        toast.success("Welcome to CU AI Desk! Please check your email to confirm your account. 📧");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    if (!email) {
      toast.error("Please enter your email address");
      return false;
    }

    setLoading(true);
    setEmailSending(true);
    
    try {
      console.log('🔄 Starting password reset for:', email);
      toast.success("Sending password reset email... 📧", { duration: 1000 });
      
      // Use Supabase's native email system directly - it's reliable and immediate
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('❌ Password reset failed:', error);
        throw error;
      }
      
      console.log('✅ Password reset email sent successfully');
      toast.success("Password reset email sent! Please check your inbox. 📬");
      return true;

    } catch (error: any) {
      console.error("❌ Password reset error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
      return false;
    } finally {
      setLoading(false);
      setEmailSending(false);
    }
  };

  return {
    loading,
    emailSending,
    handleSignIn,
    handleSignUp,
    handlePasswordReset
  };
};
