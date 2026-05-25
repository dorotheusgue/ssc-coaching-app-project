"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
 Plus,
 Trash2,
 Pencil,
 X,
 Search,
 StickyNote,
 Save,
 Sparkles,
 Upload,
 Play,
 Dumbbell,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { getVideoThumbnail } from "@/lib/videoThumb";
import {
 createPhase,
 updatePhase,
 deletePhase,
 createSessionTemplate,
 deleteSessionTemplate,
 createSessionBlock,
 deleteSessionBlock,
 addExerciseToBlock,
 removeExerciseFromBlock,
 updateProgram,
 updateBlockExercise,
} from "../actions";
import { generateProgramFromPromptAction } from "@/lib/ai/generateProgram";

type Program = {
 id: number;
 name: string;
 description: string | null;
 status: string;
 notes: string | null;
 coachId: number;
};

type Phase = {
 id: number;
 programId: number;
 name: string;
 goal: string | null;
 sortOrder: number;
 startWeek: number;
 endWeek: number;
};

type SessionTemplate = {
 id: number;
 phaseId: number;
 dayOfWeek: number;
 week: number;
 label: string;
 sortOrder: number;
 notes: string | null;
};

type SessionBlock = {
 id: number;
 sessionTemplateId: number;
 blockType: string;
 label: string | null;
 sortOrder: number;
 restSeconds: number | null;
};

type BlockExercise = {
 id: number;
 blockId: number;
 exerciseId: number | null;
 sets: number | null;
 reps: string | null;
 load: string | null;
 percent1RM: number | null;
 distance: number | null;
 time: number | null;
 restSeconds: number | null;
 rpeTarget: number | null;
 notes: string | null;
 sortOrder: number;
 exerciseName: string | null;
 exerciseCategory: string | null;
 exerciseTrackingType: string | null;
};

type Exercise = {
 id: number;
 name: string;
 category: string;
 tags: unknown;
 description: string | null;
 videoUrl: string | null;
 trackingType: string;
 coachId: number | null;
 isDefault: boolean | null;
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_TYPES = ["warmup", "sprint", "strength", "accessory", "notes"] as const;

const blockTypeColors: Record<string, string> = {
 warmup: "bg-ink/10 border-line",
 sprint: "bg-ink/10 border-line",
 strength: "bg-ink/10 border-line",
 accessory: "bg-ink/10 border-line",
 notes: "bg-surface/50 border-line",
};

export default function ProgramBuilderClient({
 program: initialProgram,
 phases: initialPhases,
 templates: initialTemplates,
 blocks: initialBlocks,
 blockExercises: initialBlockExercises,
 allExercises,
}: {
 program: Program;
 phases: Phase[];
 templates: SessionTemplate[];
 blocks: SessionBlock[];
 blockExercises: BlockExercise[];
 allExercises: Exercise[];
 coachId: number;
}) {
 const [program, setProgram] = useState(initialProgram);
 const [phases, setPhases] = useState<Phase[]>(initialPhases);
 const [templates, setTemplates] = useState<SessionTemplate[]>(initialTemplates);
 const [blocks, setBlocks] = useState<SessionBlock[]>(initialBlocks);
 const [blockExercises, setBlockExercises] = useState<BlockExercise[]>(initialBlockExercises);
 const [editingProgram, setEditingProgram] = useState(false);
 const [editProgramName, setEditProgramName] = useState(program.name);
 const [editProgramDesc, setEditProgramDesc] = useState(program.description ?? "");
 const [editProgramStatus, setEditProgramStatus] = useState(program.status);
 const [exercisePicker, setExercisePicker] = useState<{
 blockId: number;
 } | null>(null);
 const [exerciseSearch, setExerciseSearch] = useState("");
 const [activePhaseId, setActivePhaseId] = useState<number | null>(
 initialPhases[0]?.id ?? null
 );
 // Selected week tab per phase. 0 = "All weeks" (replays across phase).
 const [activeWeekByPhase, setActiveWeekByPhase] = useState<
 Record<number, number>
 >({});
 const [addingBlockTo, setAddingBlockTo] = useState<number | null>(null);
 const [editingExerciseId, setEditingExerciseId] = useState<number | null>(
 null
 );
 const router = useRouter();
 const [aiOpen, setAiOpen] = useState(false);
 const [aiPrompt, setAiPrompt] = useState("");
 const [aiLoading, setAiLoading] = useState(false);
 const [aiFileName, setAiFileName] = useState<string | null>(null);
 const [aiResult, setAiResult] = useState<
 | { kind: "ok"; phasesAdded: number; sessionsAdded: number; unknownExercises: string[] }
 | { kind: "err"; message: string }
 | null
 >(null);

 const handleAiFileChange = async (
 e: React.ChangeEvent<HTMLInputElement>
 ) => {
 const file = e.target.files?.[0];
 e.target.value = "";
 if (!file) return;
 if (file.size > 5_000_000) {
 setAiResult({ kind: "err", message: "File too large (max 5 MB)." });
 return;
 }
 try {
 const text = await file.text();
 if (text.length > 200_000) {
 setAiResult({
 kind: "err",
 message: "File contents too long (max 200,000 characters).",
 });
 return;
 }
 setAiPrompt(text);
 setAiFileName(file.name);
 setAiResult(null);
 } catch {
 setAiResult({ kind: "err", message: "Could not read file." });
 }
 };

 const handleAiGenerate = async () => {
 if (!aiPrompt.trim()) return;
 setAiLoading(true);
 setAiResult(null);
 try {
 const res = await generateProgramFromPromptAction(program.id, aiPrompt);
 if (res.success) {
 setAiResult({
 kind: "ok",
 phasesAdded: res.phasesAdded,
 sessionsAdded: res.sessionsAdded,
 unknownExercises: res.unknownExercises,
 });
 setAiPrompt("");
 router.refresh();
 } else {
 setAiResult({ kind: "err", message: res.error });
 }
 } catch (err) {
 console.error(err);
 setAiResult({ kind: "err", message: "Unexpected error. Try again." });
 } finally {
 setAiLoading(false);
 }
 };

 const handleSaveProgram = async () => {
 await updateProgram(program.id, {
 name: editProgramName,
 description: editProgramDesc,
 status: editProgramStatus,
 });
 setProgram((p) => ({
 ...p,
 name: editProgramName,
 description: editProgramDesc,
 status: editProgramStatus,
 }));
 setEditingProgram(false);
 };

 const handleAddPhase = async () => {
 const phase = await createPhase({
 programId: program.id,
 name: `Phase ${phases.length + 1}`,
 startWeek: phases.length * 4 + 1,
 endWeek: phases.length * 4 + 4,
 sortOrder: phases.length,
 });
 setPhases((prev) => [...prev, phase]);
 setActivePhaseId(phase.id);
 };

 const handleDeletePhase = async (phaseId: number) => {
 if (!confirm("Delete this phase and all its sessions?")) return;
 await deletePhase(phaseId);
 setPhases((prev) => prev.filter((p) => p.id !== phaseId));
 setTemplates((prev) => prev.filter((t) => t.phaseId !== phaseId));
 if (activePhaseId === phaseId) {
 setActivePhaseId(phases[0]?.id ?? null);
 }
 };

 const handleUpdatePhase = async (
 phaseId: number,
 data: { name?: string; goal?: string; startWeek?: number; endWeek?: number }
 ) => {
 await updatePhase(phaseId, data);
 setPhases((prev) =>
 prev.map((p) => (p.id === phaseId ? { ...p, ...data } : p))
 );
 };

 const handleAddSession = async (
 phaseId: number,
 dayOfWeek: number,
 week: number
 ) => {
 const phaseTemplates = templates.filter((t) => t.phaseId === phaseId);
 const template = await createSessionTemplate({
 phaseId,
 dayOfWeek,
 week,
 label: DAY_NAMES[dayOfWeek - 1],
 sortOrder: phaseTemplates.length,
 });
 setTemplates((prev) => [...prev, template]);
 };

 const handleDeleteSession = async (templateId: number) => {
 if (!confirm("Delete this session?")) return;
 await deleteSessionTemplate(templateId);
 setTemplates((prev) => prev.filter((t) => t.id !== templateId));
 setBlocks((prev) =>
 prev.filter((b) => b.sessionTemplateId !== templateId)
 );
 };

 const handleAddBlock = async (
 sessionTemplateId: number,
 blockType: string
 ) => {
 const sessionBlocks = blocks.filter(
 (b) => b.sessionTemplateId === sessionTemplateId
 );
 const block = await createSessionBlock({
 sessionTemplateId,
 blockType,
 label: blockType.charAt(0).toUpperCase() + blockType.slice(1),
 sortOrder: sessionBlocks.length,
 });
 setBlocks((prev) => [...prev, block]);
 setAddingBlockTo(null);
 };

 const handleDeleteBlock = async (blockId: number) => {
 await deleteSessionBlock(blockId);
 setBlocks((prev) => prev.filter((b) => b.id !== blockId));
 setBlockExercises((prev) => prev.filter((be) => be.blockId !== blockId));
 };

 const handleAddExercise = async (exerciseId: number) => {
 if (!exercisePicker) return;
 const be = await addExerciseToBlock({
 blockId: exercisePicker.blockId,
 exerciseId,
 sets: 3,
 });
 const exercise = allExercises.find((e) => e.id === exerciseId);
 setBlockExercises((prev) => [
 ...prev,
 {
 ...be,
 exerciseName: exercise?.name ?? null,
 exerciseCategory: exercise?.category ?? null,
 exerciseTrackingType: exercise?.trackingType ?? null,
 },
 ]);
 setExercisePicker(null);
 setExerciseSearch("");
 };

 const handleRemoveExercise = async (blockExerciseId: number) => {
 await removeExerciseFromBlock(blockExerciseId);
 setBlockExercises((prev) => prev.filter((be) => be.id !== blockExerciseId));
 };

 const handleSaveExercise = async (
 id: number,
 data: {
 sets: number | null;
 reps: string | null;
 load: string | null;
 distance: number | null;
 time: number | null;
 restSeconds: number | null;
 rpeTarget: number | null;
 notes: string | null;
 }
 ) => {
 await updateBlockExercise(id, data);
 setBlockExercises((prev) =>
 prev.map((be) => (be.id === id ? { ...be, ...data } : be))
 );
 setEditingExerciseId(null);
 };

 const editingExercise =
 editingExerciseId !== null
 ? blockExercises.find((be) => be.id === editingExerciseId) ?? null
 : null;

 const activePhase = phases.find((p) => p.id === activePhaseId);
 const weekCount = activePhase
 ? activePhase.endWeek - activePhase.startWeek + 1
 : 0;
 // Default to "All weeks" (0) for newly visited phases.
 const activeWeek =
 activePhase && activeWeekByPhase[activePhase.id] !== undefined
 ? activeWeekByPhase[activePhase.id]
 : 0;
 const phaseTemplates = templates.filter(
 (t) => t.phaseId === activePhaseId
 );
 // "All weeks" (activeWeek=0): show everything in the phase.
 // Specific week N: show sessions for that week, plus week=0 sessions
 // (which repeat across every week of the phase).
 const visibleTemplates =
 activeWeek === 0
 ? phaseTemplates
 : phaseTemplates.filter((t) => t.week === activeWeek || t.week === 0);

 const filteredExercises = allExercises.filter(
 (e) =>
 !exerciseSearch ||
 e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
 );

 return (
 <div>
 <div className="flex items-start justify-between mb-8">
 <div className="flex-1">
 {editingProgram ? (
 <div className="space-y-3 max-w-xl">
 <input
 type="text"
 value={editProgramName}
 onChange={(e) => setEditProgramName(e.target.value)}
 className="w-full px-3 py-2 bg-surface border border-line text-ink text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-ink"
 />
 <textarea
 value={editProgramDesc}
 onChange={(e) => setEditProgramDesc(e.target.value)}
 rows={2}
 className="w-full px-3 py-2 bg-surface border border-line text-ink focus:outline-none focus:ring-2 focus:ring-ink resize-none"
 placeholder="Program description..."
 />
 <div className="flex gap-3">
 <select
 value={editProgramStatus}
 onChange={(e) => setEditProgramStatus(e.target.value)}
 className="px-3 py-2 bg-surface border border-line text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 >
 <option value="draft">Draft</option>
 <option value="published">Published</option>
 <option value="archived">Archived</option>
 </select>
 <Button onClick={handleSaveProgram}>
 <Save className="w-4 h-4 mr-2" />
 Save
 </Button>
 <Button variant="ghost" onClick={() => setEditingProgram(false)}>
 Cancel
 </Button>
 </div>
 </div>
 ) : (
 <div>
 <div className="flex items-center gap-3 mb-2">
 <h1 className="text-2xl font-bold">{program.name}</h1>
 <span
 className={`inline-block px-2.5 py-0.5 text-xs font-medium border capitalize ${
 program.status === "published"
 ? "bg-ink/20 text-ink border-line"
 : program.status === "draft"
 ? "bg-ink/20 text-ink border-line"
 : "bg-mute/20 text-mute border-mute/30"
 }`}
 >
 {program.status}
 </span>
 <button
 onClick={() => setEditingProgram(true)}
 className="p-1.5 hover:bg-hover text-mute hover:text-ink transition-colors"
 >
 <Pencil className="w-4 h-4" />
 </button>
 </div>
 <p className="text-mute">
 {program.description || "No description"}
 </p>
 </div>
 )}
 </div>
 <div className="flex gap-2">
 <Button
 variant="secondary"
 onClick={() => setAiOpen((v) => !v)}
 >
 <Sparkles className="w-4 h-4 mr-2" />
 Import with AI
 </Button>
 <Button onClick={handleAddPhase}>
 <Plus className="w-4 h-4 mr-2" />
 Add Phase
 </Button>
 </div>
 </div>

 {aiOpen && (
 <div className="mb-6 bg-surface border border-line p-5">
 <div className="flex items-center gap-2 mb-3">
 <Sparkles className="w-4 h-4 text-ink" />
 <h2 className="text-sm font-semibold text-ink">
 Import program with AI
 </h2>
 </div>
 <p className="text-xs text-mute mb-3">
 Upload a markdown file or paste an existing program below. The AI
 transcribes it into phases, sessions, and exercises — it will not
 invent content. Only exercises in your library are used. Up to 12
 weeks per import.
 </p>
 <div className="mb-3 flex items-center gap-2">
 <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-hover border border-line text-xs font-medium text-ink cursor-pointer transition-colors">
 <Upload className="w-3.5 h-3.5" />
 Upload markdown
 <input
 type="file"
 accept=".md,.markdown,.txt,text/markdown,text/plain"
 onChange={handleAiFileChange}
 disabled={aiLoading}
 className="hidden"
 />
 </label>
 {aiFileName && (
 <span className="text-xs text-mute">
 Loaded:{" "}
 <span className="text-ink">{aiFileName}</span>
 <button
 type="button"
 onClick={() => {
 setAiFileName(null);
 setAiPrompt("");
 }}
 className="ml-2 text-faint hover:text-red-400 transition-colors"
 disabled={aiLoading}
 >
 clear
 </button>
 </span>
 )}
 </div>
 <textarea
 value={aiPrompt}
 onChange={(e) => {
 setAiPrompt(e.target.value);
 if (aiFileName) setAiFileName(null);
 }}
 rows={aiFileName ? 8 : 4}
 placeholder={`Paste your program here, or use Upload above. Example:\n\n# Week 1 — Acceleration\n## Monday\n### Sprint\n- Block Starts (10m): 4x10m, full rest\n- 30m Sprint: 3x30m, 4 min rest\n### Strength\n- Back Squat: 4x5 @ 80%\n- ...`}
 disabled={aiLoading}
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink resize-y disabled:opacity-50 font-mono"
 />
 <div className="flex items-center justify-between mt-3">
 <div className="text-xs text-faint">
 {aiPrompt.length.toLocaleString()}/200,000
 </div>
 <div className="flex gap-2">
 <Button
 variant="ghost"
 onClick={() => {
 setAiOpen(false);
 setAiPrompt("");
 setAiFileName(null);
 setAiResult(null);
 }}
 disabled={aiLoading}
 >
 Cancel
 </Button>
 <Button
 onClick={handleAiGenerate}
 disabled={aiLoading || !aiPrompt.trim()}
 >
 <Sparkles className="w-4 h-4 mr-2" />
 {aiLoading ? "Generating..." : "Generate"}
 </Button>
 </div>
 </div>
 {aiResult && aiResult.kind === "ok" && (
 <div className="mt-3 p-3 bg-ink/10 border border-line text-sm text-ink">
 Added {aiResult.phasesAdded} phase
 {aiResult.phasesAdded !== 1 ? "s" : ""} and{" "}
 {aiResult.sessionsAdded} session
 {aiResult.sessionsAdded !== 1 ? "s" : ""}.
 {aiResult.unknownExercises.length > 0 && (
 <div className="mt-2 text-ink text-xs">
 Skipped unknown exercises:{" "}
 {aiResult.unknownExercises.join(", ")}
 </div>
 )}
 </div>
 )}
 {aiResult && aiResult.kind === "err" && (
 <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 text-sm text-red-400">
 {aiResult.message}
 </div>
 )}
 </div>
 )}

 {phases.length === 0 ? (
 <div className="text-center py-20 bg-surface border border-line ">
 <p className="text-mute mb-4">No phases yet</p>
 <Button onClick={handleAddPhase}>
 <Plus className="w-4 h-4 mr-2" />
 Add First Phase
 </Button>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="flex gap-2 overflow-x-auto pb-2">
 {phases.map((phase) => (
 <button
 key={phase.id}
 onClick={() => setActivePhaseId(phase.id)}
 className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
 activePhaseId === phase.id
 ? "bg-ink text-bg"
 : "bg-surface text-mute hover:text-ink hover:bg-hover"
 }`}
 >
 {phase.name}
 </button>
 ))}
 </div>

 {activePhase && (
 <PhaseView
 phase={activePhase}
 weekCount={weekCount}
 activeWeek={activeWeek}
 onSelectWeek={(w) =>
 setActiveWeekByPhase((prev) => ({
 ...prev,
 [activePhase.id]: w,
 }))
 }
 phaseTemplates={visibleTemplates}
 blocks={blocks}
 blockExercises={blockExercises}
 onAddSession={handleAddSession}
 onDeleteSession={handleDeleteSession}
 onAddBlock={(templateId: number) => setAddingBlockTo(templateId)}
 onDeleteBlock={handleDeleteBlock}
 onDeletePhase={handleDeletePhase}
 onUpdatePhase={handleUpdatePhase}
 onOpenExercisePicker={(blockId: number) =>
 setExercisePicker({ blockId })
 }
 onRemoveExercise={handleRemoveExercise}
 onEditExercise={(id: number) => setEditingExerciseId(id)}
 addingBlockTo={addingBlockTo}
 onAddBlockType={handleAddBlock}
 onCancelAddBlock={() => setAddingBlockTo(null)}
 />
 )}
 </div>
 )}

 {exercisePicker && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
 <div className="bg-surface border border-line w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
 <div className="flex items-center justify-between p-4 border-b border-line">
 <h2 className="text-lg font-semibold">Pick Exercise</h2>
 <button
 onClick={() => {
 setExercisePicker(null);
 setExerciseSearch("");
 }}
 className="p-1.5 hover:bg-hover text-mute hover:text-ink transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-4 border-b border-line">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
 <input
 type="text"
 value={exerciseSearch}
 onChange={(e) => setExerciseSearch(e.target.value)}
 placeholder="Search exercises..."
 className="w-full pl-10 pr-4 py-2 bg-bg border border-line text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 </div>
 <div className="overflow-y-auto flex-1 p-2">
 {filteredExercises.map((exercise) => {
 const thumb = getVideoThumbnail(exercise.videoUrl);
 return (
 <button
 key={exercise.id}
 onClick={() => handleAddExercise(exercise.id)}
 className="w-full text-left px-3 py-2.5 hover:bg-hover text-ink transition-colors cursor-pointer flex items-center gap-3"
 >
 <div className="w-14 h-10 shrink-0 bg-bg border border-line flex items-center justify-center overflow-hidden">
 {thumb ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={thumb}
 alt=""
 className="w-full h-full object-cover"
 />
 ) : exercise.videoUrl ? (
 <Play className="w-4 h-4 text-mute" />
 ) : (
 <Dumbbell className="w-4 h-4 text-faint" />
 )}
 </div>
 <div className="min-w-0 flex-1">
 <div className="font-medium text-sm truncate">{exercise.name}</div>
 <div className="text-xs text-mute capitalize">
 {exercise.category} · {exercise.trackingType}
 </div>
 </div>
 </button>
 );
 })}
 </div>
 </div>
 </div>
 )}

 {editingExercise && (
 <ExerciseEditModal
 key={editingExercise.id}
 blockExercise={editingExercise}
 onClose={() => setEditingExerciseId(null)}
 onSave={handleSaveExercise}
 />
 )}
 </div>
 );
}

function ExerciseEditModal({
 blockExercise,
 onClose,
 onSave,
}: {
 blockExercise: BlockExercise;
 onClose: () => void;
 onSave: (
 id: number,
 data: {
 sets: number | null;
 reps: string | null;
 load: string | null;
 distance: number | null;
 time: number | null;
 restSeconds: number | null;
 rpeTarget: number | null;
 notes: string | null;
 }
 ) => Promise<void>;
}) {
 const [sets, setSets] = useState<string>(
 blockExercise.sets?.toString() ?? ""
 );
 const [reps, setReps] = useState<string>(blockExercise.reps ?? "");
 const [load, setLoad] = useState<string>(blockExercise.load ?? "");
 const [distance, setDistance] = useState<string>(
 blockExercise.distance?.toString() ?? ""
 );
 const [time, setTime] = useState<string>(
 blockExercise.time?.toString() ?? ""
 );
 const [restSeconds, setRestSeconds] = useState<string>(
 blockExercise.restSeconds?.toString() ?? ""
 );
 const [rpeTarget, setRpeTarget] = useState<string>(
 blockExercise.rpeTarget?.toString() ?? ""
 );
 const [notes, setNotes] = useState<string>(blockExercise.notes ?? "");
 const [saving, setSaving] = useState(false);

 const parseNum = (s: string): number | null => {
 const t = s.trim();
 if (!t) return null;
 const n = Number(t);
 return Number.isFinite(n) ? n : null;
 };

 const handleSave = async () => {
 setSaving(true);
 try {
 await onSave(blockExercise.id, {
 sets: parseNum(sets),
 reps: reps.trim() || null,
 load: load.trim() || null,
 distance: parseNum(distance),
 time: parseNum(time),
 restSeconds: parseNum(restSeconds),
 rpeTarget: parseNum(rpeTarget),
 notes: notes.trim() || null,
 });
 } finally {
 setSaving(false);
 }
 };

 return (
 <Modal
 open={true}
 onClose={onClose}
 title={blockExercise.exerciseName ?? "Edit Exercise"}
 >
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium text-mute mb-1">
 Sets
 </label>
 <input
 type="number"
 min={0}
 value={sets}
 onChange={(e) => setSets(e.target.value)}
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-mute mb-1">
 Reps
 </label>
 <input
 type="text"
 value={reps}
 onChange={(e) => setReps(e.target.value)}
 placeholder="5 or 3-5"
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-mute mb-1">
 Load
 </label>
 <input
 type="text"
 value={load}
 onChange={(e) => setLoad(e.target.value)}
 placeholder="80kg, BW, RPE 8"
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-mute mb-1">
 Rest (sec)
 </label>
 <input
 type="number"
 min={0}
 value={restSeconds}
 onChange={(e) => setRestSeconds(e.target.value)}
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-mute mb-1">
 Distance (m)
 </label>
 <input
 type="number"
 min={0}
 step="0.01"
 value={distance}
 onChange={(e) => setDistance(e.target.value)}
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-mute mb-1">
 Time (sec)
 </label>
 <input
 type="number"
 min={0}
 step="0.01"
 value={time}
 onChange={(e) => setTime(e.target.value)}
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-mute mb-1">
 RPE Target (1–10)
 </label>
 <input
 type="number"
 min={1}
 max={10}
 step="0.5"
 value={rpeTarget}
 onChange={(e) => setRpeTarget(e.target.value)}
 placeholder="e.g. 8 for hard but 2 reps in reserve"
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium text-mute mb-1 flex items-center gap-1.5">
 <StickyNote className="w-3.5 h-3.5" />
 Notes
 </label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={4}
 placeholder="Coaching cues, intent, regressions..."
 className="w-full px-3 py-2 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink resize-y"
 />
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <Button variant="ghost" onClick={onClose} disabled={saving}>
 Cancel
 </Button>
 <Button onClick={handleSave} disabled={saving}>
 <Save className="w-4 h-4 mr-2" />
 {saving ? "Saving..." : "Save"}
 </Button>
 </div>
 </div>
 </Modal>
 );
}

function PhaseView({
 phase,
 weekCount,
 activeWeek,
 onSelectWeek,
 phaseTemplates,
 blocks,
 blockExercises,
 onAddSession,
 onDeleteSession,
 onAddBlock,
 onDeleteBlock,
 onDeletePhase,
 onUpdatePhase,
 onOpenExercisePicker,
 onRemoveExercise,
 onEditExercise,
 addingBlockTo,
 onAddBlockType,
 onCancelAddBlock,
}: {
 phase: Phase;
 weekCount: number;
 activeWeek: number;
 onSelectWeek: (week: number) => void;
 phaseTemplates: SessionTemplate[];
 blocks: SessionBlock[];
 blockExercises: BlockExercise[];
 onAddSession: (phaseId: number, day: number, week: number) => void;
 onDeleteSession: (templateId: number) => void;
 onAddBlock: (templateId: number) => void;
 onDeleteBlock: (blockId: number) => void;
 onDeletePhase: (phaseId: number) => void;
 onUpdatePhase: (
 phaseId: number,
 data: { name?: string; goal?: string; startWeek?: number; endWeek?: number }
 ) => void;
 onOpenExercisePicker: (blockId: number) => void;
 onRemoveExercise: (blockExerciseId: number) => void;
 onEditExercise: (blockExerciseId: number) => void;
 addingBlockTo: number | null;
 onAddBlockType: (templateId: number, blockType: string) => void;
 onCancelAddBlock: () => void;
}) {
 const [editingPhase, setEditingPhase] = useState(false);
 const [phaseName, setPhaseName] = useState(phase.name);
 const [phaseGoal, setPhaseGoal] = useState(phase.goal ?? "");
 const [phaseStart, setPhaseStart] = useState(phase.startWeek);
 const [phaseEnd, setPhaseEnd] = useState(phase.endWeek);

 const handleSavePhase = async () => {
 await onUpdatePhase(phase.id, {
 name: phaseName,
 goal: phaseGoal,
 startWeek: phaseStart,
 endWeek: phaseEnd,
 });
 setEditingPhase(false);
 };

 return (
 <div className="bg-surface border border-line ">
 <div className="p-4 border-b border-line flex items-center justify-between">
 {editingPhase ? (
 <div className="flex-1 flex flex-wrap items-center gap-3">
 <input
 type="text"
 value={phaseName}
 onChange={(e) => setPhaseName(e.target.value)}
 className="px-3 py-1.5 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 <input
 type="text"
 value={phaseGoal}
 onChange={(e) => setPhaseGoal(e.target.value)}
 placeholder="Goal..."
 className="px-3 py-1.5 bg-bg border border-line text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 <div className="flex items-center gap-1 text-sm text-mute">
 <input
 type="number"
 value={phaseStart}
 onChange={(e) => setPhaseStart(parseInt(e.target.value))}
 className="w-14 px-2 py-1.5 bg-bg border border-line text-ink text-sm text-center focus:outline-none focus:ring-2 focus:ring-ink"
 />
 <span>-</span>
 <input
 type="number"
 value={phaseEnd}
 onChange={(e) => setPhaseEnd(parseInt(e.target.value))}
 className="w-14 px-2 py-1.5 bg-bg border border-line text-ink text-sm text-center focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <Button size="sm" onClick={handleSavePhase}>
 Save
 </Button>
 <Button size="sm" variant="ghost" onClick={() => setEditingPhase(false)}>
 Cancel
 </Button>
 </div>
 ) : (
 <>
 <div>
 <h2 className="text-lg font-semibold flex items-center gap-2">
 {phase.name}
 <button
 onClick={() => setEditingPhase(true)}
 className="p-1 hover:bg-hover text-mute hover:text-ink transition-colors"
 >
 <Pencil className="w-3.5 h-3.5" />
 </button>
 </h2>
 <p className="text-sm text-mute">
 {phase.goal || "No goal set"} · Weeks {phase.startWeek}–
 {phase.endWeek} ({weekCount} weeks)
 </p>
 </div>
 <Button
 variant="danger"
 size="sm"
 onClick={() => onDeletePhase(phase.id)}
 >
 <Trash2 className="w-3.5 h-3.5 mr-1" />
 Delete
 </Button>
 </>
 )}
 </div>

 <div className="px-4 py-3 border-b border-line flex items-center gap-2 overflow-x-auto">
 <span className="text-xs text-faint mr-1">View:</span>
 <button
 onClick={() => onSelectWeek(0)}
 className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
 activeWeek === 0
 ? "bg-ink text-bg"
 : "bg-surface text-ink hover:text-ink hover:bg-hover"
 }`}
 title="Sessions that repeat across every week of this phase"
 >
 All weeks
 </button>
 {Array.from({ length: weekCount }, (_, i) => i + 1).map((w) => (
 <button
 key={w}
 onClick={() => onSelectWeek(w)}
 className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
 activeWeek === w
 ? "bg-ink text-bg"
 : "bg-surface text-ink hover:text-ink hover:bg-hover"
 }`}
 >
 Week {w}
 </button>
 ))}
 </div>

 <div className="overflow-x-auto">
 <div className="grid grid-cols-7 gap-px bg-surface/50 min-w-[900px]">
 {DAY_NAMES.map((day, i) => {
 const dayNum = i + 1;
 const dayTemplates = phaseTemplates.filter(
 (t) => t.dayOfWeek === dayNum
 );

 return (
 <div key={dayNum} className="bg-surface min-h-[200px]">
 <div className="px-3 py-2 border-b border-line flex items-center justify-between">
 <span className="text-sm font-medium text-ink">
 {day}
 </span>
 <button
 onClick={() => onAddSession(phase.id, dayNum, activeWeek)}
 className="p-1 hover:bg-hover text-faint hover:text-ink transition-colors"
 >
 <Plus className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="p-2 space-y-2">
 {dayTemplates.map((template) => {
 const templateBlocks = blocks.filter(
 (b) => b.sessionTemplateId === template.id
 );
 return (
 <div
 key={template.id}
 className="bg-bg border border-line p-2"
 >
 <div className="flex items-center justify-between mb-2 gap-1">
 <span className="text-xs font-medium text-ink truncate flex items-center gap-1.5">
 {template.label}
 <span
 className={`text-[10px] px-1.5 py-0.5 font-medium ${
 template.week === 0
 ? "bg-surface text-ink"
 : "bg-ink/20 text-ink"
 }`}
 title={
 template.week === 0
 ? "Repeats every week of this phase"
 : `Only on week ${template.week}`
 }
 >
 {template.week === 0 ? "every wk" : `wk ${template.week}`}
 </span>
 </span>
 <button
 onClick={() => onDeleteSession(template.id)}
 className="p-0.5 hover:bg-hover text-faint hover:text-red-400 transition-colors"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </div>

 <div className="space-y-1.5">
 {templateBlocks.map((block) => {
 const bExercises = blockExercises.filter(
 (be) => be.blockId === block.id
 );
 return (
 <div
 key={block.id}
 className={`border p-2 ${blockTypeColors[block.blockType] ?? "bg-surface/30 border-line"}`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs font-medium text-ink capitalize">
 {block.label ?? block.blockType}
 </span>
 <div className="flex items-center gap-0.5">
 <button
 onClick={() =>
 onOpenExercisePicker(block.id)
 }
 className="p-0.5 hover:bg-hover text-faint hover:text-ink transition-colors"
 >
 <Plus className="w-3 h-3" />
 </button>
 <button
 onClick={() => onDeleteBlock(block.id)}
 className="p-0.5 hover:bg-hover text-faint hover:text-red-400 transition-colors"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </div>
 </div>

 {bExercises.map((be) => (
 <div
 key={be.id}
 className="flex items-center justify-between py-1 group gap-1"
 >
 <button
 onClick={() => onEditExercise(be.id)}
 className="flex-1 min-w-0 text-left text-xs text-ink truncate hover:text-ink transition-colors cursor-pointer"
 title="Edit sets, reps, rest, notes"
 >
 <span className="truncate">
 {be.exerciseName ?? "Unknown"}
 </span>
 {(be.sets || be.reps) && (
 <span className="text-faint ml-1">
 {be.sets ?? "?"}×{be.reps ?? "?"}
 </span>
 )}
 </button>
 {be.notes && (
 <button
 onClick={() => onEditExercise(be.id)}
 className="p-0.5 text-ink hover:bg-hover transition-colors"
 title={be.notes}
 >
 <StickyNote className="w-3 h-3" />
 </button>
 )}
 <button
 onClick={() =>
 onRemoveExercise(be.id)
 }
 className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-hover text-faint hover:text-red-400 transition-all"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ))}

 {bExercises.length === 0 &&
 block.blockType !== "notes" && (
 <button
 onClick={() =>
 onOpenExercisePicker(block.id)
 }
 className="w-full text-center py-1 text-xs text-faint hover:text-ink transition-colors cursor-pointer"
 >
 + Add exercise
 </button>
 )}
 </div>
 );
 })}

 {addingBlockTo === template.id ? (
 <div className="flex flex-wrap gap-1 p-1 bg-surface ">
 {BLOCK_TYPES.map((bt) => (
 <button
 key={bt}
 onClick={() => onAddBlockType(template.id, bt)}
 className="px-2 py-1 text-xs bg-surface text-ink hover:text-ink hover:bg-hover transition-colors cursor-pointer capitalize"
 >
 {bt}
 </button>
 ))}
 <button
 onClick={onCancelAddBlock}
 className="px-2 py-1 text-xs text-faint hover:text-ink transition-colors cursor-pointer"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ) : (
 <button
 onClick={() => onAddBlock(template.id)}
 className="w-full text-center py-1.5 text-xs text-faint hover:text-ink border border-dashed border-line hover:border-rule transition-colors cursor-pointer"
 >
 + Add block
 </button>
 )}
 </div>
 </div>
 );
 })}

 {dayTemplates.length === 0 && (
 <button
 onClick={() => onAddSession(phase.id, dayNum, activeWeek)}
 className="w-full text-center py-3 text-xs text-faint hover:text-mute border border-dashed border-line/50 hover:border-line transition-colors cursor-pointer"
 >
 + Session
 </button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
}
