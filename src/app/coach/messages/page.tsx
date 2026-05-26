import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { conversations, users, athleteProfiles, messages } from "@/db/schema";
import { eq, and, desc, isNull, ne, sql } from "drizzle-orm";
import MessagesClient from "./MessagesClient";

export default async function CoachMessagesPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const coachId = parseInt((session.user as { id?: string }).id ?? "0");

 const convos = await db
 .select({
 id: conversations.id,
 athleteId: conversations.athleteId,
 athleteName: users.name,
 lastMessageAt: conversations.lastMessageAt,
 })
 .from(conversations)
 .innerJoin(users, eq(conversations.athleteId, users.id))
 .where(eq(conversations.coachId, coachId))
 .orderBy(desc(conversations.lastMessageAt));

 const athletes = await db
 .select({ id: users.id, name: users.name })
 .from(athleteProfiles)
 .innerJoin(users, eq(athleteProfiles.userId, users.id))
 .where(eq(athleteProfiles.coachId, coachId));

 const conversationDetails = await Promise.all(
 convos.map(async (c) => {
 const lastMsg = await db
 .select({ text: messages.text, senderId: messages.senderId })
 .from(messages)
 .where(eq(messages.conversationId, c.id))
 .orderBy(desc(messages.createdAt))
 .limit(1)
 .get();
 const [unread] = await db
 .select({ value: sql<number>`count(*)` })
 .from(messages)
 .where(
 and(
 eq(messages.conversationId, c.id),
 ne(messages.senderId, coachId),
 isNull(messages.readAt)
 )
 );
 return {
 ...c,
 lastMessage: lastMsg?.text ?? "",
 unreadCount: Number(unread?.value ?? 0),
 };
 })
 );

 return (
 <MessagesClient
 conversations={conversationDetails}
 athletes={athletes}
 coachId={coachId}
 />
 );
}
