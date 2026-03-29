"use server";

import { db } from "@/db";
import {
  programs,
  phases,
  sessionTemplates,
  assignedSessions,
  programAssignments,
} from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { addDays, format, parseISO } from "date-fns";
import { auth } from "@/lib/auth";

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

  for (const phase of programPhases) {
    const templates = await db
      .select()
      .from(sessionTemplates)
      .where(eq(sessionTemplates.phaseId, phase.id))
      .orderBy(sessionTemplates.sortOrder);

    for (const template of templates) {
      const weekOffset = Math.floor((template.dayOfWeek - 1) / 7);
      const dayInWeek = ((template.dayOfWeek - 1) % 7) + 1;
      const phaseWeekOffset = (phase.startWeek - 1) * 7;
      const sessionDate = addDays(
        startDate,
        phaseWeekOffset + weekOffset * 7 + (dayInWeek - 1)
      );

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

  return { success: true };
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

export async function deleteAssignmentAction(assignmentId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await db
    .delete(assignedSessions)
    .where(eq(assignedSessions.assignmentId, assignmentId));
  await db
    .delete(programAssignments)
    .where(eq(programAssignments.id, assignmentId));

  return { success: true };
}
