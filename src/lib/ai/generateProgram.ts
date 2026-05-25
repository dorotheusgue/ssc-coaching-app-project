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
      week?: number;
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
          rpeTarget?: number;
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
                week: { type: SchemaType.INTEGER },
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
                            rpeTarget: { type: SchemaType.NUMBER },
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
    return { success: false, error: "Input is too short. Upload a file or paste a program." };
  }
  if (trimmedPrompt.length > 200000) {
    return { success: false, error: "Input is too long (max 200,000 chars)." };
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

  const systemInstruction = `You transcribe existing strength & conditioning programs into a structured schema. You DO NOT design programs from scratch or invent content. You take the user's program (typically pasted/uploaded markdown with weeks, days, blocks, exercises, sets/reps/loads) and faithfully convert it into the data model below.

CONSTRAINTS — hard rules:
1. Transcribe ONLY what is in the source. Do not invent weeks, sessions, blocks, or exercises that aren't there. If the source is vague on a value (e.g. no rest time given), leave that field unset rather than guess.
2. Use ONLY exercises from the EXERCISE LIBRARY below. Match names EXACTLY as written. If a source exercise doesn't appear in the library, pick the closest match by movement pattern and category; if there is no reasonable match, omit that line (the system will report it as skipped).
3. Generate AT MOST 12 weeks total across all phases in one call. If the source is longer, transcribe the first 12 weeks and stop.
4. dayOfWeek is 1-7 where 1=Monday, 7=Sunday.
5. The "week" field is 1-based and PHASE-RELATIVE. If a phase has 4 weeks and Monday's session changes each week, emit 4 separate sessions for that day with week=1, 2, 3, 4. If Monday is the same every week of the phase, use week=0 (the system will replay it across all weeks of the phase). Default to week=0 ONLY when content is identical week-to-week.
6. blockType must be one of: warmup, sprint, strength, accessory, notes. Group exercises into blocks that fit their type (warmups in warmup, lifts in strength, etc.).
7. For sprint/distance exercises, populate "distance" (meters) and "time" (seconds) when given.
8. For strength exercises, populate "sets", "reps" (string like "5" or "3-5"), and either "load" (string like "80kg" or "BW") or "percent1RM" (number). If the source gives RPE (e.g. "RPE 8" or "@8"), populate "rpeTarget" (1–10) as well.
9. Preserve the source's weekly layout, exercise order, sets, reps, and intensities exactly. If the source labels weeks (Week 1, Week 2, etc.) with different content, you MUST emit a session per week using the "week" field — do not collapse them.
10. The current program already has ${existingPhases.length} phase(s); your phases must start at week ${baseWeekOffset + 1} or later.

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
      const phaseWeekSpan =
        insertedPhase.endWeek - insertedPhase.startWeek + 1;
      const rawWeek = sess.week ?? 0;
      const clampedWeek =
        rawWeek <= 0 ? 0 : Math.min(Math.max(1, rawWeek), phaseWeekSpan);

      const [insertedTemplate] = await db
        .insert(sessionTemplates)
        .values({
          phaseId: insertedPhase.id,
          dayOfWeek: Math.min(7, Math.max(1, sess.dayOfWeek)),
          week: clampedWeek,
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
            rpeTarget: ex.rpeTarget ?? null,
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
