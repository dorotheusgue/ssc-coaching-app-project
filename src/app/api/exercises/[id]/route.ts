import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 const session = await auth();
 if (!session?.user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }
 const coachId = parseInt((session.user as { id: string }).id);

 const { id } = await params;
 const exerciseId = parseInt(id);
 if (!exerciseId) {
 return NextResponse.json({ error: "Invalid id" }, { status: 400 });
 }

 const existing = await db
 .select()
 .from(exercises)
 .where(eq(exercises.id, exerciseId))
 .get();
 if (!existing) {
 return NextResponse.json({ error: "Not found" }, { status: 404 });
 }
 if (existing.coachId !== coachId) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 const body = await request.json();
 const update: Record<string, unknown> = {};
 if (body.name !== undefined) update.name = body.name;
 if (body.category !== undefined) update.category = body.category;
 if (body.movementPattern !== undefined)
 update.movementPattern = body.movementPattern || null;
 if (body.tags !== undefined)
 update.tags = Array.isArray(body.tags) ? body.tags : [];
 if (body.description !== undefined)
 update.description = body.description || null;
 if (body.trackingType !== undefined) update.trackingType = body.trackingType;
 if (body.videoUrl !== undefined) update.videoUrl = body.videoUrl || null;

 const [updated] = await db
 .update(exercises)
 .set(update)
 .where(eq(exercises.id, exerciseId))
 .returning();

 return NextResponse.json(updated);
}

export async function DELETE(
 _request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 const session = await auth();
 if (!session?.user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }
 const coachId = parseInt((session.user as { id: string }).id);

 const { id } = await params;
 const exerciseId = parseInt(id);
 if (!exerciseId) {
 return NextResponse.json({ error: "Invalid id" }, { status: 400 });
 }

 const existing = await db
 .select()
 .from(exercises)
 .where(eq(exercises.id, exerciseId))
 .get();
 if (!existing) {
 return NextResponse.json({ error: "Not found" }, { status: 404 });
 }
 if (existing.coachId !== coachId) {
 return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 }

 await db.delete(exercises).where(eq(exercises.id, exerciseId));
 return NextResponse.json({ success: true });
}
