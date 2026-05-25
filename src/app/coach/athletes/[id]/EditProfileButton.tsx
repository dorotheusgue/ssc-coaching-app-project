"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { updateAthleteProfileAction } from "@/lib/actions/auth";

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

type Profile = {
  userId: number;
  sport: string | null;
  event: string | null;
  dateOfBirth: string | null;
  height: number | null;
  weight: number | null;
  notes: string | null;
};

export function EditProfileButton({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sport, setSport] = useState(profile.sport ?? "");
  const [event, setEvent] = useState(profile.event ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [height, setHeight] = useState(
    profile.height !== null ? String(profile.height) : ""
  );
  const [weight, setWeight] = useState(
    profile.weight !== null ? String(profile.weight) : ""
  );
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.set("userId", String(profile.userId));
    formData.set("sport", sport);
    formData.set("event", event);
    formData.set("dateOfBirth", dateOfBirth);
    formData.set("height", height);
    formData.set("weight", weight);
    formData.set("notes", notes);
    startTransition(async () => {
      const result = await updateAthleteProfileAction(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to update profile");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
        title="Edit profile"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Athlete Profile">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Sport
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Event
              </label>
              <input
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="100m, Shot Put..."
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                DOB
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
