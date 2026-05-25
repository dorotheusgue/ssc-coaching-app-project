import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { media } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

 return <MediaUploadClient items={mediaItems} athleteId={athleteId} />;
}
