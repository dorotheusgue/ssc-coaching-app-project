import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  programs,
  phases,
  sessionTemplates,
  sessionBlocks,
  blockExercises,
  exercises,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import ProgramBuilderClient from "./ProgramBuilderClient";

export default async function ProgramBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const coachId = parseInt((session.user as { id: string }).id);
  const programId = parseInt(id);

  const program = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId))
    .get();

  if (!program) redirect("/coach/programs");

  const phasesData = await db
    .select()
    .from(phases)
    .where(eq(phases.programId, programId))
    .orderBy(asc(phases.sortOrder))
    .all();

  const phaseIds = phasesData.map((p) => p.id);

  const templatesData = phaseIds.length
    ? await db
        .select()
        .from(sessionTemplates)
        .orderBy(asc(sessionTemplates.sortOrder))
        .all()
    : [];

  const templateIds = templatesData
    .filter((t) => phaseIds.includes(t.phaseId))
    .map((t) => t.id);

  const blocksData = templateIds.length
    ? await db
        .select()
        .from(sessionBlocks)
        .orderBy(asc(sessionBlocks.sortOrder))
        .all()
    : [];

  const blockIds = blocksData
    .filter((b) => templateIds.includes(b.sessionTemplateId))
    .map((b) => b.id);

  const blockExercisesData = blockIds.length
    ? await db
        .select({
          id: blockExercises.id,
          blockId: blockExercises.blockId,
          exerciseId: blockExercises.exerciseId,
          sets: blockExercises.sets,
          reps: blockExercises.reps,
          load: blockExercises.load,
          percent1RM: blockExercises.percent1RM,
          distance: blockExercises.distance,
          time: blockExercises.time,
          restSeconds: blockExercises.restSeconds,
          rpeTarget: blockExercises.rpeTarget,
          notes: blockExercises.notes,
          sortOrder: blockExercises.sortOrder,
          exerciseName: exercises.name,
          exerciseCategory: exercises.category,
          exerciseTrackingType: exercises.trackingType,
        })
        .from(blockExercises)
        .leftJoin(exercises, eq(blockExercises.exerciseId, exercises.id))
        .orderBy(asc(blockExercises.sortOrder))
        .all()
    : [];

  const allExercises = await db
    .select()
    .from(exercises)
    .all();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgramBuilderClient
          program={program}
          phases={phasesData}
          templates={templatesData}
          blocks={blocksData}
          blockExercises={blockExercisesData}
          allExercises={allExercises}
          coachId={coachId}
        />
      </div>
    </div>
  );
}
