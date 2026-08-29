
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface AuthHeaderProps {
  isLogin: boolean;
}

const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <div className="text-center space-y-4 px-4 sm:px-6">
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="relative">
          <img 
            src="/lovable-uploads/be140c00-8e6f-44bd-ba21-52a2e9a0090e.png" 
            alt="Covenant University Logo" 
            className="h-16 w-16 sm:h-20 sm:w-20 floating-animation"
          />
          <motion.div
            className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 opacity-20 blur-lg"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 font-playfair mb-2">
          CU AI Desk
        </h1>
        <div className="flex items-center justify-center gap-2 text-purple-600">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-medium">Covenant University</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {isLogin ? "Welcome Back! 👋" : "Join CU AI Desk 🚀"}
        </h2>
        <p className="text-purple-600 mt-2 text-sm sm:text-base">
          {isLogin 
            ? "Sign in to access your intelligent study companion" 
            : "Create your account to enhance your academic journey"
          }
        </p>
      </motion.div>
    </div>
  );
};

export default AuthHeader;
