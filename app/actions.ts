"use server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function getNotes() {
    return await db.select().from(notes).orderBy(notes.createdAt);
}

export async function createNote(title: string) {
    const [newNote] = await db.insert(notes).values({ title, content: "" }).returning();
    revalidatePath("/");
    return newNote;
}

export async function updateNote(id: number, content: string) {
    const [updated] = await db
        .update(notes)
        .set({ content, updatedAt: new Date() })
        .where(eq(notes.id, id))
        .returning();
    revalidatePath("/");
    return updated; // 👈 return the updated note
}

export async function deleteNote(id: number) {
    await db.delete(notes).where(eq(notes.id, id));
    revalidatePath("/");
}

export async function updateNoteTitle(id: number, title: string) {
    const [updated] = await db
        .update(notes)
        .set({ title, updatedAt: new Date() })
        .where(eq(notes.id, id))
        .returning();
    revalidatePath("/");
    return updated; // 👈 return the updated note
}