"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
 const router = useRouter();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [role, setRole] = useState<"coach" | "athlete">("coach");
 const [inviteCode, setInviteCode] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError("");
 setLoading(true);

 try {
 const { registerAction } = await import("@/lib/actions/auth");
 const formData = new FormData();
 formData.set("name", name);
 formData.set("email", email);
 formData.set("password", password);
 formData.set("role", role);
 formData.set("inviteCode", inviteCode);

 const result = await registerAction(formData);

 if (!result.success) {
 setError(result.error ?? "Registration failed");
 setLoading(false);
 return;
 }

 const signInResult = await signIn("credentials", {
 email,
 password,
 redirect: false,
 });

 if (signInResult?.error) {
 setError("Account created but login failed. Please sign in.");
 setLoading(false);
 return;
 }

 router.push("/");
 router.refresh();
 } catch (err) {
 console.error("Register error:", err);
 setError("Something went wrong");
 setLoading(false);
 }
 }

 return (
 <main className="min-h-screen bg-bg flex items-center justify-center px-4">
 <div className="w-full max-w-sm space-y-8">
 <div className="text-center">
 <h1 className="text-3xl font-bold text-ink">SSC Coach</h1>
 <p className="mt-2 text-mute">Create your account</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 {error && (
 <div className=" bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
 {error}
 </div>
 )}

 <div>
 <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
 Name
 </label>
 <input
 id="name"
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full bg-surface border border-line px-4 py-2.5 text-ink placeholder:text-faint outline-none focus:border-line focus:ring-1 focus:ring-ink transition-colors"
 placeholder="John Doe"
 />
 </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
 Email
 </label>
 <input
 id="email"
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-surface border border-line px-4 py-2.5 text-ink placeholder:text-faint outline-none focus:border-line focus:ring-1 focus:ring-ink transition-colors"
 placeholder="you@example.com"
 />
 </div>

 <div>
 <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
 Password
 </label>
 <input
 id="password"
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full bg-surface border border-line px-4 py-2.5 text-ink placeholder:text-faint outline-none focus:border-line focus:ring-1 focus:ring-ink transition-colors"
 placeholder="••••••••"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-ink mb-1.5">
 Role
 </label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 onClick={() => setRole("coach")}
 className={` border px-4 py-2.5 text-sm font-medium transition-colors ${
 role === "coach"
 ? "border-line bg-ink/10 text-ink"
 : "border-line bg-surface text-mute hover:border-line"
 }`}
 >
 Coach
 </button>
 <button
 type="button"
 onClick={() => setRole("athlete")}
 className={` border px-4 py-2.5 text-sm font-medium transition-colors ${
 role === "athlete"
 ? "border-line bg-ink/10 text-ink"
 : "border-line bg-surface text-mute hover:border-line"
 }`}
 >
 Athlete
 </button>
 </div>
 </div>

 {role === "coach" && (
 <div>
 <label
 htmlFor="inviteCode"
 className="block text-sm font-medium text-ink mb-1.5"
 >
 Coach invite code
 </label>
 <input
 id="inviteCode"
 type="text"
 value={inviteCode}
 onChange={(e) => setInviteCode(e.target.value)}
 className="w-full bg-surface border border-line px-4 py-2.5 text-ink placeholder:text-faint outline-none focus:border-line focus:ring-1 focus:ring-ink transition-colors"
 placeholder="Leave blank in dev"
 autoComplete="off"
 />
 <p className="text-xs text-faint mt-1">
 Required by your team admin. Skip if you weren&apos;t given one.
 </p>
 </div>
 )}

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-ink hover:bg-ink/90 disabled:bg-ink/40 py-2.5 text-sm font-semibold text-bg transition-colors"
 >
 {loading ? "Creating account..." : "Create Account"}
 </button>
 </form>

 <p className="text-center text-sm text-mute">
 Already have an account?{" "}
 <Link href="/login" className="text-ink hover:text-ink font-medium transition-colors">
 Sign in
 </Link>
 </p>
 </div>
 </main>
 );
}
