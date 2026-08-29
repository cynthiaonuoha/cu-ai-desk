
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth as useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthHeader from "@/components/auth/AuthHeader";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { loading, emailSending, handleSignIn, handleSignUp, handlePasswordReset } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await handleSignIn(email, password);
    } else {
      await handleSignUp(email, password, username);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handlePasswordReset(email);
    if (success) {
      setShowForgotPassword(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        email={email}
        setEmail={setEmail}
        loading={loading}
        emailSending={emailSending}
        onSubmit={handleForgotPassword}
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="cu-card">
          <CardHeader>
            <AuthHeader isLogin={isLogin} />
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            {isLogin ? (
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                onSubmit={handleAuth}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            ) : (
              <SignupForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                username={username}
                setUsername={setUsername}
                loading={loading}
                emailSending={emailSending}
                onSubmit={handleAuth}
              />
            )}

            <div className="mt-4 sm:mt-6 text-center space-y-4">
              <div className="text-xs sm:text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Button
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-800 p-0 h-auto font-medium hover:bg-transparent text-xs sm:text-sm"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
