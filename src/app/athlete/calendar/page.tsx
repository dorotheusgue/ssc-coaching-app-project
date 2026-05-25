import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { assignedSessions } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";
import {
 startOfMonth,
 endOfMonth,
 format,
 addMonths,
 subMonths,
} from "date-fns";
import AthleteCalendarClient from "./AthleteCalendarClient";

export default async function AthleteCalendarPage({
 searchParams,
}: {
 searchParams: Promise<{ month?: string; year?: string }>;
}) {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const athleteId = parseInt((session.user as { id?: string }).id ?? "0");

 const params = await searchParams;
 const now = new Date();
 const year = parseInt(params.year ?? String(now.getFullYear()));
 const month = parseInt(params.month ?? String(now.getMonth() + 1));
 const currentMonth = new Date(year, month - 1, 1);

 const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
 const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

 const sessions = await db
 .select()
 .from(assignedSessions)
 .where(
 and(
 eq(assignedSessions.athleteId, athleteId),
 between(assignedSessions.date, monthStart, monthEnd)
 )
 )
 .orderBy(assignedSessions.date);

 return (
 <AthleteCalendarClient
 sessions={sessions}
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
