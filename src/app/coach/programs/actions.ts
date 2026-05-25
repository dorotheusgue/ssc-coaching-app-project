"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  programs,
  phases,
  sessionTemplates,
  sessionBlocks,
  blockExercises,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProgram(data: {
  name: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const coachId = parseInt((session.user as { id: string }).id);

  const [program] = await db
    .insert(programs)
    .values({
      name: data.name,
      description: data.description ?? null,
      coachId,
    })
    .returning();

  revalidatePath("/coach/programs");
  return program;
}

export async function updateProgram(
  id: number,
  data: { name?: string; description?: string; status?: string }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  const [program] = await db
    .update(programs)
    .set(updateData)
    .where(eq(programs.id, id))
    .returning();

  revalidatePath(`/coach/programs/${id}`);
  return program;
}

export async function deleteProgram(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(programs).where(eq(programs.id, id));
  revalidatePath("/coach/programs");
}

export async function createPhase(data: {
  programId: number;
  name: string;
  goal?: string;
  sortOrder?: number;
  startWeek?: number;
  endWeek?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [phase] = await db
    .insert(phases)
    .values({
      programId: data.programId,
      name: data.name,
      goal: data.goal ?? null,
      sortOrder: data.sortOrder ?? 0,
      startWeek: data.startWeek ?? 1,
      endWeek: data.endWeek ?? 4,
    })
    .returning();

  revalidatePath(`/coach/programs/${data.programId}`);
  return phase;
}

export async function updatePhase(
  id: number,
  data: {
    name?: string;
    goal?: string;
    sortOrder?: number;
    startWeek?: number;
    endWeek?: number;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [phase] = await db
    .update(phases)
    .set(data)
    .where(eq(phases.id, id))
    .returning();

  return phase;
}

export async function deletePhase(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const phase = await db.select().from(phases).where(eq(phases.id, id)).get();
  if (!phase) throw new Error("Phase not found");

  await db.delete(phases).where(eq(phases.id, id));
  revalidatePath(`/coach/programs/${phase.programId}`);
}

export async function createSessionTemplate(data: {
  phaseId: number;
  dayOfWeek: number;
  week?: number;
  label: string;
  sortOrder?: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [template] = await db
    .insert(sessionTemplates)
    .values({
      phaseId: data.phaseId,
      dayOfWeek: data.dayOfWeek,
      week: data.week ?? 0,
      label: data.label,
      sortOrder: data.sortOrder ?? 0,
      notes: data.notes ?? null,
    })
    .returning();

  return template;
}

export async function updateSessionTemplate(
  id: number,
  data: { dayOfWeek?: number; week?: number; label?: string; sortOrder?: number; notes?: string }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [template] = await db
    .update(sessionTemplates)
    .set(data)
    .where(eq(sessionTemplates.id, id))
    .returning();

  return template;
}

export async function deleteSessionTemplate(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(sessionTemplates).where(eq(sessionTemplates.id, id));
}

export async function createSessionBlock(data: {
  sessionTemplateId: number;
  blockType: string;
  label?: string;
  sortOrder?: number;
  restSeconds?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [block] = await db
    .insert(sessionBlocks)
    .values({
      sessionTemplateId: data.sessionTemplateId,
      blockType: data.blockType as "warmup" | "sprint" | "strength" | "accessory" | "notes",
      label: data.label ?? null,
      sortOrder: data.sortOrder ?? 0,
      restSeconds: data.restSeconds ?? null,
    })
    .returning();

  return block;
}

export async function deleteSessionBlock(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(sessionBlocks).where(eq(sessionBlocks.id, id));
}

export async function addExerciseToBlock(data: {
  blockId: number;
  exerciseId: number;
  sets?: number;
  reps?: string;
  load?: string;
  percent1RM?: number;
  distance?: number;
  time?: number;
  restSeconds?: number;
  rpeTarget?: number;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const maxSort = await db
    .select()
    .from(blockExercises)
    .where(eq(blockExercises.blockId, data.blockId))
    .all();

  const [blockExercise] = await db
    .insert(blockExercises)
    .values({
      blockId: data.blockId,
      exerciseId: data.exerciseId,
      sets: data.sets ?? null,
      reps: data.reps ?? null,
      load: data.load ?? null,
      percent1RM: data.percent1RM ?? null,
      distance: data.distance ?? null,
      time: data.time ?? null,
      restSeconds: data.restSeconds ?? null,
      rpeTarget: data.rpeTarget ?? null,
      notes: data.notes ?? null,
      sortOrder: maxSort.length,
    })
    .returning();

  return blockExercise;
}

export async function removeExerciseFromBlock(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(blockExercises).where(eq(blockExercises.id, id));
}

export async function updateBlockExercise(
  id: number,
  data: {
    sets?: number | null;
    reps?: string | null;
    load?: string | null;
    percent1RM?: number | null;
    distance?: number | null;
    time?: number | null;
    restSeconds?: number | null;
    rpeTarget?: number | null;
    notes?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [updated] = await db
    .update(blockExercises)
    .set(data)
    .where(eq(blockExercises.id, id))
    .returning();

  return updated;
}
