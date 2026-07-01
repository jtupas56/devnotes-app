"use client";

import { useEffect, useState, useRef } from "react";
import { getNotes, createNote, updateNote, deleteNote, updateNoteTitle } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Trash2, Download } from "lucide-react";

type Note = { id: number; title: string; content: string; createdAt: Date; updatedAt: Date };

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const selected = notes.find(n => n.id === selectedId);

  useEffect(() => { getNotes().then(setNotes); }, []);

  useEffect(() => {
    if (!selectedId) return;
    const timer = setTimeout(() => {
      const note = notes.find(n => n.id === selectedId);
      if (note && content !== note.content) updateNote(selectedId, content);
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, selectedId, notes]);

  useEffect(() => {
    if (selectedId && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [selectedId]);

  const selectNote = (id: number) => {
    const n = notes.find(n => n.id === id);
    if (n) { setSelectedId(id); setTitle(n.title); setContent(n.content); }
  };

  const create = async () => {
    const n = await createNote("");
    setNotes([n, ...notes]);
    selectNote(n.id);
  };

  const del = async (id: number) => {
    await deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
    if (selectedId === id) { setSelectedId(null); setTitle(""); setContent(""); }
  };

  const saveTitle = async () => {
    if (selectedId && title !== notes.find(n => n.id === selectedId)?.title)
      await updateNoteTitle(selectedId, title);
  };

  const downloadNote = () => {
    if (!selected) return;
    const blob = new Blob([selected.content || "Empty note"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (selected.title || "untitled") + ".txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-6xl h-[90vh] rounded-lg border shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-3 bg-muted/30">
          <h1 className="text-xl font-semibold">📝 DevNotes</h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r p-4 flex flex-col bg-muted/10">
            <Button onClick={create} className="w-full mb-4">+ New Note</Button>
            <ScrollArea className="flex-1">
              {notes.map(n => (
                <div key={n.id} className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedId === n.id ? "bg-accent" : "hover:bg-accent/50"}`}>
                  <div onClick={() => selectNote(n.id)} className="flex-1 min-w-0">
                    <p className="font-medium truncate">{n.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground truncate">{n.content || "Empty"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={e => { e.stopPropagation(); del(n.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Editor */}
          <div className="flex-1 p-4 flex flex-col bg-background">
            {selected ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} onBlur={saveTitle} className="text-2xl font-bold border-none shadow-none px-0 flex-1" placeholder="Note title" />
                  <Button onClick={downloadNote} variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> .txt
                  </Button>
                </div>
                <Textarea value={content} onChange={e => setContent(e.target.value)} className="flex-1 resize-none" placeholder="Write your note here..." />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Select or create a note</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2 text-xs text-muted-foreground bg-muted/30 text-center">
          Built with Next.js and Neon
        </div>
      </div>
    </div>
  );
}