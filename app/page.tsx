"use client";
import { useEffect, useState, useRef } from "react";
import { getNotes, createNote, updateNote, deleteNote, updateNoteTitle } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MoreVertical, Pencil, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Note = { id: number; title: string; content: string; createdAt: Date; updatedAt: Date };

const sortByUpdated = (arr: Note[]) =>
  [...arr].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const prevContentRef = useRef(content);

  useEffect(() => { getNotes().then(setNotes); }, []);

  useEffect(() => {
    if (!selectedId) return;
    const timer = setTimeout(async () => {
      if (content !== prevContentRef.current) {
        const updated = await updateNote(selectedId, content);
        setNotes(prev => sortByUpdated(prev.map(n => n.id === updated.id ? updated : n)));
        prevContentRef.current = content;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, selectedId]);

  const selectNote = (id: number) => {
    const n = notes.find(n => n.id === id);
    if (n) {
      setSelectedId(id);
      setTitle(n.title);
      setContent(n.content);
      prevContentRef.current = n.content;
    }
  };

  // ✅ FIXED CREATE FUNCTION
  const create = async () => {
    const n = await createNote("");
    setNotes(prev => sortByUpdated([n, ...prev]));

    setSelectedId(n.id);
    setTitle(n.title);
    setContent(n.content);
    prevContentRef.current = n.content;

    setTimeout(() => { titleRef.current?.focus(); titleRef.current?.select(); }, 0);
  };

  const del = async (id: number) => {
    await deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) { setSelectedId(null); setTitle(""); setContent(""); }
  };

  const saveTitle = async () => {
    const current = notes.find(n => n.id === selectedId);
    if (selectedId && current && title !== current.title) {
      const updated = await updateNoteTitle(selectedId, title);
      setNotes(prev => sortByUpdated(prev.map(n => n.id === updated.id ? updated : n)));
    }
  };

  const download = (note: Note) => {
    const blob = new Blob([note.content || "Empty note"], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${note.title || "untitled"}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleRename = (id: number) => {
    selectNote(id);
    setTimeout(() => { titleRef.current?.focus(); titleRef.current?.select(); }, 0);
  };

  const selected = notes.find(n => n.id === selectedId);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-6xl h-[90vh] rounded-lg border shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-3 bg-muted/30">
          <h1 className="text-xl font-semibold">📝 DevNotes</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r p-4 flex flex-col bg-muted/10">
            <Button onClick={create} className="w-full mb-4">+ New Note</Button>
            <ScrollArea className="flex-1">
              {notes.map(n => (
                <div
                  key={n.id}
                  className={`group flex items-center justify-between p-2 rounded cursor-pointer ${selectedId === n.id ? "bg-accent" : "hover:bg-accent/50"}`}
                  onClick={() => selectNote(n.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{n.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(n.updatedAt).toLocaleString('en-GB', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(n.id)}>
                        <Pencil className="h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => download(n)}>
                        <Download className="h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => del(n.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Editor */}
          <div className="flex-1 p-4 flex flex-col bg-background">
            {selected ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    ref={titleRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        contentRef.current?.focus();
                      }
                    }}
                    className="text-2xl font-bold border-none shadow-none px-0 flex-1"
                    placeholder="Note title"
                  />
                </div>
                <Textarea
                  ref={contentRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="flex-1 resize-none"
                  placeholder="Write your note here..."
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Select or create a note</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2 text-xs text-muted-foreground bg-muted/30 text-center">
          Created by x23153920
        </div>
      </div>
    </div>
  );
}