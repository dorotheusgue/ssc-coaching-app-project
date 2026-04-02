import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === "coach") {
      redirect("/coach/dashboard");
    } else {
      redirect("/athlete/today");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
            SSC Coach
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400">
            Sprint & Strength Coaching Platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-lg bg-neutral-800 border border-neutral-700 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
