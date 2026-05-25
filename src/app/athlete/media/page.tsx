import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { media, assignedSessions } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { addDays, format } from "date-fns";
import MediaUploadClient from "./MediaUploadClient";

export default async function AthleteMediaPage() {
 const session = await auth();
 if (!session?.user) redirect("/login");
 const athleteId = parseInt((session.user as { id?: string }).id ?? "0");

 const mediaItems = await db
 .select()
 .from(media)
 .where(eq(media.athleteId, athleteId))
 .orderBy(desc(media.createdAt));

 // Recent sessions (last 14 days) for the optional "link to session" picker.
 const cutoff = format(addDays(new Date(), -14), "yyyy-MM-dd");
 const recentSessions = await db
 .select({
 id: assignedSessions.id,
 label: assignedSessions.label,
 date: assignedSessions.date,
 })
 .from(assignedSessions)
 .where(
 and(
 eq(assignedSessions.athleteId, athleteId),
 gte(assignedSessions.date, cutoff)
 )
 )
 .orderBy(desc(assignedSessions.date))
 .limit(20);

 return (
 <MediaUploadClient
 items={mediaItems}
 athleteId={athleteId}
 recentSessions={recentSessions}
 />
 );
}
