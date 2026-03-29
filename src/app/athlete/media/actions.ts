"use server";

import { db } from "@/db";
import { media } from "@/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveMediaAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const athleteId = parseInt(formData.get("athleteId") as string);
  const fileUrl = formData.get("fileUrl") as string;
  const fileName = formData.get("fileName") as string;
  const fileType = formData.get("fileType") as string;
  const fileSize = parseInt(formData.get("fileSize") as string);
  const type = formData.get("type") as "video" | "image";
  const caption = (formData.get("caption") as string) || null;

  await db.insert(media).values({
    athleteId,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    type,
    caption,
  });

  revalidatePath("/athlete/media");
  revalidatePath("/coach/media");
  return { success: true };
}
