
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData } from '@/types/reminders';

interface ReminderFormProps {
  onAddReminder: (formData: FormData) => Promise<boolean>;
}

export const ReminderForm = ({ onAddReminder }: ReminderFormProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    time: ''
  });

  const handleSubmit = async () => {
    const success = await onAddReminder(formData);
    if (success) {
      setFormData({ title: '', description: '', date: '', time: '' });
      setShowForm(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 text-center"
      >
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          <Plus size={20} className="mr-2" />
          Create New Reminder
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="shadow-xl border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Bell size={24} />
                  New Reminder
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Input
                  placeholder="Reminder title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="border-purple-200 focus:border-purple-500"
                />
                <Textarea
                  placeholder="Description (optional)..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-purple-200 focus:border-purple-500"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="border-purple-200 focus:border-purple-500"
                  />
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!formData.title || !formData.date || !formData.time}
                  >
                    Create Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
