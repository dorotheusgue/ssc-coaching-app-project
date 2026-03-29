import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conversationId = parseInt(id);

  if (!conversationId) {
    return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
  }

  const msgs = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  return NextResponse.json({ messages: msgs });
}
