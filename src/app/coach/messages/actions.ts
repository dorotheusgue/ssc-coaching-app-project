"use server";

import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const conversationId = parseInt(formData.get("conversationId") as string);
  const senderId = parseInt(formData.get("senderId") as string);
  const text = formData.get("text") as string;

  if (!conversationId || !senderId || !text) {
    return { error: "All fields required" };
  }

  await db.insert(messages).values({
    conversationId,
    senderId,
    text,
  });

  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  revalidatePath("/coach/messages");
  revalidatePath("/athlete/messages");
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
        eq(messages.senderId, userId)
      )
    );
  return { success: true };
}
