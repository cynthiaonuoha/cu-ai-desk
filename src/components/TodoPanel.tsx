
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, Check, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  category: string;
  priority: string; // 'low', 'medium', 'high'
  due_date?: string;
}

const categories = ["Today", "Academic", "Health", "Fitness"];
const priorityLevels = {
  "low": 1,
  "medium": 2,
  "high": 3
};

const TodoPanel = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [activeCategory, setActiveCategory] = useState('Today');
  const [newTaskCategory, setNewTaskCategory] = useState('Today');
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask,
          category: newTaskCategory,
          priority: newTaskPriority,
          is_completed: false,
          user_id: user.id
        })
        .select();

      if (error) throw error;
      
      if (data) {
        setTasks([...data, ...tasks]);
        setNewTask('');
        toast.success('Task added successfully');
      }
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const toggleCompletion = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, is_completed: !currentStatus } : task
      ));
      
      toast.success(`Task ${!currentStatus ? 'completed' : 'uncompleted'}`);
    } catch (error: any) {
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

      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const togglePriority = async (id: string, currentPriority: string) => {
    const priorities = ["low", "medium", "high"];
    const currentIndex = priorities.indexOf(currentPriority);
    const newPriority = priorities[(currentIndex + 1) % 3];
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, priority: newPriority } : task
      ));
    } catch (error: any) {
      console.error('Error updating task priority:', error);
      toast.error('Failed to update task priority');
    }
  };

  // Filter tasks by active category
  const filteredTasks = tasks.filter(task => task.category === activeCategory);
  
  // Calculate progress for each category
  const calculateProgress = (category: string) => {
    const categoryTasks = tasks.filter(task => task.category === category);
    if (categoryTasks.length === 0) return 0;
    
    const completedTasks = categoryTasks.filter(task => task.is_completed).length;
    return Math.round((completedTasks / categoryTasks.length) * 100);
  };

  // Calculate overall progress
  const overallProgress = tasks.length > 0 
    ? Math.round((tasks.filter(task => task.is_completed).length / tasks.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-white/50 rounded-lg shadow-lg">
      <div className="p-4 bg-covenant-primary text-white rounded-t-lg">
        <h2 className="text-xl font-playfair font-semibold">To-Do List</h2>
        <div className="mt-2">
          <Progress value={overallProgress} className="h-2 bg-white/20" />
          <p className="text-sm mt-1">{overallProgress}% Complete</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto p-2 bg-covenant-primary/5">
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 mx-1 rounded-md whitespace-nowrap ${
              activeCategory === category
                ? 'bg-covenant-primary text-white'
                : 'bg-white/70 hover:bg-covenant-accent/20'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
            <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              {tasks.filter(t => t.category === category).length}
            </span>
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      <div className="p-3 border-b">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
        >
          <div className="flex gap-2">
            <Input
              placeholder="Add new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="bg-covenant-primary hover:bg-covenant-primary/90"
              disabled={!newTask.trim() || loading}
            >
              <Plus size={18} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                <SelectTrigger className="w-full">
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
              <Select 
                value={newTaskPriority} 
                onValueChange={setNewTaskPriority}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </div>

      {/* Category Progress */}
      <div className="p-3 bg-covenant-accent/10">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{activeCategory}</h3>
          <span className="text-sm text-covenant-primary">
            {calculateProgress(activeCategory)}% Complete
          </span>
        </div>
        <Progress value={calculateProgress(activeCategory)} className="mt-1 h-1.5" />
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-covenant-primary"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <ul className="space-y-2">
            {filteredTasks
              .sort((a, b) => {
                // Sort by priority (high to low) then by completion status
                if (a.is_completed && !b.is_completed) return 1;
                if (!a.is_completed && b.is_completed) return -1;
                
                const priorityA = priorityLevels[a.priority as keyof typeof priorityLevels] || 0;
                const priorityB = priorityLevels[b.priority as keyof typeof priorityLevels] || 0;
                
                return priorityB - priorityA;
              })
              .map((task) => (
                <li 
                  key={task.id} 
                  className={`flex items-center p-2 rounded-lg ${
                    task.is_completed 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-white'
                  } animate-fade-in`}
                >
                  <Checkbox 
                    checked={task.is_completed} 
                    onCheckedChange={() => toggleCompletion(task.id, task.is_completed)}
                    className="mr-3"
                  />
                  
                  <span 
                    className={`flex-1 ${task.is_completed ? 'line-through' : ''}`}
                  >
                    {task.title}
                  </span>
                  
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => togglePriority(task.id, task.priority)}
                      className="h-8 w-8"
                    >
                      <Star 
                        size={16} 
                        className={priorityLevels[task.priority as keyof typeof priorityLevels] >= 1 ? 'fill-yellow-400' : ''}
                        fill={priorityLevels[task.priority as keyof typeof priorityLevels] >= 1 ? "currentColor" : "none"}
                      />
                      {priorityLevels[task.priority as keyof typeof priorityLevels] > 1 && (
                        <Star 
                          size={14} 
                          className={`absolute translate-x-1 translate-y-1 ${priorityLevels[task.priority as keyof typeof priorityLevels] >= 2 ? 'fill-yellow-400' : ''}`}
                          fill={priorityLevels[task.priority as keyof typeof priorityLevels] >= 2 ? "currentColor" : "none"}
                        />
                      )}
                      {priorityLevels[task.priority as keyof typeof priorityLevels] > 2 && (
                        <Star 
                          size={12} 
                          className={`absolute translate-x-2 translate-y-2 ${priorityLevels[task.priority as keyof typeof priorityLevels] >= 3 ? 'fill-yellow-400' : ''}`}
                          fill={priorityLevels[task.priority as keyof typeof priorityLevels] >= 3 ? "currentColor" : "none"}
                        />
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" 
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Check size={40} className="mb-2" />
            <p>No {activeCategory.toLowerCase()} tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPanel;
