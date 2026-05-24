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

export async function inviteAthleteAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const coachId = parseInt(formData.get("coachId") as string);

  if (!name || !email || !coachId) {
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

  const passwordHash = await bcrypt.hash("changeme123", 10);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "athlete" })
    .returning();

  await db.insert(athleteProfiles).values({
    userId: user.id,
    coachId,
  });

  return { success: true, athlete: user };
}
