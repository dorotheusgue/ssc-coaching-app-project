import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { programs, phases } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, FileText } from "lucide-react";

export default async function ProgramsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const coachId = parseInt((session.user as { id: string }).id);

  const allPrograms = await db
    .select({
      id: programs.id,
      name: programs.name,
      description: programs.description,
      status: programs.status,
      createdAt: programs.createdAt,
      phaseCount: count(phases.id),
    })
    .from(programs)
    .leftJoin(phases, eq(phases.programId, programs.id))
    .where(eq(programs.coachId, coachId))
    .groupBy(programs.id)
    .all();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Programs</h1>
            <p className="text-mute mt-1">
              {allPrograms.length} program{allPrograms.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateProgramButton coachId={coachId} />
        </div>

        {allPrograms.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-faint mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">
              No programs yet
            </h2>
            <p className="text-faint mb-6">
              Create your first training program to get started
            </p>
            <CreateProgramButton coachId={coachId} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPrograms.map((program) => (
              <Link
                key={program.id}
                href={`/coach/programs/${program.id}`}
                className="bg-surface border border-line rounded-xl p-5 hover:border-line transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                      program.status === "published"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : program.status === "draft"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-mute/20 text-mute border-mute/30"
                    }`}
                  >
                    {program.status}
                  </span>
                </div>

                <h3 className="text-ink font-semibold text-lg mb-1.5 group-hover:text-emerald-400 transition-colors">
                  {program.name}
                </h3>
                <p className="text-mute text-sm mb-4 line-clamp-2">
                  {program.description || "No description"}
                </p>

                <div className="flex items-center gap-4 text-sm text-faint">
                  <span>
                    {program.phaseCount} phase{program.phaseCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateProgramButton({ coachId }: { coachId: number }) {
  return (
    <form
      action={async () => {
        "use server";
        const { auth } = await import("@/lib/auth");
        const { db } = await import("@/db");
        const { programs } = await import("@/db/schema");
        const session = await auth();
        if (!session?.user) return;
        const [program] = await db
          .insert(programs)
          .values({
            name: "New Program",
            coachId: parseInt((session.user as { id: string }).id),
          })
          .returning();
        const { redirect } = await import("next/navigation");
        redirect(`/coach/programs/${program.id}`);
      }}
    >
      <Button type="submit">
        <Plus className="w-4 h-4 mr-2" />
        Create Program
      </Button>
    </form>
  );
}
