"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { inviteAthleteAction } from "@/lib/actions/auth";

const SPORTS = [
 "Track & Field",
 "Football",
 "Soccer",
 "Rugby",
 "Basketball",
 "Baseball",
 "Tennis",
 "Cycling",
 "Swimming",
 "Combat Sports",
 "Other",
] as const;

export function InviteAthleteButton({ coachId }: { coachId: number }) {
 const router = useRouter();
 const [open, setOpen] = useState(false);
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [sport, setSport] = useState("");
 const [event, setEvent] = useState("");
 const [dateOfBirth, setDateOfBirth] = useState("");
 const [height, setHeight] = useState("");
 const [weight, setWeight] = useState("");
 const [error, setError] = useState("");
 const [isPending, startTransition] = useTransition();

 function reset() {
 setName("");
 setEmail("");
 setSport("");
 setEvent("");
 setDateOfBirth("");
 setHeight("");
 setWeight("");
 setError("");
 }

 function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError("");
 const formData = new FormData();
 formData.set("name", name);
 formData.set("email", email);
 formData.set("coachId", String(coachId));
 formData.set("sport", sport);
 formData.set("event", event);
 formData.set("dateOfBirth", dateOfBirth);
 formData.set("height", height);
 formData.set("weight", weight);
 startTransition(async () => {
 const result = await inviteAthleteAction(formData);
 if (!result.success) {
 setError(result.error ?? "Failed to invite athlete");
 return;
 }
 setOpen(false);
 reset();
 router.refresh();
 });
 }

 return (
 <>
 <Button onClick={() => setOpen(true)}>
 <Plus className="w-4 h-4 mr-2" />
 Add Athlete
 </Button>
 <Modal
 open={open}
 onClose={() => {
 setOpen(false);
 reset();
 }}
 title="Invite Athlete"
 >
 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
 {error}
 </div>
 )}
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Name
 </label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Email
 </label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Sport
 </label>
 <select
 value={sport}
 onChange={(e) => setSport(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 >
 <option value="">—</option>
 {SPORTS.map((s) => (
 <option key={s} value={s}>
 {s}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Event
 </label>
 <input
 type="text"
 value={event}
 onChange={(e) => setEvent(e.target.value)}
 placeholder="100m, Shot Put..."
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Date of Birth
 </label>
 <input
 type="date"
 value={dateOfBirth}
 onChange={(e) => setDateOfBirth(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Height (cm)
 </label>
 <input
 type="number"
 step="0.1"
 value={height}
 onChange={(e) => setHeight(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-ink mb-1">
 Weight (kg)
 </label>
 <input
 type="number"
 step="0.1"
 value={weight}
 onChange={(e) => setWeight(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 </div>

 <p className="text-xs text-mute">
 Initial password is{" "}
 <code className="text-ink">changeme123</code>. Ask the
 athlete to change it on first login.
 </p>
 <div className="flex justify-end gap-3 pt-2">
 <Button
 type="button"
 variant="ghost"
 onClick={() => {
 setOpen(false);
 reset();
 }}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={isPending}>
 {isPending ? "Inviting..." : "Send Invite"}
 </Button>
 </div>
 </form>
 </Modal>
 </>
 );
}
