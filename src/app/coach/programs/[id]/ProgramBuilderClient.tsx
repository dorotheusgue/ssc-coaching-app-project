"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  X,
  Search,
  Dumbbell,
  Timer,
  Ruler,
  Repeat,
  GripVertical,
  Save,
} from "lucide-react";
import {
  createPhase,
  updatePhase,
  deletePhase,
  createSessionTemplate,
  updateSessionTemplate,
  deleteSessionTemplate,
  createSessionBlock,
  deleteSessionBlock,
  addExerciseToBlock,
  removeExerciseFromBlock,
  updateProgram,
} from "../actions";

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
  warmup: "bg-cyan-500/10 border-cyan-500/30",
  sprint: "bg-blue-500/10 border-blue-500/30",
  strength: "bg-emerald-500/10 border-emerald-500/30",
  accessory: "bg-amber-500/10 border-amber-500/30",
  notes: "bg-neutral-700/50 border-neutral-600",
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
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    new Set(initialPhases.map((p) => p.id))
  );
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
  const [addingBlockTo, setAddingBlockTo] = useState<number | null>(null);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
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
    setExpandedPhases((prev) => new Set(prev).add(phase.id));
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

  const handleAddSession = async (phaseId: number, dayOfWeek: number) => {
    const phaseTemplates = templates.filter((t) => t.phaseId === phaseId);
    const template = await createSessionTemplate({
      phaseId,
      dayOfWeek,
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

  const activePhase = phases.find((p) => p.id === activePhaseId);
  const weekCount = activePhase
    ? activePhase.endWeek - activePhase.startWeek + 1
    : 0;
  const phaseTemplates = templates.filter(
    (t) => t.phaseId === activePhaseId
  );

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
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <textarea
                value={editProgramDesc}
                onChange={(e) => setEditProgramDesc(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Program description..."
              />
              <div className="flex gap-3">
                <select
                  value={editProgramStatus}
                  onChange={(e) => setEditProgramStatus(e.target.value)}
                  className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                    program.status === "published"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : program.status === "draft"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
                  }`}
                >
                  {program.status}
                </span>
                <button
                  onClick={() => setEditingProgram(true)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-neutral-400">
                {program.description || "No description"}
              </p>
            </div>
          )}
        </div>
        <Button onClick={handleAddPhase}>
          <Plus className="w-4 h-4 mr-2" />
          Add Phase
        </Button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-20 bg-neutral-800 border border-neutral-700 rounded-xl">
          <p className="text-neutral-400 mb-4">No phases yet</p>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activePhaseId === phase.id
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
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
              phaseTemplates={phaseTemplates}
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
              addingBlockTo={addingBlockTo}
              onAddBlockType={handleAddBlock}
              onCancelAddBlock={() => setAddingBlockTo(null)}
            />
          )}
        </div>
      )}

      {exercisePicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <h2 className="text-lg font-semibold">Pick Exercise</h2>
              <button
                onClick={() => {
                  setExercisePicker(null);
                  setExerciseSearch("");
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-neutral-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleAddExercise(exercise.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                >
                  <div className="font-medium text-sm">{exercise.name}</div>
                  <div className="text-xs text-neutral-400 capitalize">
                    {exercise.category} · {exercise.trackingType}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseView({
  phase,
  weekCount,
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
  addingBlockTo,
  onAddBlockType,
  onCancelAddBlock,
}: {
  phase: Phase;
  weekCount: number;
  phaseTemplates: SessionTemplate[];
  blocks: SessionBlock[];
  blockExercises: BlockExercise[];
  onAddSession: (phaseId: number, day: number) => void;
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
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl">
      <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
        {editingPhase ? (
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={phaseGoal}
              onChange={(e) => setPhaseGoal(e.target.value)}
              placeholder="Goal..."
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <input
                type="number"
                value={phaseStart}
                onChange={(e) => setPhaseStart(parseInt(e.target.value))}
                className="w-14 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span>-</span>
              <input
                type="number"
                value={phaseEnd}
                onChange={(e) => setPhaseEnd(parseInt(e.target.value))}
                className="w-14 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </h2>
              <p className="text-sm text-neutral-400">
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

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-px bg-neutral-700/50 min-w-[900px]">
          {DAY_NAMES.map((day, i) => {
            const dayNum = i + 1;
            const dayTemplates = phaseTemplates.filter(
              (t) => t.dayOfWeek === dayNum
            );

            return (
              <div key={dayNum} className="bg-neutral-800 min-h-[200px]">
                <div className="px-3 py-2 border-b border-neutral-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">
                    {day}
                  </span>
                  <button
                    onClick={() => onAddSession(phase.id, dayNum)}
                    className="p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-white transition-colors"
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
                        className="bg-neutral-900 border border-neutral-700 rounded-lg p-2"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-white">
                            {template.label}
                          </span>
                          <button
                            onClick={() => onDeleteSession(template.id)}
                            className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-colors"
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
                                className={`border rounded-lg p-2 ${blockTypeColors[block.blockType] ?? "bg-neutral-700/30 border-neutral-600"}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-neutral-300 capitalize">
                                    {block.label ?? block.blockType}
                                  </span>
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() =>
                                        onOpenExercisePicker(block.id)
                                      }
                                      className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-white transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteBlock(block.id)}
                                      className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {bExercises.map((be) => (
                                  <div
                                    key={be.id}
                                    className="flex items-center justify-between py-1 group"
                                  >
                                    <span className="text-xs text-neutral-200 truncate">
                                      {be.exerciseName ?? "Unknown"}
                                      {be.sets && (
                                        <span className="text-neutral-500 ml-1">
                                          {be.sets}×
                                          {be.reps ?? "?"}
                                        </span>
                                      )}
                                    </span>
                                    <button
                                      onClick={() =>
                                        onRemoveExercise(be.id)
                                      }
                                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-all"
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
                                      className="w-full text-center py-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                                    >
                                      + Add exercise
                                    </button>
                                  )}
                              </div>
                            );
                          })}

                          {addingBlockTo === template.id ? (
                            <div className="flex flex-wrap gap-1 p-1 bg-neutral-800 rounded-lg">
                              {BLOCK_TYPES.map((bt) => (
                                <button
                                  key={bt}
                                  onClick={() => onAddBlockType(template.id, bt)}
                                  className="px-2 py-1 text-xs rounded bg-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-600 transition-colors cursor-pointer capitalize"
                                >
                                  {bt}
                                </button>
                              ))}
                              <button
                                onClick={onCancelAddBlock}
                                className="px-2 py-1 text-xs rounded text-neutral-500 hover:text-white transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onAddBlock(template.id)}
                              className="w-full text-center py-1.5 text-xs text-neutral-500 hover:text-neutral-300 rounded-lg border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer"
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
                      onClick={() => onAddSession(phase.id, dayNum)}
                      className="w-full text-center py-3 text-xs text-neutral-600 hover:text-neutral-400 rounded-lg border border-dashed border-neutral-700/50 hover:border-neutral-600 transition-colors cursor-pointer"
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
