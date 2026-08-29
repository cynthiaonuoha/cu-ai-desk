
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const categories = ["Academic", "Health", "Fitness", "Social", "General"];

// Helper function to ensure priority is valid
const validatePriority = (priority: string | null): 'high' | 'medium' | 'low' => {
  if (priority === 'high' || priority === 'medium' || priority === 'low') {
    return priority;
  }
  return 'medium'; // Default fallback
};

// Helper function to transform database task to Task interface
const transformDatabaseTask = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || undefined,
  is_completed: Boolean(dbTask.is_completed),
  priority: validatePriority(dbTask.priority),
  due_date: dbTask.due_date || undefined,
  category: dbTask.category || 'General',
  created_at: dbTask.created_at,
  updated_at: dbTask.updated_at
});

const TodoPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Load tasks when user is authenticated
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database tasks to match our Task interface
      const transformedTasks = (data || []).map(transformDatabaseTask);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask,
          priority: newTaskPriority,
          category: newTaskCategory,
          user_id: user.id,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the new task and add to state
      const transformedTask = transformDatabaseTask(data);
      setTasks(prev => [transformedTask, ...prev]);
      setNewTask('');
      setNewTaskPriority('medium');
      setNewTaskCategory('General');
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_completed: !task.is_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, is_completed: !task.is_completed } : task
      ));
      
      toast.success(task.is_completed ? 'Task marked as pending' : 'Task completed!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
            ✅ Task Manager
          </motion.h1>
          <p className="text-purple-600">Stay organized and productive</p>
        </div>

        {/* Add Task Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Plus size={24} />
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="What do you need to do?"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="flex-1 border-purple-200 focus:border-purple-500"
                    disabled={isAdding}
                  />
                  <Button
                    onClick={addTask}
                    disabled={isAdding || !newTask.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    {isAdding ? 'Adding...' : 'Add Task'}
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Select value={newTaskPriority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewTaskPriority(value)}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mb-6 justify-center"
        >
          {(['all', 'pending', 'completed'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              onClick={() => setFilter(filterType)}
              className={filter === filterType ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 text-purple-600 hover:bg-purple-50"}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-purple-600">Loading your tasks...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`shadow-lg transition-all duration-300 hover:shadow-xl ${
                    task.is_completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-purple-100'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className={`text-sm mt-1 ${
                              task.is_completed ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                              {task.category}
                            </Badge>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar size={14} />
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.is_completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-500"
                            >
                              <CheckCircle2 size={24} />
                            </motion.div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'all' ? 'No tasks found. Add your first task above!' : 
               filter === 'pending' ? 'No pending tasks. Great job!' : 
               'No completed tasks yet. Keep working!'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TodoPage;
