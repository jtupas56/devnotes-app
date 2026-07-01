"use server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";

export async function getNotes() {
    return await db.select().from(notes); // ❌ notes is not imported
}