import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============ USER & AUTH ============

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["coach", "athlete", "admin"] }).notNull().default("athlete"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ PROFILES ============

export const coachProfiles = sqliteTable("coach_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  organization: text("organization"),
  specialty: text("specialty"),
  bio: text("bio"),
});

export const athleteProfiles = sqliteTable("athlete_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  coachId: integer("coach_id").references(() => users.id),
  sport: text("sport"),
  event: text("event"),
  dateOfBirth: text("date_of_birth"),
  height: real("height"),
  weight: real("weight"),
  personalBests: text("personal_bests", { mode: "json" }).$defaultFn(() => ({})),
  notes: text("notes"),
  invitedAt: integer("invited_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ GROUPS ============

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  coachId: integer("coach_id").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const groupMembers = sqliteTable("group_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => groups.id),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  addedAt: integer("added_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ EXERCISE LIBRARY ============

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category", {
    enum: [
      "sprint",
      "plyometric",
      "strength",
      "olympic",
      "accessory",
      "core",
      "isometric",
      "conditioning",
      "mobility",
      "warmup",
      "recovery",
    ],
  }).notNull(),
  movementPattern: text("movement_pattern", {
    enum: [
      "squat",
      "hinge",
      "push",
      "pull",
      "lunge",
      "carry",
      "sprint",
      "jump",
      "throw",
      "rotation",
      "other",
    ],
  }),
  tags: text("tags", { mode: "json" }).$defaultFn(() => []),
  description: text("description"),
  videoUrl: text("video_url"),
  trackingType: text("tracking_type", { enum: ["reps", "load", "distance", "time", "none"] }).notNull().default("reps"),
  coachId: integer("coach_id").references(() => users.id),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ PROGRAMS ============

export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  coachId: integer("coach_id").notNull().references(() => users.id),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const phases = sqliteTable("phases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id").notNull().references(() => programs.id),
  name: text("name").notNull(),
  goal: text("goal"),
  sortOrder: integer("sort_order").notNull().default(0),
  startWeek: integer("start_week").notNull().default(1),
  endWeek: integer("end_week").notNull().default(4),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sessionTemplates = sqliteTable("session_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phaseId: integer("phase_id").notNull().references(() => phases.id),
  dayOfWeek: integer("day_of_week").notNull(),
  // 0 = every week of the phase (replay); 1+ = only that specific week
  week: integer("week").notNull().default(0),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  notes: text("notes"),
});

export const sessionBlocks = sqliteTable("session_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionTemplateId: integer("session_template_id").notNull().references(() => sessionTemplates.id),
  blockType: text("block_type", { enum: ["warmup", "sprint", "strength", "accessory", "notes"] }).notNull(),
  label: text("label"),
  sortOrder: integer("sort_order").notNull().default(0),
  restSeconds: integer("rest_seconds"),
});

export const blockExercises = sqliteTable("block_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  blockId: integer("block_id").notNull().references(() => sessionBlocks.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  sets: integer("sets"),
  reps: text("reps"),
  load: text("load"),
  percent1RM: real("percent_1rm"),
  distance: real("distance"),
  time: real("time"),
  restSeconds: integer("rest_seconds"),
  rpeTarget: real("rpe_target"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ============ ASSIGNMENTS ============

export const programAssignments = sqliteTable("program_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id").notNull().references(() => programs.id),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  startDate: text("start_date").notNull(),
  status: text("status", { enum: ["active", "completed", "cancelled"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const assignedSessions = sqliteTable("assigned_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assignmentId: integer("assignment_id").notNull().references(() => programAssignments.id),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  sessionTemplateId: integer("session_template_id").references(() => sessionTemplates.id),
  date: text("date").notNull(),
  label: text("label").notNull(),
  status: text("status", { enum: ["scheduled", "in_progress", "completed", "skipped"] }).notNull().default("scheduled"),
  notes: text("notes"),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// ============ LOGGING ============

export const setEntries = sqliteTable("set_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assignedSessionId: integer("assigned_session_id").notNull().references(() => assignedSessions.id),
  blockExerciseId: integer("block_exercise_id").references(() => blockExercises.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps"),
  load: real("load"),
  distance: real("distance"),
  time: real("time"),
  rpe: real("rpe"),
  notes: text("notes"),
  completed: integer("completed", { mode: "boolean" }).default(false),
  loggedAt: integer("logged_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sprintEntries = sqliteTable("sprint_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assignedSessionId: integer("assigned_session_id").notNull().references(() => assignedSessions.id),
  blockExerciseId: integer("block_exercise_id").references(() => blockExercises.id),
  repNumber: integer("rep_number").notNull(),
  distance: real("distance"),
  time: real("time"),
  rpe: real("rpe"),
  notes: text("notes"),
  completed: integer("completed", { mode: "boolean" }).default(false),
  loggedAt: integer("logged_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ READINESS / WELLNESS ============

export const readinessEntries = sqliteTable("readiness_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  assignedSessionId: integer("assigned_session_id").references(() => assignedSessions.id),
  date: text("date").notNull(),
  sleepQuality: integer("sleep_quality").notNull(),
  fatigue: integer("fatigue").notNull(),
  soreness: integer("soreness").notNull(),
  stress: integer("stress").notNull(),
  mood: integer("mood").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ MESSAGING ============

export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  coachId: integer("coach_id").notNull().references(() => users.id),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  readAt: integer("read_at", { mode: "timestamp" }),
  assignedSessionId: integer("assigned_session_id").references(() => assignedSessions.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ MEDIA ============

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  coachId: integer("coach_id").references(() => users.id),
  assignedSessionId: integer("assigned_session_id").references(() => assignedSessions.id),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  type: text("type", { enum: ["video", "image"] }).notNull(),
  caption: text("caption"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
