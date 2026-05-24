"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Search,
  X,
  Plus,
  Pencil,
  Trash2,
  Dumbbell,
  Timer,
  Ruler,
  Repeat,
  Footprints,
} from "lucide-react";

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

const CATEGORIES = [
  "sprint",
  "plyometric",
  "strength",
  "accessory",
  "mobility",
  "warmup",
] as const;

const TRACKING_TYPES = ["reps", "load", "distance", "time", "none"] as const;

const categoryColors: Record<string, string> = {
  sprint: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  plyometric: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  strength: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  accessory: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  mobility: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  warmup: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const trackingIcons: Record<string, React.ReactNode> = {
  reps: <Repeat className="w-3.5 h-3.5" />,
  load: <Dumbbell className="w-3.5 h-3.5" />,
  distance: <Ruler className="w-3.5 h-3.5" />,
  time: <Timer className="w-3.5 h-3.5" />,
  none: null,
};

export default function ExerciseLibraryClient({
  exercises,
  coachId,
  count,
}: {
  exercises: Exercise[];
  coachId: number;
  count: number;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exerciseList, setExerciseList] = useState<Exercise[]>(exercises);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const filtered = exerciseList.filter((ex) => {
    const matchesSearch =
      !search ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      (ex.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exercise?")) return;
    const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    if (res.ok) {
      setExerciseList((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const openCreate = () => {
    setEditingExercise(null);
    setModalOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setModalOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    category: string;
    tags: string[];
    description: string;
    trackingType: string;
    videoUrl: string;
  }) => {
    if (editingExercise) {
      const res = await fetch(`/api/exercises/${editingExercise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setExerciseList((prev) =>
          prev.map((e) => (e.id === editingExercise.id ? { ...e, ...updated } : e))
        );
      }
    } else {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, coachId }),
      });
      if (res.ok) {
        const created = await res.json();
        setExerciseList((prev) => [...prev, created]);
      }
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-neutral-400 mt-1">
            {count} exercises available
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            !selectedCategory
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(cat === selectedCategory ? null : cat)
            }
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize cursor-pointer ${
              cat === selectedCategory
                ? categoryColors[cat]
                : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((exercise) => {
          const tags = Array.isArray(exercise.tags) ? (exercise.tags as string[]) : [];
          return (
            <div
              key={exercise.id}
              className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 hover:border-neutral-600 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                    categoryColors[exercise.category] ?? "bg-neutral-700 text-neutral-300 border-neutral-600"
                  }`}
                >
                  {exercise.category}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {exercise.coachId === coachId && (
                    <>
                      <button
                        onClick={() => openEdit(exercise)}
                        className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-white font-semibold mb-1.5">{exercise.name}</h3>
              <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                {exercise.description || "No description"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-neutral-700 text-neutral-300 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-neutral-700 text-neutral-400 text-xs rounded-md">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-neutral-500">
                  {trackingIcons[exercise.trackingType]}
                  <span className="text-xs capitalize">{exercise.trackingType}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 text-lg">No exercises found</p>
          <p className="text-neutral-500 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {modalOpen && (
        <ExerciseModal
          exercise={editingExercise}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function ExerciseModal({
  exercise,
  onClose,
  onSave,
}: {
  exercise: Exercise | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: string;
    tags: string[];
    description: string;
    trackingType: string;
    videoUrl: string;
  }) => void;
}) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [category, setCategory] = useState(exercise?.category ?? "sprint");
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(exercise?.tags) ? (exercise.tags as string[]).join(", ") : ""
  );
  const [description, setDescription] = useState(exercise?.description ?? "");
  const [trackingType, setTrackingType] = useState(exercise?.trackingType ?? "reps");
  const [videoUrl, setVideoUrl] = useState(exercise?.videoUrl ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ name, category, tags, description, trackingType, videoUrl });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-700">
          <h2 className="text-lg font-semibold">
            {exercise ? "Edit Exercise" : "Create Exercise"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. power, lower, compound"
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Tracking Type
            </label>
            <select
              value={trackingType}
              onChange={(e) => setTrackingType(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {TRACKING_TYPES.map((tt) => (
                <option key={tt} value={tt}>
                  {tt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {exercise ? "Save Changes" : "Create Exercise"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
