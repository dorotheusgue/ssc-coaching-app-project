import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { and, eq, isNull, ne, or, sql } from "drizzle-orm";

export async function getUnreadMessageCount(userId: number): Promise<number> {
 const [row] = await db
 .select({ count: sql<number>`count(*)` })
 .from(messages)
 .innerJoin(conversations, eq(conversations.id, messages.conversationId))
 .where(
 and(
 or(
 eq(conversations.coachId, userId),
 eq(conversations.athleteId, userId)
 ),
 ne(messages.senderId, userId),
 isNull(messages.readAt)
 )
 );
 return Number(row?.count ?? 0);
}

export async function getAuthUser() {
 const session = await auth();
 if (!session?.user) redirect("/login");
 return {
 id: (session.user as { id?: string }).id ?? "",
 name: session.user.name ?? "",
 email: session.user.email ?? "",
 role: (session.user as { role?: string }).role ?? "athlete",
 };
}

export async function requireCoach() {
 const user = await getAuthUser();
 if (user.role !== "coach" && user.role !== "admin") redirect("/athlete/today");
 return user;
}

export async function requireAthlete() {
 const user = await getAuthUser();
 if (user.role !== "athlete") redirect("/coach/dashboard");
 return user;
}
