"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Activity, Dumbbell, MessageSquare, Timer } from "lucide-react";

const STORAGE_KEY = "ssc-athlete-welcome-dismissed";

export function WelcomeModal({ enabled }: { enabled: boolean }) {
 const [open, setOpen] = useState(false);

 useEffect(() => {
 if (!enabled) return;
 if (typeof window === "undefined") return;
 if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
 setOpen(true);
 }, [enabled]);

 function dismiss() {
 if (typeof window !== "undefined") {
 window.localStorage.setItem(STORAGE_KEY, "1");
 }
 setOpen(false);
 }

 if (!open) return null;

 const steps = [
 {
 icon: Activity,
 title: "Start with a readiness check",
 body: "Five sliders — sleep, energy, soreness, stress, mood — take about 15 seconds. Coach sees the trend over time.",
 },
 {
 icon: Dumbbell,
 title: "Log sets as you train",
 body: "Tap the circle next to each set to mark it complete. Fill in reps, load, and RPE inline. A rest timer kicks in automatically.",
 },
 {
 icon: Timer,
 title: "Use the interval timer",
 body: "Hit Timer up top to launch a rest countdown, EMOM, or Tabata. The clock stays visible while you log.",
 },
 {
 icon: MessageSquare,
 title: "Talk to your coach",
 body: "Send notes or a quick video for any session. The thread is attached to the workout, so context is never lost.",
 },
 ];

 return (
 <Modal open={open} onClose={dismiss} title="Welcome to SSC">
 <div className="space-y-4">
 <p className="text-mute text-sm">
 A 30-second tour before you train.
 </p>
 <ul className="space-y-3">
 {steps.map((step, i) => {
 const Icon = step.icon;
 return (
 <li key={i} className="flex gap-3">
 <div className="w-8 h-8 shrink-0 bg-ink/10 flex items-center justify-center">
 <Icon className="w-4 h-4 text-ink" />
 </div>
 <div className="min-w-0">
 <div className="text-sm font-medium text-ink">
 {step.title}
 </div>
 <p className="text-xs text-mute mt-0.5">{step.body}</p>
 </div>
 </li>
 );
 })}
 </ul>
 <Button onClick={dismiss} className="w-full">
 Got it
 </Button>
 </div>
 </Modal>
 );
}
