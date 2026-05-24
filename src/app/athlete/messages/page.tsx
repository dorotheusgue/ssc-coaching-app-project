import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { conversations, users, messages, athleteProfiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import AthleteMessagesClient from "./AthleteMessagesClient";

export default async function AthleteMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const athleteId = parseInt((session.user as { id?: string }).id ?? "0");

  let convo = await db
    .select({
      id: conversations.id,
      coachId: conversations.coachId,
      coachName: users.name,
    })
    .from(conversations)
    .innerJoin(users, eq(conversations.coachId, users.id))
    .where(eq(conversations.athleteId, athleteId))
    .get();

  if (!convo) {
    const profile = await db
      .select({ coachId: athleteProfiles.coachId })
      .from(athleteProfiles)
      .where(eq(athleteProfiles.userId, athleteId))
      .get();

    if (profile?.coachId) {
      const profileCoachId = profile.coachId;
      const coach = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, profileCoachId))
        .get();

      const [newConvo] = await db
        .insert(conversations)
        .values({ coachId: profileCoachId, athleteId })
        .returning();

      convo = {
        id: newConvo.id,
        coachId: profileCoachId,
        coachName: coach?.name ?? "Coach",
      };
    }
  }

  if (!convo) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-neutral-500">
        <p>No coach assigned yet.</p>
      </div>
    );
  }

  const msgs = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      text: messages.text,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, convo.id))
    .orderBy(messages.createdAt);

  return (
    <AthleteMessagesClient
      conversationId={convo.id}
      coachName={convo.coachName}
      messages={msgs}
      athleteId={athleteId}
    />
  );
}
