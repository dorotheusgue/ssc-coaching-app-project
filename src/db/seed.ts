import { db } from "./index";
import { users, exercises, coachProfiles } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const coachPassword = await bcrypt.hash("coach123", 10);
  const athletePassword = await bcrypt.hash("athlete123", 10);

  // Create coach user
  const [coach] = await db
    .insert(users)
    .values({
      name: "Coach Williams",
      email: "coach@example.com",
      passwordHash: coachPassword,
      role: "coach",
    })
    .returning();

  // Create coach profile
  await db.insert(coachProfiles).values({
    userId: coach.id,
    organization: "Elite Speed Academy",
    specialty: "Sprint & S&C",
    bio: "15 years coaching experience with elite sprinters.",
  });

  // Create athlete users
  const [athlete1] = await db
    .insert(users)
    .values({
      name: "Marcus Johnson",
      email: "marcus@example.com",
      passwordHash: athletePassword,
      role: "athlete",
    })
    .returning();

  const [athlete2] = await db
    .insert(users)
    .values({
      name: "Sarah Chen",
      email: "sarah@example.com",
      passwordHash: athletePassword,
      role: "athlete",
    })
    .returning();

  const [athlete3] = await db
    .insert(users)
    .values({
      name: "James Okafor",
      email: "james@example.com",
      passwordHash: athletePassword,
      role: "athlete",
    })
    .returning();

  // Seed default exercises
  const defaultExercises = [
    // Sprint
    { name: "30m Sprint", category: "sprint" as const, tags: ["acceleration"], trackingType: "time" as const, isDefault: true, description: "Full 30m sprint from blocks or standing start." },
    { name: "60m Sprint", category: "sprint" as const, tags: ["acceleration", "maxV"], trackingType: "time" as const, isDefault: true, description: "60m sprint combining acceleration and max velocity." },
    { name: "Flying 30m", category: "sprint" as const, tags: ["maxV"], trackingType: "time" as const, isDefault: true, description: "30m fly with 30m build-up. Measures top-end speed." },
    { name: "150m Sprint", category: "sprint" as const, tags: ["speedEndurance"], trackingType: "time" as const, isDefault: true, description: "150m sprint for speed endurance development." },
    { name: "Block Starts (10m)", category: "sprint" as const, tags: ["acceleration", "starts"], trackingType: "time" as const, isDefault: true, description: "10m from blocks focusing on drive phase." },
    { name: "Sprint Drills (A-Skip)", category: "sprint" as const, tags: ["drills", "warmup"], trackingType: "distance" as const, isDefault: true, description: "A-Skip drill for 30-50m." },
    { name: "Sprint Drills (B-Skip)", category: "sprint" as const, tags: ["drills", "warmup"], trackingType: "distance" as const, isDefault: true, description: "B-Skip drill for 30-50m." },
    { name: "Wicket Runs", category: "sprint" as const, tags: ["maxV", "drills"], trackingType: "distance" as const, isDefault: true, description: "Running over mini-hurdles to cue stride frequency." },
    // Plyometric
    { name: "Box Jumps", category: "plyometric" as const, tags: ["power", "vertical"], trackingType: "reps" as const, isDefault: true, description: "Jump onto box from standing position." },
    { name: "Depth Jumps", category: "plyometric" as const, tags: ["power", "reactive"], trackingType: "reps" as const, isDefault: true, description: "Step off box and immediately jump vertically." },
    { name: "Bounding", category: "plyometric" as const, tags: ["power", "horizontal"], trackingType: "distance" as const, isDefault: true, description: "Exaggerated running jumps for power." },
    { name: "Single Leg Hops", category: "plyometric" as const, tags: ["power", "unilateral"], trackingType: "reps" as const, isDefault: true, description: "Single leg hops for distance or height." },
    { name: "Hurdle Hops", category: "plyometric" as const, tags: ["power", "reactive"], trackingType: "reps" as const, isDefault: true, description: "Continuous jumps over mini hurdles." },
    // Strength
    { name: "Back Squat", category: "strength" as const, tags: ["lower", "compound"], trackingType: "load" as const, isDefault: true, description: "Barbell back squat." },
    { name: "Front Squat", category: "strength" as const, tags: ["lower", "compound"], trackingType: "load" as const, isDefault: true, description: "Barbell front squat." },
    { name: "Romanian Deadlift", category: "strength" as const, tags: ["posterior", "compound"], trackingType: "load" as const, isDefault: true, description: "Barbell RDL for hamstring development." },
    { name: "Trap Bar Deadlift", category: "strength" as const, tags: ["lower", "compound", "power"], trackingType: "load" as const, isDefault: true, description: "Trap/hex bar deadlift." },
    { name: "Bench Press", category: "strength" as const, tags: ["upper", "compound"], trackingType: "load" as const, isDefault: true, description: "Barbell bench press." },
    { name: "Hip Thrust", category: "strength" as const, tags: ["posterior", "glutes"], trackingType: "load" as const, isDefault: true, description: "Barbell hip thrust." },
    { name: "Split Squat", category: "strength" as const, tags: ["lower", "unilateral"], trackingType: "load" as const, isDefault: true, description: "Bulgarian or regular split squat." },
    { name: "Pull-ups", category: "strength" as const, tags: ["upper", "pull"], trackingType: "reps" as const, isDefault: true, description: "Pull-ups or chin-ups." },
    { name: "Overhead Press", category: "strength" as const, tags: ["upper", "push"], trackingType: "load" as const, isDefault: true, description: "Barbell overhead press." },
    // Accessory
    { name: "Nordic Curls", category: "accessory" as const, tags: ["hamstring", "eccentric"], trackingType: "reps" as const, isDefault: true, description: "Eccentric hamstring exercise." },
    { name: "Calf Raises", category: "accessory" as const, tags: ["lower", "calves"], trackingType: "load" as const, isDefault: true, description: "Standing or seated calf raises." },
    { name: "Copenhagen Plank", category: "accessory" as const, tags: ["core", "adductor"], trackingType: "time" as const, isDefault: true, description: "Side plank with top leg elevated." },
    { name: "Pallof Press", category: "accessory" as const, tags: ["core", "anti-rotation"], trackingType: "load" as const, isDefault: true, description: "Cable or band Pallof press." },
    { name: "Band Walks", category: "accessory" as const, tags: ["glutes", "activation"], trackingType: "distance" as const, isDefault: true, description: "Lateral band walks for glute activation." },
    // Mobility / Warmup
    { name: "Hip Flexor Stretch", category: "mobility" as const, tags: ["hip", "stretch"], trackingType: "time" as const, isDefault: true, description: "Half-kneeling hip flexor stretch." },
    { name: "Leg Swings", category: "warmup" as const, tags: ["dynamic", "warmup"], trackingType: "reps" as const, isDefault: true, description: "Front-to-back and lateral leg swings." },
    { name: "Jog (Easy)", category: "warmup" as const, tags: ["cardio", "warmup"], trackingType: "distance" as const, isDefault: true, description: "Easy jog for warm-up." },
    { name: "Foam Rolling", category: "mobility" as const, tags: ["recovery", "mobility"], trackingType: "time" as const, isDefault: true, description: "Foam rolling major muscle groups." },
  ];

  await db.insert(exercises).values(
    defaultExercises.map((e) => ({
      ...e,
      coachId: null,
    }))
  );

  console.log("Seed complete!");
  console.log(`Coach: coach@example.com / coach123`);
  console.log(`Athletes: marcus@example.com, sarah@example.com, james@example.com / athlete123`);
}

seed().catch(console.error);
