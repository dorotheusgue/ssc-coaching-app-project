"use server";

import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  programs,
  phases,
  sessionTemplates,
  sessionBlocks,
  blockExercises,
  exercises as exercisesTable,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const BLOCK_TYPES = [
  "warmup",
  "sprint",
  "strength",
  "accessory",
  "notes",
] as const;
type BlockType = (typeof BLOCK_TYPES)[number];

type GeneratedPlan = {
  phases: Array<{
    name: string;
    goal?: string;
    startWeek: number;
    endWeek: number;
    sessions: Array<{
      dayOfWeek: number;
      label: string;
      notes?: string;
      blocks: Array<{
        blockType: string;
        label?: string;
        restSeconds?: number;
        exercises: Array<{
          exerciseName: string;
          sets?: number;
          reps?: string;
          load?: string;
          percent1RM?: number;
          distance?: number;
          time?: number;
          restSeconds?: number;
          notes?: string;
        }>;
      }>;
    }>;
  }>;
};

const planSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    phases: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          goal: { type: SchemaType.STRING },
          startWeek: { type: SchemaType.INTEGER },
          endWeek: { type: SchemaType.INTEGER },
          sessions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                dayOfWeek: { type: SchemaType.INTEGER },
                label: { type: SchemaType.STRING },
                notes: { type: SchemaType.STRING },
                blocks: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      blockType: {
                        type: SchemaType.STRING,
                        format: "enum",
                        enum: [...BLOCK_TYPES],
                      },
                      label: { type: SchemaType.STRING },
                      restSeconds: { type: SchemaType.INTEGER },
                      exercises: {
                        type: SchemaType.ARRAY,
                        items: {
                          type: SchemaType.OBJECT,
                          properties: {
                            exerciseName: { type: SchemaType.STRING },
                            sets: { type: SchemaType.INTEGER },
                            reps: { type: SchemaType.STRING },
                            load: { type: SchemaType.STRING },
                            percent1RM: { type: SchemaType.NUMBER },
                            distance: { type: SchemaType.NUMBER },
                            time: { type: SchemaType.NUMBER },
                            restSeconds: { type: SchemaType.INTEGER },
                            notes: { type: SchemaType.STRING },
                          },
                          required: ["exerciseName"],
                        },
                      },
                    },
                    required: ["blockType", "exercises"],
                  },
                },
              },
              required: ["dayOfWeek", "label", "blocks"],
            },
          },
        },
        required: ["name", "startWeek", "endWeek", "sessions"],
      },
    },
  },
  required: ["phases"],
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function generateProgramFromPromptAction(
  programId: number,
  userPrompt: string
): Promise<
  | { success: true; phasesAdded: number; sessionsAdded: number; unknownExercises: string[] }
  | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const coachId = parseInt((session.user as { id: string }).id);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured on the server.",
    };
  }

  const program = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId))
    .get();
  if (!program) return { success: false, error: "Program not found" };
  if (program.coachId !== coachId)
    return { success: false, error: "Forbidden" };

  const trimmedPrompt = userPrompt.trim();
  if (trimmedPrompt.length < 10) {
    return { success: false, error: "Prompt is too short. Describe what you want." };
  }
  if (trimmedPrompt.length > 4000) {
    return { success: false, error: "Prompt is too long (max 4000 chars)." };
  }

  const availableExercises = await db
    .select({
      id: exercisesTable.id,
      name: exercisesTable.name,
      category: exercisesTable.category,
      trackingType: exercisesTable.trackingType,
    })
    .from(exercisesTable)
    .where(
      or(eq(exercisesTable.coachId, coachId), eq(exercisesTable.isDefault, true))
    )
    .all();

  if (availableExercises.length === 0) {
    return {
      success: false,
      error: "No exercises in your library yet. Add some first.",
    };
  }

  const existingPhases = await db
    .select({ sortOrder: phases.sortOrder, endWeek: phases.endWeek })
    .from(phases)
    .where(eq(phases.programId, programId))
    .all();
  const baseSortOrder = existingPhases.length;
  const baseWeekOffset = existingPhases.reduce(
    (max, p) => Math.max(max, p.endWeek),
    0
  );

  const exerciseLines = availableExercises
    .map(
      (e) =>
        `- ${e.name} [category: ${e.category}, tracks: ${e.trackingType}]`
    )
    .join("\n");

  const systemInstruction = `You are an expert sprint and S&C coach designing a periodized training program. You output structured plans that fit a specific data model.

CONSTRAINTS — these are hard rules, violating any of them means the plan is invalid:
1. Use ONLY exercises from the EXERCISE LIBRARY below. Match names EXACTLY as written.
2. Generate AT MOST 12 weeks total across all phases in one call.
3. dayOfWeek is 1-7 where 1=Monday, 7=Sunday. Each session occupies one day per week of its phase.
4. blockType must be one of: warmup, sprint, strength, accessory, notes.
5. Each block contains exercises that fit its blockType (warmups in warmup blocks, lifts in strength blocks, etc.).
6. For sprint/distance exercises, use "distance" (meters) and "time" (seconds) fields when relevant.
7. For strength exercises, use "sets", "reps" (as string like "5" or "3-5"), and "load" (as string like "80kg" or "BW") or "percent1RM".
8. Always include a warmup block as the first block of each session.
9. Use realistic, periodized loading. Vary intensity across the week.
10. Existing program already has ${existingPhases.length} phase(s); your phases must start at week ${baseWeekOffset + 1} or later.

EXERCISE LIBRARY (use these names verbatim):
${exerciseLines}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
      temperature: 0.7,
    },
  });

  let raw: string;
  try {
    const result = await model.generateContent(trimmedPrompt);
    raw = result.response.text();
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      success: false,
      error: "AI request failed. Try again or rephrase your prompt.",
    };
  }

  let plan: GeneratedPlan;
  try {
    plan = JSON.parse(raw) as GeneratedPlan;
  } catch {
    return {
      success: false,
      error: "AI returned malformed output. Try again.",
    };
  }

  if (!Array.isArray(plan.phases) || plan.phases.length === 0) {
    return { success: false, error: "AI returned no phases." };
  }

  const exerciseByName = new Map<string, { id: number }>();
  for (const ex of availableExercises) {
    exerciseByName.set(normalize(ex.name), { id: ex.id });
  }

  const unknownExercises = new Set<string>();
  let sessionsAdded = 0;

  for (let pi = 0; pi < plan.phases.length; pi++) {
    const ph = plan.phases[pi];
    const [insertedPhase] = await db
      .insert(phases)
      .values({
        programId,
        name: ph.name,
        goal: ph.goal ?? null,
        sortOrder: baseSortOrder + pi,
        startWeek: Math.max(1, ph.startWeek ?? baseWeekOffset + 1),
        endWeek: Math.max(
          ph.startWeek ?? baseWeekOffset + 1,
          ph.endWeek ?? baseWeekOffset + 4
        ),
      })
      .returning();

    for (let si = 0; si < ph.sessions.length; si++) {
      const sess = ph.sessions[si];
      const [insertedTemplate] = await db
        .insert(sessionTemplates)
        .values({
          phaseId: insertedPhase.id,
          dayOfWeek: Math.min(7, Math.max(1, sess.dayOfWeek)),
          label: sess.label,
          sortOrder: si,
          notes: sess.notes ?? null,
        })
        .returning();
      sessionsAdded++;

      for (let bi = 0; bi < sess.blocks.length; bi++) {
        const block = sess.blocks[bi];
        const blockType = (BLOCK_TYPES as readonly string[]).includes(
          block.blockType
        )
          ? (block.blockType as BlockType)
          : "strength";

        const [insertedBlock] = await db
          .insert(sessionBlocks)
          .values({
            sessionTemplateId: insertedTemplate.id,
            blockType,
            label: block.label ?? null,
            sortOrder: bi,
            restSeconds: block.restSeconds ?? null,
          })
          .returning();

        for (let ei = 0; ei < block.exercises.length; ei++) {
          const ex = block.exercises[ei];
          const match = exerciseByName.get(normalize(ex.exerciseName));
          if (!match) {
            unknownExercises.add(ex.exerciseName);
            continue;
          }
          await db.insert(blockExercises).values({
            blockId: insertedBlock.id,
            exerciseId: match.id,
            sets: ex.sets ?? null,
            reps: ex.reps ?? null,
            load: ex.load ?? null,
            percent1RM: ex.percent1RM ?? null,
            distance: ex.distance ?? null,
            time: ex.time ?? null,
            restSeconds: ex.restSeconds ?? null,
            notes: ex.notes ?? null,
            sortOrder: ei,
          });
        }
      }
    }
  }

  revalidatePath(`/coach/programs/${programId}`);

  return {
    success: true,
    phasesAdded: plan.phases.length,
    sessionsAdded,
    unknownExercises: Array.from(unknownExercises),
  };
}
