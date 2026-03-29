import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { or, eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Dumbbell } from "lucide-react";
import ExerciseLibraryClient from "./ExerciseLibraryClient";

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const coachId = parseInt((session.user as { id: string }).id);
  const allExercises = await db
    .select()
    .from(exercises)
    .where(or(eq(exercises.coachId, coachId), eq(exercises.isDefault, true)))
    .all();

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Exercise Library</h1>
            <p className="text-neutral-400 mt-1">
              {allExercises.length} exercises available
            </p>
          </div>
          <Link href="/coach/exercises/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </Link>
        </div>

        <ExerciseLibraryClient exercises={allExercises} coachId={coachId} />
      </div>
    </div>
  );
}
