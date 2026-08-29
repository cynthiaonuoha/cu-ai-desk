
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Edit, Save, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
  isExpanded: boolean;
  isEditing: boolean;
}

const colors = [
  'border-purple-400',
  'border-blue-400',
  'border-green-400',
  'border-yellow-400',
  'border-red-400',
];

const NotesPanel = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: colors[0] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notesWithUI = (data || []).map(note => ({
        ...note,
        isExpanded: true,
        isEditing: false
      }));

      setNotes(notesWithUI);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (newNote.title.trim() === '' || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: newNote.title,
          content: newNote.content,
          color: newNote.color,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const noteWithUI = {
        ...data,
        isExpanded: true,
        isEditing: false
      };
      
      setNotes([noteWithUI, ...notes]);
      setNewNote({ title: '', content: '', color: colors[0] });
      setIsCreating(false);
      toast.success('Note created successfully');
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error('Failed to create note');
    }
  };

  const toggleExpand = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isExpanded: !note.isExpanded } : note
    ));
  };

  const toggleEdit = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isEditing: !note.isEditing } : note
    ));
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          title, 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === id ? { ...note, title, content, isEditing: false } : note
      ));

      toast.success('Note updated successfully');
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success('Note deleted successfully');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const changeColor = async (id: string) => {
    const note = notes.find(note => note.id === id);
    if (!note) return;

    const currentIndex = colors.indexOf(note.color);
    const nextIndex = (currentIndex + 1) % colors.length;
    const newColor = colors[nextIndex];

    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          color: newColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.map(n => 
        n.id === id ? { ...n, color: newColor } : n
      ));
    } catch (error: any) {
      console.error('Error updating note color:', error);
      toast.error('Failed to update note color');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 rounded-lg shadow-lg">
      <div className="p-4 bg-covenant-primary text-white rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-playfair font-semibold">Notes</h2>
        <Button 
          variant="outline" 
          size="icon" 
          className="text-white border-white hover:bg-white/20 hover:text-white"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? <X size={18} /> : <Plus size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-covenant-primary"></div>
          </div>
        )}

        {/* New Note Form */}
        {isCreating && (
          <div className="card-note border-l-4 border-covenant-accent mb-5 animate-pop">
            <Input
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="mb-2 font-medium"
            />
            <Textarea
              placeholder="Note Content"
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="mb-2"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {colors.map((color, index) => (
                  <button 
                    key={index}
                    onClick={() => setNewNote({...newNote, color})}
                    className={`w-5 h-5 rounded-full border ${color} ${newNote.color === color ? 'ring-2 ring-covenant-primary' : ''}`}
                  />
                ))}
              </div>
              <Button 
                size="sm" 
                onClick={handleAddNote}
                className="bg-covenant-primary hover:bg-covenant-primary/90"
              >
                <Save size={16} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {!loading && notes.map((note) => (
          <div 
            key={note.id} 
            className={`card-note border-l-4 ${note.color} animate-fade-in mb-4 bg-white p-4 rounded-lg shadow`}
          >
            <div className="flex justify-between items-center">
              {note.isEditing ? (
                <Input
                  value={note.title}
                  onChange={(e) => setNotes(notes.map(n => 
                    n.id === note.id ? { ...n, title: e.target.value } : n
                  ))}
                  className="font-medium"
                />
              ) : (
                <h3 className="font-medium flex-1">{note.title}</h3>
              )}
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => toggleExpand(note.id)}
                >
                  {note.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => toggleEdit(note.id)}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" 
                  onClick={() => deleteNote(note.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
            
            {note.isExpanded && (
              <>
                {note.isEditing ? (
                  <Textarea
                    value={note.content}
                    onChange={(e) => setNotes(notes.map(n => 
                      n.id === note.id ? { ...n, content: e.target.value } : n
                    ))}
                    className="my-2"
                    rows={3}
                  />
                ) : (
                  <p className="my-2 whitespace-pre-line">{note.content}</p>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <span>
                    {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {note.isEditing && (
                    <div className="flex gap-1">
                      <div className="flex gap-1">
                        {colors.map((color, index) => (
                          <button 
                            key={index}
                            onClick={() => changeColor(note.id)}
                            className={`w-4 h-4 rounded-full border ${color} ${note.color === color ? 'ring-1 ring-covenant-primary' : ''}`}
                          />
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => updateNote(note.id, note.title, note.content)}
                        className="bg-covenant-primary hover:bg-covenant-primary/90 h-6 text-xs"
                      >
                        <Save size={12} className="mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        
        {!loading && notes.length === 0 && !isCreating && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <p>No notes yet</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={16} className="mr-1" /> Create your first note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
