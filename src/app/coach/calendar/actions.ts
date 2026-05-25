"use server";

import { db } from "@/db";
import {
 phases,
 sessionTemplates,
 assignedSessions,
 programAssignments,
 setEntries,
 sprintEntries,
 readinessEntries,
 messages,
 media,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { addDays, format, parseISO } from "date-fns";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function assignProgramAction(formData: FormData) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };
 const coachId = parseInt((session.user as { id?: string }).id ?? "0");

 const programId = parseInt(formData.get("programId") as string);
 const athleteId = parseInt(formData.get("athleteId") as string);
 const startDateStr = formData.get("startDate") as string;

 if (!programId || !athleteId || !startDateStr) {
 return { error: "All fields are required" };
 }

 const startDate = parseISO(startDateStr);

 const [assignment] = await db
 .insert(programAssignments)
 .values({
 programId,
 athleteId,
 coachId,
 startDate: startDateStr,
 })
 .returning();

 const programPhases = await db
 .select()
 .from(phases)
 .where(eq(phases.programId, programId))
 .orderBy(phases.sortOrder);

 // Normalize so the program's first phase always starts on the selected
 // startDate, regardless of the phase's stored startWeek number (which may
 // be inherited from a source program, e.g. AI import).
 const minStartWeek = programPhases.length
 ? Math.min(...programPhases.map((p) => Math.max(1, p.startWeek)))
 : 1;

 for (const phase of programPhases) {
 const templates = await db
 .select()
 .from(sessionTemplates)
 .where(eq(sessionTemplates.phaseId, phase.id))
 .orderBy(sessionTemplates.sortOrder);

 // Templates with week=0 replay across every week of the phase
 // (startWeek..endWeek). Templates with week>=1 are placed only on
 // that specific phase-relative week.
 const startWeek = Math.max(1, phase.startWeek);
 const endWeek = Math.max(startWeek, phase.endWeek);

 for (const template of templates) {
 const dayInWeek = Math.min(7, Math.max(1, template.dayOfWeek));
 const weeksForTemplate =
 template.week === 0
 ? Array.from(
 { length: endWeek - startWeek + 1 },
 (_, i) => startWeek + i
 )
 : [startWeek + template.week - 1].filter((w) => w <= endWeek);

 for (const week of weeksForTemplate) {
 const offsetDays = (week - minStartWeek) * 7 + (dayInWeek - 1);
 const sessionDate = addDays(startDate, offsetDays);

 await db.insert(assignedSessions).values({
 assignmentId: assignment.id,
 athleteId,
 sessionTemplateId: template.id,
 date: format(sessionDate, "yyyy-MM-dd"),
 label: template.label,
 status: "scheduled",
 });
 }
 }
 }

 return { success: true };
}

export async function assignProgramToManyAction(formData: FormData) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };
 const coachId = parseInt((session.user as { id?: string }).id ?? "0");

 const programId = parseInt(formData.get("programId") as string);
 const athleteIdsRaw = formData.get("athleteIds") as string;
 const startDateStr = formData.get("startDate") as string;
 const athleteIds = athleteIdsRaw
 .split(",")
 .map((s) => parseInt(s.trim()))
 .filter((n) => Number.isFinite(n) && n > 0);

 if (!programId || athleteIds.length === 0 || !startDateStr) {
 return { error: "Missing required fields" };
 }

 const programPhases = await db
 .select()
 .from(phases)
 .where(eq(phases.programId, programId))
 .orderBy(phases.sortOrder);

 const minStartWeek = programPhases.length
 ? Math.min(...programPhases.map((p) => Math.max(1, p.startWeek)))
 : 1;

 const startDate = parseISO(startDateStr);

 for (const athleteId of athleteIds) {
 const [assignment] = await db
 .insert(programAssignments)
 .values({
 programId,
 athleteId,
 coachId,
 startDate: startDateStr,
 })
 .returning();

 for (const phase of programPhases) {
 const templates = await db
 .select()
 .from(sessionTemplates)
 .where(eq(sessionTemplates.phaseId, phase.id))
 .orderBy(sessionTemplates.sortOrder);

 const startWeek = Math.max(1, phase.startWeek);
 const endWeek = Math.max(startWeek, phase.endWeek);

 for (const template of templates) {
 const dayInWeek = Math.min(7, Math.max(1, template.dayOfWeek));
 const weeksForTemplate =
 template.week === 0
 ? Array.from(
 { length: endWeek - startWeek + 1 },
 (_, i) => startWeek + i
 )
 : [startWeek + template.week - 1].filter((w) => w <= endWeek);

 for (const week of weeksForTemplate) {
 const offsetDays = (week - minStartWeek) * 7 + (dayInWeek - 1);
 const sessionDate = addDays(startDate, offsetDays);

 await db.insert(assignedSessions).values({
 assignmentId: assignment.id,
 athleteId,
 sessionTemplateId: template.id,
 date: format(sessionDate, "yyyy-MM-dd"),
 label: template.label,
 status: "scheduled",
 });
 }
 }
 }
 }

 revalidatePath("/coach/calendar");
 revalidatePath("/coach/athletes");
 return { success: true, count: athleteIds.length };
}

export async function rescheduleSessionAction(
 assignedSessionId: number,
 newDate: string
) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };

 await db
 .update(assignedSessions)
 .set({ date: newDate })
 .where(eq(assignedSessions.id, assignedSessionId));

 return { success: true };
}

async function cascadeDeleteAssignedSessions(sessionIds: number[]) {
 if (sessionIds.length === 0) return;

 // Null-out optional FKs (preserve history).
 await db
 .update(readinessEntries)
 .set({ assignedSessionId: null })
 .where(inArray(readinessEntries.assignedSessionId, sessionIds));
 await db
 .update(messages)
 .set({ assignedSessionId: null })
 .where(inArray(messages.assignedSessionId, sessionIds));
 await db
 .update(media)
 .set({ assignedSessionId: null })
 .where(inArray(media.assignedSessionId, sessionIds));

 // Hard-delete logged sets/sprints (they're meaningless without the session).
 await db
 .delete(setEntries)
 .where(inArray(setEntries.assignedSessionId, sessionIds));
 await db
 .delete(sprintEntries)
 .where(inArray(sprintEntries.assignedSessionId, sessionIds));

 await db
 .delete(assignedSessions)
 .where(inArray(assignedSessions.id, sessionIds));
}

export async function deleteAssignedSessionAction(assignedSessionId: number) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };

 await cascadeDeleteAssignedSessions([assignedSessionId]);

 revalidatePath("/coach/calendar");
 revalidatePath("/athlete/calendar");
 revalidatePath("/athlete/today");
 return { success: true };
}

export async function deleteAssignedSessionsAction(ids: number[]) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };
 if (!Array.isArray(ids) || ids.length === 0) {
 return { error: "No sessions selected" };
 }

 await cascadeDeleteAssignedSessions(ids);

 revalidatePath("/coach/calendar");
 revalidatePath("/athlete/calendar");
 revalidatePath("/athlete/today");
 return { success: true, removed: ids.length };
}

export async function deleteAssignmentAction(assignmentId: number) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };

 const sessions = await db
 .select({ id: assignedSessions.id })
 .from(assignedSessions)
 .where(eq(assignedSessions.assignmentId, assignmentId));
 await cascadeDeleteAssignedSessions(sessions.map((s) => s.id));

 await db
 .delete(programAssignments)
 .where(eq(programAssignments.id, assignmentId));

 revalidatePath("/coach/calendar");
 revalidatePath("/athlete/calendar");
 revalidatePath("/athlete/today");
 return { success: true };
}
