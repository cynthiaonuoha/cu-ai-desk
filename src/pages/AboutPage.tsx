import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, GraduationCap, Code, Heart, Instagram, Lightbulb, Users, Sparkles } from "lucide-react";

const AboutPage = () => {
  const [imageError, setImageError] = useState(false);

  // Refs for scroll animations
  const headerRef = useRef(null);
  const storyRef = useRef(null);
  const contentRef = useRef(null);
  const achievementsRef = useRef(null);
  const contactRef = useRef(null);

  // useInView hooks for scroll-triggered animations
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const isStoryInView = useInView(storyRef, { once: true, margin: "-100px" });
  const isContentInView = useInView(contentRef, { once: true, margin: "-100px" });
  const isAchievementsInView = useInView(achievementsRef, { once: true, margin: "-100px" });
  const isContactInView = useInView(contactRef, { once: true, margin: "-100px" });

  const skills = [
    "React", "TypeScript", "Node.js", "Python", "JavaScript", "HTML/CSS",
    "Supabase", "PostgreSQL", "Git", "Tailwind CSS", "AI/ML", "Web Development",
    "Electrical Engineering", "Computer Engineering", "Circuit Design", "Digital Systems"
  ];

  const achievements = [
    "Graduated with BEng in Computer Engineering from Covenant University, Department of Electrical and Information Engineering",
    "Built CU AI Desk - a comprehensive platform helping thousands of students excel academically",
    "Successfully integrated AI technology with educational tools to solve real student problems",
    "Developed full-stack applications using modern web technologies and engineering principles",
    "Applied engineering problem-solving methodologies to create innovative software solutions",
    "Bridged the gap between traditional engineering education and modern AI-powered learning tools"
  ];

  const creatorStory = [
    {
      icon: Lightbulb,
      title: "The Spark of Inspiration",
      content: "During my final year in Computer Engineering, I watched my classmates struggle with overwhelming academic workloads, scattered notes, and the constant juggling of assignments, deadlines, and social connections. I realized that while we were learning to build complex systems, we lacked a simple, intelligent system to organize our own academic lives."
    },
    {
      icon: Heart,
      title: "A Personal Mission",
      content: "Having experienced the stress of engineering coursework firsthand - from circuit design projects to programming assignments - I knew there had to be a better way. I wanted to create something that would not just manage tasks, but truly understand and support the unique challenges faced by university students, especially in demanding fields like engineering."
    },
    {
      icon: Users,
      title: "Building for Community",
      content: "CU AI Desk was born from a desire to create more than just another productivity app. I envisioned a platform where students could not only organize their academic lives but also connect with peers, share knowledge, and build meaningful relationships. The social features were inspired by the collaborative spirit I witnessed in my engineering cohort."
    },
    {
      icon: Sparkles,
      title: "The AI Revolution in Education",
      content: "Combining my engineering background with emerging AI technologies, I saw an opportunity to create something revolutionary. CU AI Desk doesn't just store your notes - it understands them, summarizes them, and helps you learn more effectively. It's like having a brilliant study buddy who never sleeps and is always ready to help."
    }
  ];

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) {
      return "/lovable-uploads/be140c00-8e6f-44bd-ba21-52a2e9a0090e.png"; // Fallback to CU logo
    }
    return "/lovable-uploads/4b1d59b6-5980-4cd5-abbe-ec4334f9b3f3.png"; // Updated to your new picture
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-amber-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header Section */}
            <div ref={headerRef} className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isHeaderInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative inline-block mb-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <img 
                    src={getImageSrc()}
                    alt="Cynthia Onuoha - Creator of CU AI Desk" 
                    className="relative w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-white ring-4 ring-purple-200 transition-all duration-500 group-hover:shadow-3xl group-hover:ring-purple-300"
                    onError={handleImageError}
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20"
                  ></motion.div>
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-full shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl font-bold text-gray-800 mb-6 font-playfair bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
              >
                Meet Cynthia Onuoha
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium"
              >
                BEng in Computer Engineering graduate from Covenant University's Department of Electrical and Information Engineering, 
                who transformed her passion for solving student challenges into CU AI Desk - an intelligent platform that's revolutionizing how students learn, organize, and connect.
              </motion.p>
            </div>

            {/* Creator Story Section */}
            <div ref={storyRef} className="mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isStoryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold text-center text-gray-800 mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                The Story Behind CU AI Desk
              </motion.h2>
              <div className="grid md:grid-cols-2 gap-8">
                {creatorStory.map((story, index) => {
                  const Icon = story.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={isStoryInView ? { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1 
                      } : { 
                        opacity: 0, 
                        y: 50, 
                        scale: 0.9 
                      }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.2,
                        ease: "easeOut"
                      }}
                      whileHover={{ scale: 1.03, y: -8 }}
                      className="group"
                    >
                      <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-sm group-hover:from-purple-50 group-hover:to-blue-50">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-4 mb-4">
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.2 }}
                              transition={{ duration: 0.5 }}
                              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white shadow-lg"
                            >
                              <Icon className="w-6 h-6" />
                            </motion.div>
                            <CardTitle className="text-xl text-purple-700 font-semibold group-hover:text-purple-800 transition-colors">
                              {story.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-800 transition-colors">
                            {story.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Grid */}
            <div ref={contentRef} className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Engineering Journey */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={isContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50 group hover:from-purple-50 hover:to-purple-100">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-purple-700 text-3xl group-hover:text-purple-800 transition-colors">
                      <Heart className="w-8 h-8" />
                      My Engineering Journey
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      From Computer Engineering to AI Innovation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-800 transition-colors">
                      I graduated with a Bachelor of Engineering (BEng) in Computer Engineering from Covenant University's Department of Electrical and Information Engineering. Throughout my studies, I was fascinated by the intersection of hardware and software, and how engineering principles could solve real-world problems.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-800 transition-colors">
                      Witnessing the daily struggles of my fellow engineering students - managing complex coursework, tracking assignments, and maintaining social connections - sparked an idea. I realized I could apply my engineering problem-solving skills to create a solution that would genuinely make a difference in students' lives.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-800 transition-colors">
                      CU AI Desk became my capstone project in a way - not just a technical achievement, but a heartfelt solution to help students thrive academically while staying connected with their peers. It represents everything I learned about building systems that truly serve their users.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Technical Skills */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={isContentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-blue-50 group hover:from-blue-50 hover:to-blue-100">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-blue-700 text-3xl group-hover:text-blue-800 transition-colors">
                      <Code className="w-8 h-8" />
                      Technical Expertise
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Engineering and Development Skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {skills.map((skill, index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={isContentInView ? { 
                            opacity: 1, 
                            scale: 1, 
                            y: 0 
                          } : { 
                            opacity: 0, 
                            scale: 0.8, 
                            y: 20 
                          }}
                          transition={{ 
                            duration: 0.3, 
                            delay: 0.6 + index * 0.05,
                            ease: "easeOut"
                          }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant="outline" 
                            className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-300 text-sm py-1 px-3 cursor-pointer hover:shadow-md"
                          >
                            {skill}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Achievements */}
            <div ref={achievementsRef} className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={isAchievementsInView ? { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1 
                } : { 
                  opacity: 0, 
                  y: 50, 
                  scale: 0.95 
                }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.01, y: -5 }}
              >
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-amber-50 hover:from-amber-50 hover:to-orange-50 group">
                  <CardHeader className="pb-8">
                    <CardTitle className="flex items-center gap-4 text-amber-700 text-3xl group-hover:text-amber-800 transition-colors">
                      <GraduationCap className="w-8 h-8" />
                      Key Achievements & Milestones
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Highlights from my academic and development journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -30, scale: 0.95 }}
                          animate={isAchievementsInView ? { 
                            opacity: 1, 
                            x: 0, 
                            scale: 1 
                          } : { 
                            opacity: 0, 
                            x: -30, 
                            scale: 0.95 
                          }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.3 + index * 0.1,
                            ease: "easeOut"
                          }}
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="flex items-start gap-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 group cursor-pointer hover:from-amber-100 hover:to-orange-100"
                        >
                          <motion.div 
                            className="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-2 flex-shrink-0 shadow-md"
                            whileHover={{ scale: 1.3, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          ></motion.div>
                          <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-800 transition-colors font-medium">{achievement}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact Information */}
            <div ref={contactRef} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={isContactInView ? { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1 
                } : { 
                  opacity: 0, 
                  y: 60, 
                  scale: 0.9 
                }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  bounce: 0.4
                }}
              >
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 group">
                  <CardHeader className="pb-8">
                    <CardTitle className="text-gray-800 text-3xl group-hover:text-gray-900 transition-colors">Let's Connect!</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Reach out on any of these platforms - I'd love to hear from you!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center flex-wrap gap-8">
                      <motion.a
                        href="mailto:cynthiaonuohaa@gmail.com"
                        className="flex items-center gap-4 text-gray-600 hover:text-purple-600 transition-all duration-300 p-4 rounded-xl hover:bg-purple-50 group"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Mail className="w-6 h-6 group-hover:text-purple-700 transition-colors" />
                        <span className="font-semibold text-lg">Email</span>
                      </motion.a>
                      <motion.a
                        href="https://github.com/cynthyy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 text-gray-600 hover:text-purple-600 transition-all duration-300 p-4 rounded-xl hover:bg-purple-50 group"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Github className="w-6 h-6 group-hover:text-purple-700 transition-colors" />
                        <span className="font-semibold text-lg">GitHub</span>
                      </motion.a>
                      <motion.a
                        href="https://www.linkedin.com/in/cynthia-onuoha-072b18201"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 text-gray-600 hover:text-purple-600 transition-all duration-300 p-4 rounded-xl hover:bg-purple-50 group"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Linkedin className="w-6 h-6 group-hover:text-purple-700 transition-colors" />
                        <span className="font-semibold text-lg">LinkedIn</span>
                      </motion.a>
                      <motion.a
                        href="https://instagram.com/cynthyy.y"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 text-gray-600 hover:text-purple-600 transition-all duration-300 p-4 rounded-xl hover:bg-purple-50 group"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Instagram className="w-6 h-6 group-hover:text-purple-700 transition-colors" />
                        <span className="font-semibold text-lg">Instagram</span>
                      </motion.a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
