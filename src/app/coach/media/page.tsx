import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { media } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import MediaGalleryClient from "./MediaGalleryClient";

export default async function CoachMediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const mediaItems = await db
    .select({
      id: media.id,
      athleteId: media.athleteId,
      fileUrl: media.fileUrl,
      fileName: media.fileName,
      fileType: media.fileType,
      type: media.type,
      caption: media.caption,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));

  return <MediaGalleryClient items={mediaItems} />;
}
