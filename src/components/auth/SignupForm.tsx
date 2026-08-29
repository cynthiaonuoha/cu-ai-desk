
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

interface SignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  username: string;
  setUsername: (username: string) => void;
  loading: boolean;
  emailSending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const SignupForm = ({
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  loading,
  emailSending,
  onSubmit
}: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {emailSending && (
        <div className="mb-4 flex items-center justify-center space-x-2 text-purple-600 bg-purple-50 p-3 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Preparing your welcome email...</span>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="username" className="text-purple-700 font-medium text-sm sm:text-base">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
              required
            />
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-purple-700 font-medium text-sm sm:text-base">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-purple-700 font-medium text-sm sm:text-base">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-purple-400 hover:text-purple-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full cu-button glow-hover text-sm sm:text-base"
          disabled={loading || emailSending}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Please wait...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>
    </>
  );
};

export default SignupForm;
