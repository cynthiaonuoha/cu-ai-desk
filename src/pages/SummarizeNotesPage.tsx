
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Brain, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const SummarizeNotesPage = () => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('comprehensive');

  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast.error('Please enter some notes to summarize');
      return;
    }
    
    setIsLoading(true);
    setSummary('');
    
    try {
      console.log('Calling AI summarize function...');
      
      const { data, error } = await supabase.functions.invoke('ai-summarize', {
        body: {
          text: notes,
          summaryType: summaryType
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate summary');
      }

      if (!data.success) {
        throw new Error(data.error || 'Summarization failed');
      }

      setSummary(data.summary);
      toast.success('Summary generated successfully!');
      
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
      setSummary('Sorry, I encountered an error while generating your summary. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const summaryTypeOptions = [
    { value: 'comprehensive', label: 'Comprehensive Summary', description: 'Detailed overview with key concepts' },
    { value: 'brief', label: 'Brief Summary', description: 'Quick 2-3 sentence overview' },
    { value: 'bullets', label: 'Bullet Points', description: 'Organized bullet-point format' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-purple-800 mb-2 font-serif"
          >
            📝 Smart Notes Summarizer
          </motion.h1>
          <p className="text-purple-600">Transform your lengthy notes into concise summaries with AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full shadow-xl border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={24} />
                  Your Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="Paste or type your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[300px] border-purple-200 focus:border-purple-500 resize-none mb-4"
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Type
                  </label>
                  <Select value={summaryType} onValueChange={setSummaryType}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {summaryTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {notes.length} characters
                  </span>
                  <Button
                    onClick={handleSummarize}
                    disabled={isLoading || !notes.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? (
                      <motion.div className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Summarizing...</span>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} />
                        <span>AI Summarize</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full shadow-xl border-amber-100">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Brain size={24} />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1.2 }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      className="text-purple-600 text-center"
                    >
                      <Brain size={48} className="mx-auto mb-4" />
                      <p className="text-lg font-medium">AI is analyzing your notes...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </motion.div>
                  </div>
                ) : summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose max-w-none"
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-amber-50 p-4 rounded-lg">
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(summary);
                          toast.success('Summary copied to clipboard!');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Copy Summary
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center min-h-[400px] text-gray-400">
                    <div className="text-center">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Your AI-generated summary will appear here</p>
                      <p className="text-sm mt-2">Enter your notes and click "AI Summarize" to get started</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Tips for Better Summaries</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <strong>Comprehensive:</strong> Best for detailed study material and complex topics
                </div>
                <div>
                  <strong>Brief:</strong> Perfect for quick reviews and key point extraction
                </div>
                <div>
                  <strong>Bullet Points:</strong> Great for organized study guides and presentations
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SummarizeNotesPage;
