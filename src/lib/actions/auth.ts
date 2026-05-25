"use server";

import { signIn as nextAuthSignIn } from "@/lib/auth";
import { db } from "@/db";
import { users, athleteProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
 const email = formData.get("email") as string;
 const password = formData.get("password") as string;

 try {
 await nextAuthSignIn("credentials", {
 email,
 password,
 redirectTo: undefined,
 });

 const user = await db
 .select({ role: users.role })
 .from(users)
 .where(eq(users.email, email))
 .get();

 return { success: true, role: user?.role ?? "athlete" };
 } catch {
 return { success: false as const, error: "Invalid email or password" };
 }
}

export async function registerAction(formData: FormData) {
 const name = formData.get("name") as string;
 const email = formData.get("email") as string;
 const password = formData.get("password") as string;
 const role = (formData.get("role") as string) || "coach";

 if (!name || !email || !password) {
 return { success: false, error: "All fields are required" };
 }

 const existing = await db
 .select()
 .from(users)
 .where(eq(users.email, email))
 .get();

 if (existing) {
 return { success: false, error: "Email already in use" };
 }

 const passwordHash = await bcrypt.hash(password, 10);

 const [user] = await db
 .insert(users)
 .values({ name, email, passwordHash, role: role as "coach" | "athlete" })
 .returning();

 if (role === "athlete") {
 await db.insert(athleteProfiles).values({
 userId: user.id,
 coachId: null,
 });
 }

 return { success: true };
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
 if (v === null) return null;
 const s = String(v).trim();
 return s.length === 0 ? null : s;
}

function numericOrNull(v: FormDataEntryValue | null): number | null {
 const s = emptyToNull(v);
 if (s === null) return null;
 const n = Number(s);
 return Number.isFinite(n) ? n : null;
}

export async function inviteAthleteAction(formData: FormData) {
 const name = formData.get("name") as string;
 const email = formData.get("email") as string;
 const coachId = parseInt(formData.get("coachId") as string);

 if (!name || !email || !coachId) {
 return { success: false, error: "Name, email and coach are required" };
 }

 const existing = await db
 .select()
 .from(users)
 .where(eq(users.email, email))
 .get();

 if (existing) {
 return { success: false, error: "Email already in use" };
 }

 const passwordHash = await bcrypt.hash("changeme123", 10);

 const [user] = await db
 .insert(users)
 .values({ name, email, passwordHash, role: "athlete" })
 .returning();

 await db.insert(athleteProfiles).values({
 userId: user.id,
 coachId,
 sport: emptyToNull(formData.get("sport")),
 event: emptyToNull(formData.get("event")),
 dateOfBirth: emptyToNull(formData.get("dateOfBirth")),
 height: numericOrNull(formData.get("height")),
 weight: numericOrNull(formData.get("weight")),
 notes: emptyToNull(formData.get("notes")),
 });

 return { success: true, athlete: user };
}

export async function updateAthleteProfileAction(formData: FormData) {
 const userId = parseInt(formData.get("userId") as string);
 if (!userId) return { success: false, error: "Missing athlete id" };

 const existing = await db
 .select()
 .from(athleteProfiles)
 .where(eq(athleteProfiles.userId, userId))
 .get();
 if (!existing) {
 return { success: false, error: "Athlete profile not found" };
 }

 await db
 .update(athleteProfiles)
 .set({
 sport: emptyToNull(formData.get("sport")),
 event: emptyToNull(formData.get("event")),
 dateOfBirth: emptyToNull(formData.get("dateOfBirth")),
 height: numericOrNull(formData.get("height")),
 weight: numericOrNull(formData.get("weight")),
 notes: emptyToNull(formData.get("notes")),
 })
 .where(eq(athleteProfiles.userId, userId));

 return { success: true };
}
