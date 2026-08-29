
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";
import AuthBackground from "./AuthBackground";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  emailSending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const ForgotPasswordForm = ({
  email,
  setEmail,
  loading,
  emailSending,
  onSubmit,
  onBack
}: ForgotPasswordFormProps) => {
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
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center"
            >
              <img 
                src="/lovable-uploads/be140c00-8e6f-44bd-ba21-52a2e9a0090e.png" 
                alt="Covenant University Logo" 
                className="h-12 w-12 sm:h-16 sm:w-16 floating-animation"
              />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-purple-800 font-playfair">Reset Password</CardTitle>
            <CardDescription className="text-purple-600 text-sm sm:text-base">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
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
              
              {emailSending && (
                <div className="flex items-center justify-center space-x-2 text-purple-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Sending email...</span>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full cu-button text-sm sm:text-base" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Email"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-purple-600 hover:text-purple-800 hover:bg-purple-50 text-sm sm:text-base"
                onClick={onBack}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordForm;
