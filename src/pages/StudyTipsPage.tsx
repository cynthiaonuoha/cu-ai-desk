
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RefreshCw, BookOpen, Clock, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

const StudyTipsPage = () => {
  const [currentTip, setCurrentTip] = useState<StudyTip | null>(null);
  const [tips] = useState<StudyTip[]>([
    {
      id: '1',
      title: 'Pomodoro Technique',
      content: 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break. This helps maintain focus and prevents burnout.',
      category: 'Time Management',
      icon: '🍅'
    },
    {
      id: '2',
      title: 'Active Recall',
      content: 'Instead of just re-reading notes, actively test yourself. Close your books and try to recall what you just studied. This strengthens memory retention.',
      category: 'Memory',
      icon: '🧠'
    },
    {
      id: '3',
      title: 'Spaced Repetition',
      content: 'Review information at increasing intervals. Study today, tomorrow, then in 3 days, then a week later. This combats the forgetting curve.',
      category: 'Retention',
      icon: '📅'
    },
    {
      id: '4',
      title: 'Environment Optimization',
      content: 'Create a dedicated study space free from distractions. Good lighting, comfortable temperature, and minimal noise help maintain concentration.',
      category: 'Environment',
      icon: '🏠'
    },
    {
      id: '5',
      title: 'Teach Others',
      content: 'Explain concepts to classmates or even to yourself out loud. If you can teach it, you truly understand it. This reveals knowledge gaps.',
      category: 'Understanding',
      icon: '👥'
    },
    {
      id: '6',
      title: 'Practice Tests',
      content: 'Take practice exams under timed conditions. This builds familiarity with exam format and helps identify weak areas before the real test.',
      category: 'Exam Prep',
      icon: '📝'
    }
  ]);

  useEffect(() => {
    // Set initial tip
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
      'Time Management': 'bg-blue-100 text-blue-800',
      'Memory': 'bg-purple-100 text-purple-800',
      'Retention': 'bg-green-100 text-green-800',
      'Environment': 'bg-yellow-100 text-yellow-800',
      'Understanding': 'bg-pink-100 text-pink-800',
      'Exam Prep': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Time Management': Clock,
      'Memory': Brain,
      'Retention': BookOpen,
      'Environment': Lightbulb,
      'Understanding': BookOpen,
      'Exam Prep': BookOpen
    };
    return icons[category as keyof typeof icons] || Lightbulb;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 p-6">
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
            className="text-4xl font-bold text-purple-800 mb-2 font-serif"
          >
            🎓 Study Tips & Strategies
          </motion.h1>
          <p className="text-purple-600">Boost your academic performance with proven techniques</p>
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
                <Card className="shadow-2xl border-purple-100 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-amber-500 text-white relative">
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
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white px-8 py-3 text-lg shadow-lg"
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
          <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Study Categories</h2>
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
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-purple-100 hover:border-purple-300 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="mb-3"
                      >
                        <CategoryIcon size={32} className="mx-auto text-purple-600" />
                      </motion.div>
                      <h3 className="font-semibold text-purple-800">{category}</h3>
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

export default StudyTipsPage;
