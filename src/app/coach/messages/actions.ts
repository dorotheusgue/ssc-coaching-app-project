"use server";

import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, and, ne, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(formData: FormData) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };

 const conversationId = parseInt(formData.get("conversationId") as string);
 const senderId = parseInt(formData.get("senderId") as string);
 const text = (formData.get("text") as string) ?? "";
 const mediaUrl = (formData.get("mediaUrl") as string) || null;
 const mediaType = (formData.get("mediaType") as string) || null;
 const sessionIdRaw = formData.get("assignedSessionId");
 const assignedSessionId = sessionIdRaw
 ? parseInt(sessionIdRaw as string) || null
 : null;

 if (!conversationId || !senderId) {
 return { error: "Missing conversation or sender" };
 }
 if (!text.trim() && !mediaUrl) {
 return { error: "Message cannot be empty" };
 }

 await db.insert(messages).values({
 conversationId,
 senderId,
 text: text.trim() || (mediaType?.startsWith("video") ? "[video]" : "[attachment]"),
 mediaUrl,
 mediaType,
 assignedSessionId,
 });

 await db
 .update(conversations)
 .set({ lastMessageAt: new Date() })
 .where(eq(conversations.id, conversationId));

 revalidatePath("/coach/messages");
 revalidatePath("/athlete/messages");
 revalidatePath("/athlete/today");
 return { success: true };
}

export async function createConversationAction(formData: FormData) {
 const session = await auth();
 if (!session?.user) return { error: "Unauthorized" };

 const coachId = parseInt(formData.get("coachId") as string);
 const athleteId = parseInt(formData.get("athleteId") as string);

 const existing = await db
 .select()
 .from(conversations)
 .where(
 and(
 eq(conversations.coachId, coachId),
 eq(conversations.athleteId, athleteId)
 )
 )
 .get();

 if (existing) return { success: true, conversationId: existing.id };

 const [convo] = await db
 .insert(conversations)
 .values({ coachId, athleteId })
 .returning();

 revalidatePath("/coach/messages");
 return { success: true, conversationId: convo.id };
}

export async function markReadAction(conversationId: number, userId: number) {
 await db
 .update(messages)
 .set({ readAt: new Date() })
 .where(
 and(
 eq(messages.conversationId, conversationId),
 ne(messages.senderId, userId),
 isNull(messages.readAt)
 )
 );
 return { success: true };
}
