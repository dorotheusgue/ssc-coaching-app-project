import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
 assignedSessions,
 programAssignments,
 programs,
 users,
 athleteProfiles,
} from "@/db/schema";
import { eq, and, between, desc } from "drizzle-orm";
import {
 startOfMonth,
 endOfMonth,
 format,
 addMonths,
 subMonths,
} from "date-fns";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage({
 searchParams,
}: {
 searchParams: Promise<{ month?: string; year?: string }>;
}) {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const coachId = parseInt((session.user as { id?: string }).id ?? "0");

 const params = await searchParams;
 const now = new Date();
 const year = parseInt(params.year ?? String(now.getFullYear()));
 const month = parseInt(params.month ?? String(now.getMonth() + 1));
 const currentMonth = new Date(year, month - 1, 1);

 const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
 const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

 const coachAthletes = await db
 .select({
 id: users.id,
 name: users.name,
 email: users.email,
 })
 .from(athleteProfiles)
 .innerJoin(users, eq(athleteProfiles.userId, users.id))
 .where(eq(athleteProfiles.coachId, coachId));

 const sessions = await db
 .select({
 id: assignedSessions.id,
 date: assignedSessions.date,
 label: assignedSessions.label,
 status: assignedSessions.status,
 athleteId: assignedSessions.athleteId,
 athleteName: users.name,
 })
 .from(assignedSessions)
 .innerJoin(users, eq(assignedSessions.athleteId, users.id))
 .innerJoin(
 athleteProfiles,
 eq(athleteProfiles.userId, assignedSessions.athleteId)
 )
 .where(
 and(
 eq(athleteProfiles.coachId, coachId),
 between(assignedSessions.date, monthStart, monthEnd)
 )
 )
 .orderBy(assignedSessions.date);

 const coachPrograms = await db
 .select({ id: programs.id, name: programs.name })
 .from(programs)
 .where(eq(programs.coachId, coachId))
 .orderBy(desc(programs.createdAt));

 const assignments = await db
 .select({
 id: programAssignments.id,
 programName: programs.name,
 athleteName: users.name,
 startDate: programAssignments.startDate,
 status: programAssignments.status,
 })
 .from(programAssignments)
 .innerJoin(programs, eq(programAssignments.programId, programs.id))
 .innerJoin(users, eq(programAssignments.athleteId, users.id))
 .where(eq(programAssignments.coachId, coachId))
 .orderBy(desc(programAssignments.createdAt));

 return (
 <CalendarClient
 sessions={sessions}
 athletes={coachAthletes}
 programs={coachPrograms}
 assignments={assignments}
 currentMonth={currentMonth}
 prevMonth={{
 month: format(subMonths(currentMonth, 1), "M"),
 year: format(subMonths(currentMonth, 1), "yyyy"),
 }}
 nextMonth={{
 month: format(addMonths(currentMonth, 1), "M"),
 year: format(addMonths(currentMonth, 1), "yyyy"),
 }}
 />
 );
}
