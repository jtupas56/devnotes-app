"use client";

import { useEffect, useState } from "react";
import { getNotes, createNote, updateNote, deleteNote, updateNoteTitle } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react"; // 👈 import trash icon

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load notes on mount
  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

  // Auto-save content with debounce
  useEffect(() => {
    if (!selectedId) return;
    const timeout = setTimeout(() => {
      const note = notes.find(n => n.id === selectedId);
      if (note && content !== note.content) {
        updateNote(selectedId, content);
        setIsSaving(false);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content, selectedId, notes]);

  const selectNote = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setSelectedId(id);
      setContent(note.content);
      setTitle(note.title);
    }
  };

  const handleCreate = async () => {
    const newNote = await createNote("Untitled");
    setNotes([newNote, ...notes]);
    selectNote(newNote.id);
  };

  const handleDelete = async (id: number) => {
    await deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setContent("");
      setTitle("");
    }
  };

  const handleTitleBlur = async () => {
    if (selectedId && title !== notes.find(n => n.id === selectedId)?.title) {
      await updateNoteTitle(selectedId, title);
    }
  };

  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <Button onClick={handleCreate} className="w-full mb-4">+ New Note</Button>
        <ScrollArea className="flex-1">
          {notes.map(note => (
            <div
              key={note.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedId === note.id ? "bg-accent" : "hover:bg-accent/50"
                }`}
            >
              {/* Click on note text to select */}
              <div
                onClick={() => selectNote(note.id)}
                className="flex-1 min-w-0" // prevent overflow
              >
                <p className="font-medium truncate">{note.title || "Untitled"}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {note.content || "Empty"}
                </p>
              </div>
              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation(); // prevent selecting the note when clicking delete
                  handleDelete(note.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 flex flex-col">
        {selectedNote ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="text-2xl font-bold border-none shadow-none px-0"
                placeholder="Note title"
              />
              {/* Optional: we already have delete in sidebar, so you can remove this delete button if you want */}
              {/* If you want to keep it, it's up to you */}
            </div>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-1 resize-none"
              placeholder="Write your note here..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              {isSaving ? "Saving..." : "All changes saved"}
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}