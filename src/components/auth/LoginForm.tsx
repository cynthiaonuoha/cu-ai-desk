
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onForgotPassword
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
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
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Please wait...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full text-xs sm:text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50"
        onClick={onForgotPassword}
      >
        Forgot Password? 🔑
      </Button>
    </form>
  );
};

export default LoginForm;
