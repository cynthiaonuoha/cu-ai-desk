
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, RefreshCw, Activity, Apple, Moon, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

const HealthTipsPage = () => {
  const [currentTip, setCurrentTip] = useState<HealthTip | null>(null);
  const [tips] = useState<HealthTip[]>([
    {
      id: '1',
      title: 'Stay Hydrated',
      content: 'Drink at least 8 glasses of water daily. Proper hydration improves concentration, reduces fatigue, and helps maintain physical performance during long study sessions.',
      category: 'Hydration',
      icon: '💧'
    },
    {
      id: '2',
      title: 'Regular Exercise',
      content: 'Aim for 30 minutes of physical activity daily. Exercise boosts brain function, reduces stress hormones, and improves sleep quality.',
      category: 'Fitness',
      icon: '🏃'
    },
    {
      id: '3',
      title: 'Healthy Sleep Schedule',
      content: 'Get 7-9 hours of quality sleep each night. Good sleep consolidates memory, improves focus, and supports overall mental health.',
      category: 'Sleep',
      icon: '😴'
    },
    {
      id: '4',
      title: 'Nutritious Meals',
      content: 'Eat balanced meals with fruits, vegetables, whole grains, and lean proteins. Avoid excessive caffeine and sugar that can cause energy crashes.',
      category: 'Nutrition',
      icon: '🥗'
    },
    {
      id: '5',
      title: 'Take Study Breaks',
      content: 'Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Take longer breaks every hour to stretch and move.',
      category: 'Breaks',
      icon: '⏰'
    },
    {
      id: '6',
      title: 'Manage Stress',
      content: 'Practice deep breathing, meditation, or mindfulness exercises. Talk to friends, counselors, or family when feeling overwhelmed.',
      category: 'Mental Health',
      icon: '🧘'
    }
  ]);

  useEffect(() => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
  }, [tips]);

  const getNewTip = () => {
    const availableTips = tips.filter(tip => tip.id !== currentTip?.id);
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
    setCurrentTip(randomTip);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Hydration': 'bg-blue-100 text-blue-800',
      'Fitness': 'bg-green-100 text-green-800',
      'Sleep': 'bg-purple-100 text-purple-800',
      'Nutrition': 'bg-orange-100 text-orange-800',
      'Breaks': 'bg-yellow-100 text-yellow-800',
      'Mental Health': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Hydration': Droplets,
      'Fitness': Activity,
      'Sleep': Moon,
      'Nutrition': Apple,
      'Breaks': Activity,
      'Mental Health': Heart
    };
    return icons[category as keyof typeof icons] || Heart;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
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
            className="text-4xl font-bold text-green-800 mb-2 font-serif"
          >
            💚 Health & Wellness Tips
          </motion.h1>
          <p className="text-green-600">Maintain your well-being while excelling academically</p>
        </div>

        {/* Current Tip Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <AnimatePresence mode="wait">
            {currentTip && (
              <motion.div
                key={currentTip.id}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="shadow-2xl border-green-100 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-blue-500 text-white relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute top-4 right-4 text-4xl"
                    >
                      {currentTip.icon}
                    </motion.div>
                    <CardTitle className="text-2xl font-bold mb-2">
                      {currentTip.title}
                    </CardTitle>
                    <Badge className={`w-fit ${getCategoryColor(currentTip.category)}`}>
                      {currentTip.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg leading-relaxed text-gray-700"
                    >
                      {currentTip.content}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Get New Tip Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <Button
            onClick={getNewTip}
            className="bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white px-8 py-3 text-lg shadow-lg"
          >
            <RefreshCw size={20} className="mr-2" />
            Get New Tip
          </Button>
        </motion.div>

        {/* All Tips Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Health Categories</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from(new Set(tips.map(tip => tip.category))).map((category, index) => {
              const CategoryIcon = getCategoryIcon(category);
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-green-100 hover:border-green-300 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="mb-3"
                      >
                        <CategoryIcon size={32} className="mx-auto text-green-600" />
                      </motion.div>
                      <h3 className="font-semibold text-green-800">{category}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tips.filter(tip => tip.category === category).length} tips
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HealthTipsPage;
