import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { or, eq } from "drizzle-orm";
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
 <div className="min-h-screen bg-bg text-ink">
 <div className="max-w-7xl mx-auto px-6 py-8">
 <ExerciseLibraryClient
 exercises={allExercises}
 coachId={coachId}
 count={allExercises.length}
 />
 </div>
 </div>
 );
}
