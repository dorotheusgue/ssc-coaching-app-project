"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
 Sun,
 Moon,
 Zap,
 Heart,
 Brain,
 CheckCircle2,
 Circle,
 ChevronDown,
 ChevronUp,
 Dumbbell,
 Timer as TimerIcon,
 Ruler,
 Weight,
 Play,
 ArrowLeftRight,
 X,
 MessageSquare,
 Video,
 BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
 saveReadinessAction,
 logSetEntryAction,
 logSprintEntryAction,
 completeSessionAction,
 getSwapCandidatesAction,
 swapBlockExerciseAction,
} from "./actions";
import { sendMessageAction } from "@/app/coach/messages/actions";
import { WelcomeModal } from "./WelcomeModal";

type SessionExercise = {
 id: number;
 exerciseId: number | null;
 exerciseName: string;
 exerciseCategory: string;
 trackingType: string;
 videoUrl: string | null;
 description: string | null;
 sets: number | null;
 reps: string | null;
 load: string | null;
 distance: number | null;
 time: number | null;
 restSeconds: number | null;
 rpeTarget: number | null;
 notes: string | null;
 sortOrder: number;
};

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
 exercises: SessionExercise[];
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

type ReadinessSnapshot = {
 sleepQuality: number;
 fatigue: number;
 soreness: number;
 stress: number;
 mood: number;
 note?: string | null;
};

// ──────────────────────────────────────────────────────────────────────
// Readiness card

function ReadinessButtons({
 label,
 value,
 onChange,
 icon: Icon,
 lowLabel,
 highLabel,
}: {
 label: string;
 value: number;
 onChange: (v: number) => void;
 icon: React.ComponentType<{ className?: string }>;
 lowLabel: string;
 highLabel: string;
}) {
 return (
 <div className="space-y-1.5">
 <div className="flex items-center gap-2">
 <Icon className="w-4 h-4 text-ink" />
 <span className="text-sm text-ink">{label}</span>
 </div>
 <div className="flex gap-1.5">
 {[1, 2, 3, 4, 5].map((n) => (
 <button
 key={n}
 type="button"
 onClick={() => onChange(n)}
 className={`flex-1 py-2 text-sm font-semibold border transition-colors cursor-pointer ${
 value === n
 ? "bg-ink border-line text-bg"
 : "bg-surface/50 border-line text-ink hover:bg-hover"
 }`}
 >
 {n}
 </button>
 ))}
 </div>
 <div className="flex justify-between text-[10px] text-faint px-1">
 <span>{lowLabel}</span>
 <span>{highLabel}</span>
 </div>
 </div>
 );
}

function ReadinessForm({
 athleteId,
 today,
 assignedSessionId,
 lastReadiness,
 onSaved,
}: {
 athleteId: number;
 today: string;
 assignedSessionId: number | null;
 lastReadiness: ReadinessSnapshot | null;
 onSaved: () => void;
}) {
 const clamp5 = (v: number | null | undefined, fallback: number) =>
 v === null || v === undefined ? fallback : Math.max(1, Math.min(5, v));
 const [sleep, setSleep] = useState(clamp5(lastReadiness?.sleepQuality, 4));
 const [fatigue, setFatigue] = useState(clamp5(lastReadiness?.fatigue, 3));
 const [soreness, setSoreness] = useState(clamp5(lastReadiness?.soreness, 3));
 const [stress, setStress] = useState(clamp5(lastReadiness?.stress, 3));
 const [mood, setMood] = useState(clamp5(lastReadiness?.mood, 4));
 const [note, setNote] = useState("");
 const [isPending, startTransition] = useTransition();

 async function save() {
 const formData = new FormData();
 formData.set("athleteId", String(athleteId));
 if (assignedSessionId)
 formData.set("assignedSessionId", String(assignedSessionId));
 formData.set("date", today);
 formData.set("sleepQuality", String(sleep));
 formData.set("fatigue", String(fatigue));
 formData.set("soreness", String(soreness));
 formData.set("stress", String(stress));
 formData.set("mood", String(mood));
 formData.set("note", note);
 startTransition(async () => {
 await saveReadinessAction(formData);
 onSaved();
 });
 }

 return (
 <div className="space-y-4">
 <ReadinessButtons label="Sleep Quality" value={sleep} onChange={setSleep} icon={Moon} lowLabel="Poor" highLabel="Great" />
 <ReadinessButtons label="Energy" value={6 - fatigue} onChange={(v) => setFatigue(6 - v)} icon={Zap} lowLabel="Drained" highLabel="Fresh" />
 <ReadinessButtons label="Soreness" value={6 - soreness} onChange={(v) => setSoreness(6 - v)} icon={Heart} lowLabel="Very sore" highLabel="None" />
 <ReadinessButtons label="Stress" value={6 - stress} onChange={(v) => setStress(6 - v)} icon={Brain} lowLabel="High" highLabel="Calm" />
 <ReadinessButtons label="Mood" value={mood} onChange={setMood} icon={Sun} lowLabel="Low" highLabel="Great" />
 <div>
 <label className="block text-sm text-ink mb-1">Notes</label>
 <textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 rows={2}
 placeholder="How are you feeling?"
 className="w-full bg-surface border border-line px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink resize-none"
 />
 </div>
 <Button onClick={save} disabled={isPending} className="w-full">
 Save Readiness
 </Button>
 </div>
 );
}

// ──────────────────────────────────────────────────────────────────────
// Per-set logging row

type LoggedSetLike = {
 id: number;
 reps: number | null;
 load: number | null;
 distance: number | null;
 time: number | null;
 rpe: number | null;
 completed: boolean | null;
};

function SetRow({
 setNumber,
 target,
 trackingType,
 existing,
 sessionId,
 blockExerciseId,
 exerciseId,
 isSprint,
 onComplete,
}: {
 setNumber: number;
 target: SessionExercise;
 trackingType: string;
 existing: LoggedSetLike | undefined;
 sessionId: number;
 blockExerciseId: number;
 exerciseId: number | null;
 isSprint: boolean;
 onComplete: () => void;
}) {
 const completed = !!existing?.completed;
 const [reps, setReps] = useState(
 existing?.reps?.toString() ?? (target.reps && /^\d+$/.test(target.reps) ? target.reps : "")
 );
 const [load, setLoad] = useState(existing?.load?.toString() ?? "");
 const [distance, setDistance] = useState(
 existing?.distance?.toString() ?? target.distance?.toString() ?? ""
 );
 const [time, setTime] = useState(existing?.time?.toString() ?? "");
 const [rpe, setRpe] = useState(
 existing?.rpe?.toString() ?? target.rpeTarget?.toString() ?? ""
 );
 const [isPending, startTransition] = useTransition();

 async function toggle() {
 if (completed) return; // re-completing not supported here; just feedback
 const formData = new FormData();
 formData.set("assignedSessionId", String(sessionId));
 formData.set("blockExerciseId", String(blockExerciseId));
 if (exerciseId) formData.set("exerciseId", String(exerciseId));
 formData.set("setNumber", String(setNumber));
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
 onComplete();
 });
 }

 return (
 <div
 className={`flex items-center gap-2 py-2 px-2 border-b border-line/50 last:border-0 ${
 completed ? "opacity-70" : ""
 }`}
 >
 <button
 onClick={toggle}
 disabled={isPending || completed}
 className="shrink-0 cursor-pointer"
 aria-label={completed ? "Set completed" : `Mark set ${setNumber} complete`}
 >
 {completed ? (
 <CheckCircle2 className="w-6 h-6 text-ink" />
 ) : (
 <Circle className="w-6 h-6 text-faint hover:text-ink transition-colors" />
 )}
 </button>
 <div className="w-6 text-xs text-mute font-mono tabular-nums shrink-0">
 {setNumber}
 </div>
 <div className="flex-1 grid grid-cols-3 gap-1.5 min-w-0">
 {(trackingType === "reps" || trackingType === "load") && (
 <>
 <input
 type="number"
 inputMode="numeric"
 placeholder="reps"
 value={reps}
 onChange={(e) => setReps(e.target.value)}
 disabled={completed}
 className="w-full bg-surface border border-line px-2 py-1.5 text-ink text-sm text-center focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-transparent"
 />
 <input
 type="number"
 inputMode="decimal"
 placeholder="kg"
 value={load}
 onChange={(e) => setLoad(e.target.value)}
 disabled={completed}
 className="w-full bg-surface border border-line px-2 py-1.5 text-ink text-sm text-center focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-transparent"
 />
 </>
 )}
 {trackingType === "distance" && (
 <input
 type="number"
 inputMode="decimal"
 placeholder="m"
 value={distance}
 onChange={(e) => setDistance(e.target.value)}
 disabled={completed}
 className="col-span-2 w-full bg-surface border border-line px-2 py-1.5 text-ink text-sm text-center focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-transparent"
 />
 )}
 {trackingType === "time" && (
 <input
 type="number"
 step="0.01"
 inputMode="decimal"
 placeholder="sec"
 value={time}
 onChange={(e) => setTime(e.target.value)}
 disabled={completed}
 className="col-span-2 w-full bg-surface border border-line px-2 py-1.5 text-ink text-sm text-center focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-transparent"
 />
 )}
 <input
 type="number"
 step="0.5"
 min="1"
 max="10"
 inputMode="decimal"
 placeholder="RPE"
 value={rpe}
 onChange={(e) => setRpe(e.target.value)}
 disabled={completed}
 className="w-full bg-surface border border-line px-2 py-1.5 text-ink text-sm text-center focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-transparent"
 />
 </div>
 </div>
 );
}

// ──────────────────────────────────────────────────────────────────────
// Swap exercise modal

type SwapCandidate = {
 id: number;
 name: string;
 category: string;
 movementPattern: string | null;
 trackingType: string;
 description: string | null;
 videoUrl: string | null;
};

function SwapModal({
 blockExerciseId,
 currentName,
 onClose,
 onSwapped,
}: {
 blockExerciseId: number;
 currentName: string;
 onClose: () => void;
 onSwapped: () => void;
}) {
 const [candidates, setCandidates] = useState<SwapCandidate[] | null>(null);
 const [loading, setLoading] = useState(true);
 const [swapping, setSwapping] = useState<number | null>(null);

 useEffect(() => {
 let mounted = true;
 getSwapCandidatesAction(blockExerciseId).then((res) => {
 if (!mounted) return;
 setLoading(false);
 if (res.ok) setCandidates(res.candidates);
 });
 return () => {
 mounted = false;
 };
 }, [blockExerciseId]);

 async function pick(id: number) {
 setSwapping(id);
 const res = await swapBlockExerciseAction(blockExerciseId, id);
 setSwapping(null);
 if (res.ok) onSwapped();
 }

 return (
 <Modal open onClose={onClose} title={`Swap "${currentName}"`}>
 <div className="space-y-2 max-h-[60vh] overflow-y-auto">
 {loading && (
 <p className="text-mute text-sm py-6 text-center">Loading…</p>
 )}
 {!loading && (candidates?.length ?? 0) === 0 && (
 <p className="text-mute text-sm py-6 text-center">
 No similar exercises found.
 </p>
 )}
 {candidates?.map((c) => (
 <button
 key={c.id}
 onClick={() => pick(c.id)}
 disabled={swapping !== null}
 className="w-full text-left p-3 border border-line hover:bg-hover transition-colors disabled:opacity-50 cursor-pointer"
 >
 <div className="text-ink font-medium text-sm">{c.name}</div>
 <div className="text-mute text-xs mt-0.5 flex items-center gap-2">
 <span className="capitalize">{c.category}</span>
 {c.movementPattern && (
 <>
 <span>·</span>
 <span className="capitalize">{c.movementPattern}</span>
 </>
 )}
 </div>
 </button>
 ))}
 </div>
 </Modal>
 );
}

// ──────────────────────────────────────────────────────────────────────
// Exercise card (with video, notes, per-set rows, swap)

function ExerciseLogCard({
 exercise,
 sessionId,
 loggedSets,
 loggedSprints,
 onStartRest,
 onChanged,
}: {
 exercise: SessionExercise;
 sessionId: number;
 loggedSets: SessionData["loggedSets"];
 loggedSprints: SessionData["loggedSprints"];
 onStartRest: (seconds: number, exerciseName: string) => void;
 onChanged: () => void;
}) {
 const [expanded, setExpanded] = useState(false);
 const [swapOpen, setSwapOpen] = useState(false);

 const isSprint =
 exercise.trackingType === "time" || exercise.trackingType === "distance";

 const exerciseLogs = useMemo<LoggedSetLike[]>(() => {
 if (isSprint) {
 return loggedSprints
 .filter((s) => s.blockExerciseId === exercise.id)
 .map((s) => ({
 id: s.id,
 reps: null,
 load: null,
 distance: s.distance,
 time: s.time,
 rpe: s.rpe,
 completed: s.completed,
 }));
 }
 return loggedSets
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
 }, [exercise.id, isSprint, loggedSets, loggedSprints]);

 const completedSets = exerciseLogs.filter((s) => s.completed).length;
 const targetSets = Math.max(exercise.sets ?? 1, completedSets);

 const Icon =
 exercise.trackingType === "time"
 ? TimerIcon
 : exercise.trackingType === "distance"
 ? Ruler
 : exercise.trackingType === "load"
 ? Weight
 : Dumbbell;

 // Existing logs index keyed by setNumber so we can pre-fill rows.
 const logsBySetNumber = useMemo(() => {
 const m = new Map<number, LoggedSetLike>();
 if (isSprint) {
 loggedSprints
 .filter((s) => s.blockExerciseId === exercise.id)
 .forEach((s) =>
 m.set(s.repNumber, {
 id: s.id,
 reps: null,
 load: null,
 distance: s.distance,
 time: s.time,
 rpe: s.rpe,
 completed: s.completed,
 })
 );
 } else {
 loggedSets
 .filter((s) => s.blockExerciseId === exercise.id)
 .forEach((s) =>
 m.set(s.setNumber, {
 id: s.id,
 reps: s.reps,
 load: s.load,
 distance: s.distance,
 time: s.time,
 rpe: s.rpe,
 completed: s.completed,
 })
 );
 }
 return m;
 }, [exercise.id, isSprint, loggedSets, loggedSprints]);

 function handleSetComplete() {
 if (exercise.restSeconds && exercise.restSeconds > 0) {
 onStartRest(exercise.restSeconds, exercise.exerciseName);
 }
 onChanged();
 }

 const youTubeEmbed = (() => {
 const url = exercise.videoUrl;
 if (!url) return null;
 const m = url.match(
 /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
 );
 return m ? `https://www.youtube.com/embed/${m[1]}` : null;
 })();

 const cueText = exercise.notes ?? exercise.description ?? null;

 return (
 <div className="bg-surface border border-line">
 <button
 onClick={() => setExpanded(!expanded)}
 className="w-full flex items-center justify-between p-4 text-left"
 >
 <div className="flex items-center gap-3 min-w-0">
 <Icon className="w-5 h-5 text-ink shrink-0" />
 <div className="min-w-0">
 <div className="text-ink font-medium truncate">
 {exercise.exerciseName}
 </div>
 <div className="text-mute text-sm truncate">
 {exercise.sets && `${exercise.sets} sets`}
 {exercise.reps && ` × ${exercise.reps} reps`}
 {exercise.load && ` @ ${exercise.load}`}
 {exercise.distance && ` ${exercise.distance}m`}
 {exercise.time && ` ${exercise.time}s`}
 {exercise.rpeTarget !== null &&
 exercise.rpeTarget !== undefined &&
 ` · RPE ${exercise.rpeTarget}`}
 {exercise.restSeconds && ` · ${exercise.restSeconds}s rest`}
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge
 color={completedSets >= (exercise.sets ?? 1) ? "emerald" : "neutral"}
 >
 {completedSets}/{exercise.sets ?? 1}
 </Badge>
 {!expanded && completedSets === 0 ? (
 <span className="inline-flex items-center gap-1 text-xs font-medium text-ink">
 <Play className="w-3.5 h-3.5" />
 Start
 </span>
 ) : expanded ? (
 <ChevronUp className="w-4 h-4 text-mute" />
 ) : (
 <ChevronDown className="w-4 h-4 text-mute" />
 )}
 </div>
 </button>

 {expanded && (
 <div className="px-4 pb-4 space-y-4">
 {(youTubeEmbed || exercise.videoUrl) && (
 <div className="border border-line bg-bg">
 {youTubeEmbed ? (
 <iframe
 src={youTubeEmbed}
 className="block w-full aspect-video"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 title={exercise.exerciseName}
 />
 ) : (
 <video
 src={exercise.videoUrl ?? undefined}
 controls
 className="block w-full"
 preload="metadata"
 />
 )}
 </div>
 )}

 {cueText && (
 <div className="flex gap-2 text-sm text-ink bg-bg border border-line p-3">
 <BookOpen className="w-4 h-4 text-mute shrink-0 mt-0.5" />
 <p className="whitespace-pre-wrap">{cueText}</p>
 </div>
 )}

 <div className="border-t border-line/50">
 {Array.from({ length: targetSets }).map((_, i) => {
 const setNumber = i + 1;
 const existing = logsBySetNumber.get(setNumber);
 return (
 <SetRow
 key={`${exercise.id}-${setNumber}-${existing?.id ?? "new"}`}
 setNumber={setNumber}
 target={exercise}
 trackingType={exercise.trackingType}
 existing={existing}
 sessionId={sessionId}
 blockExerciseId={exercise.id}
 exerciseId={exercise.exerciseId}
 isSprint={isSprint}
 onComplete={handleSetComplete}
 />
 );
 })}
 </div>

 <div className="flex gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setSwapOpen(true)}
 className="flex-1"
 >
 <ArrowLeftRight className="w-4 h-4 mr-1.5" />
 Swap exercise
 </Button>
 </div>
 </div>
 )}

 {swapOpen && (
 <SwapModal
 blockExerciseId={exercise.id}
 currentName={exercise.exerciseName}
 onClose={() => setSwapOpen(false)}
 onSwapped={() => {
 setSwapOpen(false);
 onChanged();
 }}
 />
 )}
 </div>
 );
}

// ──────────────────────────────────────────────────────────────────────
// Session progress

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
 <div className="bg-surface border border-line p-6">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
 <Zap className="w-5 h-5 text-ink" />
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
 <p className="text-mute text-sm mb-3 whitespace-pre-wrap">
 {session.notes}
 </p>
 )}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between text-xs">
 <span className="text-mute">
 {completedExercises} of {totalExercises} exercises
 </span>
 <span className="text-ink font-medium">{pct}%</span>
 </div>
 <div className="h-2 w-full bg-surface overflow-hidden">
 <div
 className="h-full bg-ink transition-all"
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 </div>
 );
}

// ──────────────────────────────────────────────────────────────────────
// Interval timer (Rest / EMOM / Tabata / Free)

type TimerMode = "rest" | "emom" | "tabata" | "free";

type TimerState = {
 mode: TimerMode;
 label: string;
 phase: "work" | "rest" | "elapsed";
 secondsLeft: number; // for elapsed mode this counts UP
 phaseTotal: number;
 round: number; // current round (1-based) for emom/tabata
 rounds: number; // total rounds; 0 = infinite (free mode)
 // mode-specific config to advance to next phase
 workSeconds: number;
 restSeconds: number;
};

function formatClock(s: number) {
 const m = Math.floor(s / 60);
 const sec = s % 60;
 return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function TimerBanner({
 state,
 onSkip,
 onClose,
}: {
 state: TimerState;
 onSkip: () => void;
 onClose: () => void;
}) {
 const pct =
 state.phaseTotal === 0
 ? 0
 : state.mode === "free"
 ? 100
 : Math.max(0, (state.secondsLeft / state.phaseTotal) * 100);

 return (
 <div className="sticky top-2 z-30 bg-bg/80 backdrop-blur-sm border border-rule p-4 flex items-center gap-4 shadow-lg">
 <div className="text-3xl font-bold tabular-nums text-ink min-w-[5ch]">
 {formatClock(state.secondsLeft)}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-[10px] text-mute font-medium uppercase tracking-wider">
 {state.mode.toUpperCase()}
 {state.rounds > 0 && ` · round ${state.round}/${state.rounds}`}
 {state.mode !== "free" && ` · ${state.phase}`}
 </div>
 <div className="text-sm text-ink truncate">{state.label}</div>
 <div className="h-1 w-full bg-line overflow-hidden mt-1.5">
 <div
 className="h-full bg-ink transition-all"
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 <button
 onClick={onSkip}
 className="text-ink text-xs font-medium px-2 py-1 hover:bg-hover transition-colors cursor-pointer"
 >
 Skip
 </button>
 <button
 onClick={onClose}
 className="text-mute hover:text-ink transition-colors cursor-pointer"
 aria-label="Close timer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 );
}

function TimerLauncher({
 onStart,
}: {
 onStart: (s: TimerState) => void;
}) {
 const [open, setOpen] = useState(false);
 const [mode, setMode] = useState<TimerMode>("rest");
 // Mode params
 const [restSec, setRestSec] = useState(90);
 const [emomWork, setEmomWork] = useState(60);
 const [emomRounds, setEmomRounds] = useState(10);
 const [tabataRounds, setTabataRounds] = useState(8);

 function launch() {
 if (mode === "rest") {
 onStart({
 mode: "rest",
 label: "Rest",
 phase: "rest",
 secondsLeft: restSec,
 phaseTotal: restSec,
 round: 1,
 rounds: 1,
 workSeconds: 0,
 restSeconds: restSec,
 });
 } else if (mode === "emom") {
 onStart({
 mode: "emom",
 label: `EMOM × ${emomRounds}`,
 phase: "work",
 secondsLeft: emomWork,
 phaseTotal: emomWork,
 round: 1,
 rounds: emomRounds,
 workSeconds: emomWork,
 restSeconds: 0,
 });
 } else if (mode === "tabata") {
 onStart({
 mode: "tabata",
 label: `Tabata × ${tabataRounds} (20/10)`,
 phase: "work",
 secondsLeft: 20,
 phaseTotal: 20,
 round: 1,
 rounds: tabataRounds,
 workSeconds: 20,
 restSeconds: 10,
 });
 } else {
 onStart({
 mode: "free",
 label: "Stopwatch",
 phase: "elapsed",
 secondsLeft: 0,
 phaseTotal: 0,
 round: 1,
 rounds: 0,
 workSeconds: 0,
 restSeconds: 0,
 });
 }
 setOpen(false);
 }

 return (
 <>
 <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
 <TimerIcon className="w-4 h-4 mr-1.5" />
 Timer
 </Button>
 <Modal open={open} onClose={() => setOpen(false)} title="Start a timer">
 <div className="space-y-4">
 <div className="grid grid-cols-4 gap-1.5">
 {(["rest", "emom", "tabata", "free"] as const).map((m) => (
 <button
 key={m}
 onClick={() => setMode(m)}
 className={`py-2 text-xs font-semibold border capitalize transition-colors cursor-pointer ${
 mode === m
 ? "bg-ink border-line text-bg"
 : "bg-surface border-line text-ink hover:bg-hover"
 }`}
 >
 {m}
 </button>
 ))}
 </div>
 {mode === "rest" && (
 <label className="block">
 <span className="text-sm text-ink">Rest seconds</span>
 <input
 type="number"
 min={5}
 value={restSec}
 onChange={(e) => setRestSec(parseInt(e.target.value) || 0)}
 className="mt-1 w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </label>
 )}
 {mode === "emom" && (
 <div className="grid grid-cols-2 gap-3">
 <label className="block">
 <span className="text-sm text-ink">Interval (s)</span>
 <input
 type="number"
 min={10}
 value={emomWork}
 onChange={(e) => setEmomWork(parseInt(e.target.value) || 0)}
 className="mt-1 w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </label>
 <label className="block">
 <span className="text-sm text-ink">Rounds</span>
 <input
 type="number"
 min={1}
 value={emomRounds}
 onChange={(e) => setEmomRounds(parseInt(e.target.value) || 0)}
 className="mt-1 w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </label>
 </div>
 )}
 {mode === "tabata" && (
 <label className="block">
 <span className="text-sm text-ink">Rounds (20s work / 10s rest)</span>
 <input
 type="number"
 min={1}
 value={tabataRounds}
 onChange={(e) =>
 setTabataRounds(parseInt(e.target.value) || 0)
 }
 className="mt-1 w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </label>
 )}
 {mode === "free" && (
 <p className="text-sm text-mute">
 Free stopwatch counts up from 00:00.
 </p>
 )}
 <Button onClick={launch} className="w-full">
 <Play className="w-4 h-4 mr-1.5" />
 Start
 </Button>
 </div>
 </Modal>
 </>
 );
}

// ──────────────────────────────────────────────────────────────────────
// Main client

type SessionMessage = {
 id: number;
 senderId: number;
 text: string;
 mediaUrl: string | null;
 mediaType: string | null;
 createdAt: Date | null;
};

export default function TodayClient({
 session,
 athleteId,
 userName,
 today,
 todayReadiness,
 lastReadiness,
 conversationId,
 sessionMessages: initialSessionMessages,
}: {
 session: SessionData | null;
 athleteId: number;
 userName: string;
 today: string;
 todayReadiness: ReadinessSnapshot | null;
 lastReadiness: ReadinessSnapshot | null;
 conversationId: number | null;
 coachId: number | null;
 sessionMessages: SessionMessage[];
}) {
 const router = useRouter();
 const [isPending, startTransition] = useTransition();

 // Interval timer
 const [timer, setTimer] = useState<TimerState | null>(null);
 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

 function stepTimer(prev: TimerState | null): TimerState | null {
 if (!prev) return null;
 // Free mode counts UP, no phase transitions
 if (prev.mode === "free") {
 return { ...prev, secondsLeft: prev.secondsLeft + 1 };
 }
 if (prev.secondsLeft > 1) {
 return { ...prev, secondsLeft: prev.secondsLeft - 1 };
 }
 // Phase tick reached zero — advance.
 if (prev.mode === "rest") {
 // single-shot
 return null;
 }
 if (prev.mode === "emom") {
 if (prev.round >= prev.rounds) return null;
 return {
 ...prev,
 round: prev.round + 1,
 phase: "work",
 secondsLeft: prev.workSeconds,
 phaseTotal: prev.workSeconds,
 };
 }
 if (prev.mode === "tabata") {
 if (prev.phase === "work") {
 return {
 ...prev,
 phase: "rest",
 secondsLeft: prev.restSeconds,
 phaseTotal: prev.restSeconds,
 };
 }
 if (prev.round >= prev.rounds) return null;
 return {
 ...prev,
 round: prev.round + 1,
 phase: "work",
 secondsLeft: prev.workSeconds,
 phaseTotal: prev.workSeconds,
 };
 }
 return null;
 }

 function startRest(seconds: number, exerciseName: string) {
 startTimer({
 mode: "rest",
 label: exerciseName,
 phase: "rest",
 secondsLeft: seconds,
 phaseTotal: seconds,
 round: 1,
 rounds: 1,
 workSeconds: 0,
 restSeconds: seconds,
 });
 }

 function startTimer(t: TimerState) {
 if (intervalRef.current) clearInterval(intervalRef.current);
 setTimer(t);
 intervalRef.current = setInterval(() => {
 setTimer((prev) => {
 const next = stepTimer(prev);
 if (!next && intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 return next;
 });
 }, 1000);
 }

 function stopTimer() {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 setTimer(null);
 }

 function skipTimer() {
 setTimer((prev) => {
 if (!prev) return null;
 // Advance to next phase immediately by jumping secondsLeft to 1, then tick.
 const advanced = stepTimer({ ...prev, secondsLeft: 1 });
 if (!advanced && intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 return advanced;
 });
 }

 useEffect(() => {
 return () => {
 if (intervalRef.current) clearInterval(intervalRef.current);
 };
 }, []);

 // Session chat
 const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>(
 initialSessionMessages
 );
 const [chatText, setChatText] = useState("");
 const [chatPending, chatStartTransition] = useTransition();

 async function sendSessionMessage() {
 if (!conversationId || !session) return;
 const text = chatText.trim();
 if (!text) return;
 setChatText("");
 setSessionMessages((prev) => [
 ...prev,
 {
 id: Date.now(),
 senderId: athleteId,
 text,
 mediaUrl: null,
 mediaType: null,
 createdAt: new Date(),
 },
 ]);
 chatStartTransition(async () => {
 const formData = new FormData();
 formData.set("conversationId", String(conversationId));
 formData.set("senderId", String(athleteId));
 formData.set("text", text);
 formData.set("assignedSessionId", String(session.id));
 await sendMessageAction(formData);
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

 const greeting =
 new Date().getHours() < 12
 ? "Good morning"
 : new Date().getHours() < 17
 ? "Good afternoon"
 : "Good evening";

 const hasReadinessToday = !!todayReadiness;
 const sessionId = session?.id ?? null;
 const readinessPrefill: ReadinessSnapshot | null =
 todayReadiness ?? lastReadiness ?? null;

 return (
 <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
 <WelcomeModal enabled={!todayReadiness && !lastReadiness} />
 {timer && (
 <TimerBanner state={timer} onSkip={skipTimer} onClose={stopTimer} />
 )}

 <div className="flex items-end justify-between gap-3">
 <div>
 <h1 className="text-2xl font-bold text-ink">
 {greeting}, {userName}
 </h1>
 <p className="text-mute text-sm mt-1">
 {new Date(today + "T12:00:00").toLocaleDateString("en-US", {
 weekday: "long",
 month: "long",
 day: "numeric",
 })}
 </p>
 </div>
 <TimerLauncher onStart={startTimer} />
 </div>

 {/* Readiness is always available, even on rest days */}
 <Card title="Readiness">
 {hasReadinessToday ? (
 <div className="flex items-center gap-2 text-ink">
 <CheckCircle2 className="w-5 h-5" />
 <span className="text-sm">
 Recorded today
 {todayReadiness?.note ? ` · ${todayReadiness.note}` : ""}
 </span>
 </div>
 ) : (
 <ReadinessForm
 athleteId={athleteId}
 today={today}
 assignedSessionId={sessionId}
 lastReadiness={readinessPrefill}
 onSaved={() => router.refresh()}
 />
 )}
 </Card>

 {!session && (
 <div className="text-center py-12">
 <Sun className="w-12 h-12 text-faint mx-auto mb-4" />
 <p className="text-mute mb-2">No training scheduled for today.</p>
 <p className="text-faint text-sm">
 Rest and recover. Check your calendar for upcoming sessions.
 </p>
 </div>
 )}

 {session && (
 <>
 <SessionProgress session={session} />

 <div className="space-y-4">
 <h2 className="text-lg font-semibold text-ink">Session</h2>
 {session.blocks.map((block) => (
 <div key={block.id} className="space-y-3">
 <div className="flex items-center gap-2">
 <Badge
 color={
 block.blockType === "warmup"
 ? "yellow"
 : block.blockType === "sprint"
 ? "blue"
 : block.blockType === "strength"
 ? "emerald"
 : "purple"
 }
 >
 {block.blockType}
 </Badge>
 {block.label && (
 <span className="text-ink text-sm font-medium">
 {block.label}
 </span>
 )}
 </div>
 {block.exercises.map((exercise) => (
 <ExerciseLogCard
 key={exercise.id}
 exercise={exercise}
 sessionId={session.id}
 loggedSets={session.loggedSets}
 loggedSprints={session.loggedSprints}
 onStartRest={startRest}
 onChanged={() => router.refresh()}
 />
 ))}
 </div>
 ))}
 </div>

 {conversationId && (
 <div className="bg-surface border border-line p-4 space-y-3">
 <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
 <MessageSquare className="w-4 h-4 text-ink" />
 Notes for coach
 </h2>
 {sessionMessages.length > 0 && (
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {sessionMessages.map((m) => {
 const mine = m.senderId === athleteId;
 return (
 <div
 key={m.id}
 className={`flex ${mine ? "justify-end" : "justify-start"}`}
 >
 <div
 className={`max-w-[80%] px-3 py-1.5 text-sm ${
 mine ? "bg-ink text-bg" : "bg-surface text-ink"
 }`}
 >
 {m.text}
 </div>
 </div>
 );
 })}
 </div>
 )}
 <div className="flex gap-2">
 <input
 type="text"
 value={chatText}
 onChange={(e) => setChatText(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && sendSessionMessage()}
 placeholder="Tell your coach how it went..."
 className="flex-1 bg-surface border border-line px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 <Button
 onClick={sendSessionMessage}
 disabled={!chatText.trim() || chatPending}
 size="sm"
 >
 Send
 </Button>
 </div>
 </div>
 )}

 {session.status !== "completed" && (
 <Button
 onClick={handleCompleteSession}
 disabled={isPending}
 className="w-full"
 size="lg"
 >
 <CheckCircle2 className="w-5 h-5 mr-2" />
 Complete Session
 </Button>
 )}
 </>
 )}

 {/* Hidden icon kept for tree-shaking awareness */}
 {false && <Video className="w-0 h-0" />}
 </div>
 );
}
