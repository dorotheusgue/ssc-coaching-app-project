"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, X } from "lucide-react";

const STORAGE_KEY = "ssc-coach-onboarding-dismissed";

type Step = {
 label: string;
 href: string;
 done: boolean;
};

export function OnboardingChecklist({
 hasAthlete,
 hasProgram,
 hasAssignment,
}: {
 hasAthlete: boolean;
 hasProgram: boolean;
 hasAssignment: boolean;
}) {
 const [mounted, setMounted] = useState(false);
 const [dismissed, setDismissed] = useState(false);

 useEffect(() => {
 setMounted(true);
 setDismissed(
 typeof window !== "undefined" &&
 window.localStorage.getItem(STORAGE_KEY) === "1"
 );
 }, []);

 const steps: Step[] = [
 { label: "Invite your first athlete", href: "/coach/athletes", done: hasAthlete },
 { label: "Create your first program", href: "/coach/programs", done: hasProgram },
 { label: "Assign a program from the calendar", href: "/coach/calendar", done: hasAssignment },
 ];
 const allDone = steps.every((s) => s.done);

 // Hide once everything's done, when dismissed, or until hydrated.
 if (!mounted || dismissed || allDone) return null;

 function dismiss() {
 window.localStorage.setItem(STORAGE_KEY, "1");
 setDismissed(true);
 }

 const completed = steps.filter((s) => s.done).length;

 return (
 <div className="relative bg-surface border border-line p-5">
 <button
 onClick={dismiss}
 className="absolute top-3 right-3 p-1 text-mute hover:text-ink transition-colors cursor-pointer"
 title="Dismiss"
 >
 <X className="w-4 h-4" />
 </button>
 <h2 className="text-lg font-semibold text-ink">Get started</h2>
 <p className="text-mute text-sm mt-1">
 {completed} of {steps.length} steps complete
 </p>
 <ol className="mt-4 space-y-2">
 {steps.map((step, i) => (
 <li key={i}>
 <Link
 href={step.href}
 className="flex items-center gap-3 p-2 hover:bg-hover transition-colors"
 >
 {step.done ? (
 <CheckCircle2 className="w-5 h-5 text-ink" />
 ) : (
 <Circle className="w-5 h-5 text-faint" />
 )}
 <span
 className={`text-sm ${
 step.done ? "text-mute line-through" : "text-ink"
 }`}
 >
 {step.label}
 </span>
 </Link>
 </li>
 ))}
 </ol>
 </div>
 );
}
