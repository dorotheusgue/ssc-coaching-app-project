import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { exercises } from "@/db/schema";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "coach" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const coachId = parseInt((session.user as { id: string }).id);

  const body = await request.json();
  const {
    name,
    category,
    movementPattern,
    tags,
    description,
    trackingType,
    videoUrl,
  } = body;

  if (!name || !category || !trackingType) {
    return NextResponse.json(
      { error: "name, category, and trackingType are required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(exercises)
    .values({
      name,
      category,
      movementPattern: movementPattern || null,
      tags: Array.isArray(tags) ? tags : [],
      description: description || null,
      trackingType,
      videoUrl: videoUrl || null,
      coachId,
      isDefault: false,
    })
    .returning();

  return NextResponse.json(created);
}
