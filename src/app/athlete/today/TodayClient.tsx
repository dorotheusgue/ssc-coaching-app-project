"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Zap,
  Heart,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Dumbbell,
  Timer,
  Ruler,
  Weight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  saveReadinessAction,
  logSetEntryAction,
  logSprintEntryAction,
  completeSessionAction,
} from "./actions";

type SessionData = {
  id: number;
  date: string;
  label: string;
  status: string;
  notes: string | null;
  readiness: {
    id: number;
    sleepQuality: number;
    fatigue: number;
    soreness: number;
    stress: number;
    mood: number;
    note: string | null;
  } | null;
  blocks: Array<{
    id: number;
    blockType: string;
    label: string | null;
    sortOrder: number;
    exercises: Array<{
      id: number;
      exerciseId: number | null;
      exerciseName: string;
      exerciseCategory: string;
      trackingType: string;
      sets: number | null;
      reps: string | null;
      load: string | null;
      distance: number | null;
      time: number | null;
      restSeconds: number | null;
      rpeTarget: number | null;
      notes: string | null;
      sortOrder: number;
    }>;
  }>;
  loggedSets: Array<{
    id: number;
    blockExerciseId: number | null;
    exerciseId: number | null;
    setNumber: number;
    reps: number | null;
    load: number | null;
    distance: number | null;
    time: number | null;
    rpe: number | null;
    completed: boolean | null;
  }>;
  loggedSprints: Array<{
    id: number;
    blockExerciseId: number | null;
    repNumber: number;
    distance: number | null;
    time: number | null;
    rpe: number | null;
    completed: boolean | null;
  }>;
};

function ReadinessButtons({
  label,
  value,
  onChange,
  icon: Icon,
  color,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-neutral-300">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
              value === n
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "bg-neutral-700/50 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-neutral-500 px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function ExerciseLogCard({
  exercise,
  sessionId,
  loggedSets,
  loggedSprints,
}: {
  exercise: SessionData["blocks"][0]["exercises"][0];
  sessionId: number;
  loggedSets: SessionData["loggedSets"];
  loggedSprints: SessionData["loggedSprints"];
}) {
  const [expanded, setExpanded] = useState(false);
  const [reps, setReps] = useState("");
  const [load, setLoad] = useState("");
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [rpe, setRpe] = useState("");
  const [isPending, startTransition] = useTransition();

  const isSprint =
    exercise.trackingType === "time" || exercise.trackingType === "distance";
  const exerciseLogs = isSprint
    ? loggedSprints
        .filter((s) => s.blockExerciseId === exercise.id)
        .map((s) => ({
          id: s.id,
          reps: null as number | null,
          load: null as number | null,
          distance: s.distance,
          time: s.time,
          rpe: s.rpe,
          completed: s.completed,
        }))
    : loggedSets
        .filter((s) => s.blockExerciseId === exercise.id)
        .map((s) => ({
          id: s.id,
          reps: s.reps,
          load: s.load,
          distance: s.distance,
          time: s.time,
          rpe: s.rpe,
          completed: s.completed,
        }));
  const completedSets = exerciseLogs.filter((s) => s.completed).length;

  async function handleLogSet() {
    const formData = new FormData();
    formData.set("assignedSessionId", String(sessionId));
    formData.set("blockExerciseId", String(exercise.id));
    formData.set("exerciseId", String(exercise.exerciseId ?? ""));
    formData.set("setNumber", String(completedSets + 1));
    if (reps) formData.set("reps", reps);
    if (load) formData.set("load", load);
    if (distance) formData.set("distance", distance);
    if (time) formData.set("time", time);
    if (rpe) formData.set("rpe", rpe);
    formData.set("completed", "true");

    startTransition(async () => {
      if (isSprint) {
        await logSprintEntryAction(formData);
      } else {
        await logSetEntryAction(formData);
      }
      setReps("");
      setLoad("");
      setDistance("");
      setTime("");
      setRpe("");
    });
  }

  const icon = exercise.trackingType === "time" ? Timer :
    exercise.trackingType === "distance" ? Ruler :
    exercise.trackingType === "load" ? Weight : Dumbbell;
  const Icon = icon;

  return (
    <div className="bg-neutral-750 rounded-lg border border-neutral-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-white font-medium">{exercise.exerciseName}</div>
            <div className="text-neutral-400 text-sm">
              {exercise.sets && `${exercise.sets} sets`}
              {exercise.reps && ` x ${exercise.reps} reps`}
              {exercise.load && ` @ ${exercise.load}`}
              {exercise.distance && ` ${exercise.distance}m`}
              {exercise.time && ` ${exercise.time}s`}
              {exercise.rpeTarget !== null &&
                exercise.rpeTarget !== undefined &&
                ` · RPE ${exercise.rpeTarget}`}
              {exercise.restSeconds && ` | ${exercise.restSeconds}s rest`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={completedSets >= (exercise.sets ?? 1) ? "emerald" : "neutral"}>
            {completedSets}/{exercise.sets ?? 1}
          </Badge>
          {!expanded && completedSets === 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
              <Play className="w-3.5 h-3.5" />
              Start
            </span>
          ) : expanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {exerciseLogs.length > 0 && (
            <div className="space-y-1">
              {exerciseLogs.map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-center gap-2 text-sm text-neutral-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Set {i + 1}:</span>
                  {log.reps && <span>{log.reps} reps</span>}
                  {log.load && <span>@ {log.load}</span>}
                  {log.distance && <span>{log.distance}m</span>}
                  {log.time && <span>{log.time}s</span>}
                  {log.rpe && <span>RPE {log.rpe}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(exercise.trackingType === "reps" || exercise.trackingType === "load") && (
              <>
                <input
                  type="number"
                  placeholder="Reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Load (kg)"
                  value={load}
                  onChange={(e) => setLoad(e.target.value)}
                  className="bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </>
            )}
            {exercise.trackingType === "distance" && (
              <input
                type="number"
                placeholder="Distance (m)"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
            {exercise.trackingType === "time" && (
              <input
                type="number"
                step="0.01"
                placeholder="Time (s)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
            <input
              type="number"
              placeholder="RPE (1-10)"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="bg-neutral-700 border border-neutral-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <Button onClick={handleLogSet} disabled={isPending} size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            Log Set {completedSets + 1}
          </Button>
        </div>
      )}
    </div>
  );
}

function SessionProgress({ session }: { session: SessionData }) {
  const totalExercises = session.blocks.reduce(
    (sum, b) => sum + b.exercises.length,
    0
  );
  const completedExercises = session.blocks.reduce((sum, b) => {
    return (
      sum +
      b.exercises.filter((ex) => {
        const isSprint =
          ex.trackingType === "time" || ex.trackingType === "distance";
        const logs = isSprint
          ? session.loggedSprints.filter((s) => s.blockExerciseId === ex.id)
          : session.loggedSets.filter((s) => s.blockExerciseId === ex.id);
        const done = logs.filter((l) => l.completed).length;
        return done >= (ex.sets ?? 1);
      }).length
    );
  }, 0);
  const pct =
    totalExercises === 0
      ? 0
      : Math.round((completedExercises / totalExercises) * 100);

  return (
    <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          {session.label}
        </h2>
        <Badge
          color={
            session.status === "completed"
              ? "emerald"
              : session.status === "in_progress"
                ? "yellow"
                : "neutral"
          }
        >
          {session.status}
        </Badge>
      </div>
      {session.notes && (
        <p className="text-neutral-400 text-sm mb-3">{session.notes}</p>
      )}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400">
            {completedExercises} of {totalExercises} exercises
          </span>
          <span className="text-emerald-400 font-medium">{pct}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TodayClient({
  session,
  athleteId,
  userName,
  today,
  lastReadiness,
}: {
  session: SessionData | null;
  athleteId: number;
  userName: string;
  today: string;
  lastReadiness: {
    sleepQuality: number;
    fatigue: number;
    soreness: number;
    stress: number;
    mood: number;
  } | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Use today's entry if present, else prefill from last entry, else neutral 3.
  const clamp5 = (v: number | null | undefined, fallback: number) =>
    v === null || v === undefined
      ? fallback
      : Math.max(1, Math.min(5, v));
  const initial = session?.readiness ?? lastReadiness ?? null;
  const [sleep, setSleep] = useState(clamp5(initial?.sleepQuality, 4));
  const [fatigue, setFatigue] = useState(clamp5(initial?.fatigue, 3));
  const [soreness, setSoreness] = useState(clamp5(initial?.soreness, 3));
  const [stress, setStress] = useState(clamp5(initial?.stress, 3));
  const [mood, setMood] = useState(clamp5(initial?.mood, 4));
  const [note, setNote] = useState(session?.readiness?.note ?? "");

  const hasReadiness = !!session?.readiness;

  async function handleSaveReadiness() {
    const formData = new FormData();
    formData.set("athleteId", String(athleteId));
    formData.set("assignedSessionId", String(session?.id ?? ""));
    formData.set("date", today);
    formData.set("sleepQuality", String(sleep));
    formData.set("fatigue", String(fatigue));
    formData.set("soreness", String(soreness));
    formData.set("stress", String(stress));
    formData.set("mood", String(mood));
    formData.set("note", note);

    startTransition(async () => {
      await saveReadinessAction(formData);
      router.refresh();
    });
  }

  async function handleCompleteSession() {
    if (!session) return;
    const formData = new FormData();
    formData.set("assignedSessionId", String(session.id));

    startTransition(async () => {
      await completeSessionAction(formData);
      router.refresh();
    });
  }

  const greeting = new Date().getHours() < 12
    ? "Good morning"
    : new Date().getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="text-center py-16">
          <Sun className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {greeting}, {userName}
          </h1>
          <p className="text-neutral-400 mb-6">No training scheduled for today.</p>
          <p className="text-neutral-500 text-sm">Rest and recover. Check your calendar for upcoming sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {userName}
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          {new Date(today + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <SessionProgress session={session} />

      <Card title="Readiness Check">
        {hasReadiness ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>Readiness recorded</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ReadinessButtons label="Sleep Quality" value={sleep} onChange={setSleep} icon={Moon} color="text-blue-400" lowLabel="Poor" highLabel="Great" />
            <ReadinessButtons label="Energy" value={6 - fatigue} onChange={(v) => setFatigue(6 - v)} icon={Zap} color="text-yellow-400" lowLabel="Drained" highLabel="Fresh" />
            <ReadinessButtons label="Soreness" value={6 - soreness} onChange={(v) => setSoreness(6 - v)} icon={Heart} color="text-red-400" lowLabel="Very sore" highLabel="None" />
            <ReadinessButtons label="Stress" value={6 - stress} onChange={(v) => setStress(6 - v)} icon={Brain} color="text-purple-400" lowLabel="High" highLabel="Calm" />
            <ReadinessButtons label="Mood" value={mood} onChange={setMood} icon={Sun} color="text-emerald-400" lowLabel="Low" highLabel="Great" />
            <div>
              <label className="block text-sm text-neutral-300 mb-1">Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="How are you feeling?"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <Button onClick={handleSaveReadiness} disabled={isPending} className="w-full">
              Save Readiness
            </Button>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Session</h2>
        {session.blocks.map((block) => (
          <div key={block.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge color={block.blockType === "warmup" ? "yellow" : block.blockType === "sprint" ? "blue" : block.blockType === "strength" ? "emerald" : "purple"}>
                {block.blockType}
              </Badge>
              {block.label && (
                <span className="text-neutral-300 text-sm font-medium">{block.label}</span>
              )}
            </div>
            {block.exercises.map((exercise) => (
              <ExerciseLogCard
                key={exercise.id}
                exercise={exercise}
                sessionId={session.id}
                loggedSets={session.loggedSets}
                loggedSprints={session.loggedSprints}
              />
            ))}
          </div>
        ))}
      </div>

      {session.status !== "completed" && (
        <Button onClick={handleCompleteSession} disabled={isPending} className="w-full" size="lg">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Complete Session
        </Button>
      )}
    </div>
  );
}
