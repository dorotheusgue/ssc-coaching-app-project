import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getAuthUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return {
    id: (session.user as { id?: string }).id ?? "",
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as { role?: string }).role ?? "athlete",
  };
}

export async function requireCoach() {
  const user = await getAuthUser();
  if (user.role !== "coach" && user.role !== "admin") redirect("/athlete/today");
  return user;
}

export async function requireAthlete() {
  const user = await getAuthUser();
  if (user.role !== "athlete") redirect("/coach/dashboard");
  return user;
}
