
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Bot, 
  BookOpen, 
  CheckSquare, 
  Bell, 
  GraduationCap,
  Heart,
  Calculator,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout/Layout";

const Index = () => {
  const features = [
    {
      icon: Bot,
      title: "CU-AI Chat",
      description: "Your intelligent study companion for all university questions",
      path: "/chatbot",
      color: "from-purple-500 to-blue-600",
      emoji: "🤖"
    },
    {
      icon: BookOpen,
      title: "Smart Notes",
      description: "Organize and summarize your study materials effortlessly",
      path: "/summarize",
      color: "from-emerald-500 to-teal-600",
      emoji: "📚"
    },
    {
      icon: CheckSquare,
      title: "Task Manager",
      description: "Stay on top of assignments and deadlines",
      path: "/todo",
      color: "from-purple-500 to-pink-600",
      emoji: "✅"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss important deadlines and events",
      path: "/reminders",
      color: "from-orange-500 to-red-600",
      emoji: "⏰"
    },
    {
      icon: GraduationCap,
      title: "Study Tips",
      description: "Proven strategies to boost your academic performance",
      path: "/study-tips",
      color: "from-indigo-500 to-purple-600",
      emoji: "🎓"
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Maintain your wellbeing during your academic journey",
      path: "/health-tips",
      color: "from-pink-500 to-rose-600",
      emoji: "💚"
    },
    {
      icon: Calculator,
      title: "Calculator",
      description: "Quick calculations for your academic work",
      path: "/calculator",
      color: "from-teal-500 to-cyan-600",
      emoji: "🧮"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* University Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/d7726cc8-b266-4fe1-b563-dbfcbbbf7e9c.png" 
                alt="Covenant University Logo" 
                className="h-20 w-20 md:h-24 md:w-24 floating-animation rounded-full"
              />
              <motion.div
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 opacity-20 blur-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="cu-header text-center mb-4 bounce-in"
          >
            Welcome to CU AI Desk
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
          >
            <p className="text-lg md:text-xl text-purple-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Your intelligent companion for academic excellence and personal wellbeing at Covenant University 
              <motion.span
                className="inline-block ml-2"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                ✨
              </motion.span>
            </p>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="h-full"
            >
              <Link to={feature.path} className="block h-full">
                <Card className="h-full cu-card group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className="relative mb-4">
                      <motion.div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <motion.div
                        className="absolute -top-1 -right-1 text-2xl"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      >
                        {feature.emoji}
                      </motion.div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-0 h-auto font-medium group-hover:translate-x-2 transition-all duration-300"
                    >
                      Get Started 
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer with Sparkles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-16 py-8"
        >
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-medium">Empowering Covenant University Students</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
