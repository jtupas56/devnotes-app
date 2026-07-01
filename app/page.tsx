"use client";

import { useEffect, useState, useRef } from "react";
import { getNotes, createNote, updateNote, deleteNote, updateNoteTitle } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

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

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

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

  useEffect(() => {
    if (selectedId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [selectedId]);

  const selectNote = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setSelectedId(id);
      setContent(note.content);
      setTitle(note.title);
    }
  };

  const handleCreate = async () => {
    const newNote = await createNote("");
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/* 👇 Centered container with max width */}
      <div className="w-full max-w-6xl h-[90vh] rounded-lg border shadow-lg overflow-hidden flex flex-col">
        {/* Optional: Header */}
        <div className="border-b px-6 py-3 bg-muted/30">
          <h1 className="text-xl font-semibold">📝 DevNotes</h1>
        </div>

        {/* Main Content: Sidebar + Editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r p-4 flex flex-col bg-muted/10">
            <Button onClick={handleCreate} className="w-full mb-4">
              + New Note
            </Button>
            <ScrollArea className="flex-1">
              {notes.map(note => (
                <div
                  key={note.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedId === note.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                >
                  <div
                    onClick={() => selectNote(note.id)}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-medium truncate">{note.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {note.content || "Empty"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
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
          <div className="flex-1 p-4 flex flex-col bg-background">
            {selectedNote ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <Input
                    ref={titleInputRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="text-2xl font-bold border-none shadow-none px-0"
                    placeholder="Note title"
                  />
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

        {/* Optional: Footer */}
        <div className="border-t px-6 py-2 text-xs text-muted-foreground bg-muted/30 text-center">
          Built with Next.j and  Neon
        </div>
      </div>
    </div>
  );
}