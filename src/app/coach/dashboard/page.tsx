import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  athleteProfiles,
  programs,
  assignedSessions,
  readinessEntries,
} from "@/db/schema";
import { eq, and, desc, gte, count, avg } from "drizzle-orm";
import {
  Users,
  Dumbbell,
  Activity,
  CalendarDays,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WeeklyChart } from "./WeeklyChart";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const session = await auth();
  const coachId = Number((session!.user as { id?: string }).id);
  const now = new Date();
  const today = formatDate(now);
  const sevenDaysAgo = formatDate(
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );

  const [athleteCount] = await db
    .select({ value: count() })
    .from(athleteProfiles)
    .where(eq(athleteProfiles.coachId, coachId));

  const [programCount] = await db
    .select({ value: count() })
    .from(programs)
    .where(eq(programs.coachId, coachId));

  const [avgReadiness] = await db
    .select({
      value: avg(readinessEntries.sleepQuality),
    })
    .from(readinessEntries)
    .innerJoin(athleteProfiles, eq(athleteProfiles.userId, readinessEntries.athleteId))
    .where(
      and(
        eq(athleteProfiles.coachId, coachId),
        gte(readinessEntries.date, sevenDaysAgo)
      )
    );

  const [todaySessions] = await db
    .select({ value: count() })
    .from(assignedSessions)
    .innerJoin(athleteProfiles, eq(athleteProfiles.userId, assignedSessions.athleteId))
    .where(
      and(
        eq(athleteProfiles.coachId, coachId),
        eq(assignedSessions.date, today)
      )
    );

  const recentSessions = await db
    .select({
      id: assignedSessions.id,
      label: assignedSessions.label,
      date: assignedSessions.date,
      athleteName: users.name,
      completedAt: assignedSessions.completedAt,
    })
    .from(assignedSessions)
    .innerJoin(users, eq(users.id, assignedSessions.athleteId))
    .innerJoin(athleteProfiles, eq(athleteProfiles.userId, assignedSessions.athleteId))
    .where(
      and(
        eq(athleteProfiles.coachId, coachId),
        eq(assignedSessions.status, "completed")
      )
    )
    .orderBy(desc(assignedSessions.completedAt))
    .limit(5);

  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const weeklyData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(d);
    const [completed] = await db
      .select({ value: count() })
      .from(assignedSessions)
      .innerJoin(athleteProfiles, eq(athleteProfiles.userId, assignedSessions.athleteId))
      .where(
        and(
          eq(athleteProfiles.coachId, coachId),
          eq(assignedSessions.date, dateStr),
          eq(assignedSessions.status, "completed")
        )
      );
    const [total] = await db
      .select({ value: count() })
      .from(assignedSessions)
      .innerJoin(athleteProfiles, eq(athleteProfiles.userId, assignedSessions.athleteId))
      .where(
        and(
          eq(athleteProfiles.coachId, coachId),
          eq(assignedSessions.date, dateStr)
        )
      );
    weeklyData.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      completed: completed.value,
      total: total.value,
    });
  }

  const kpis = [
    {
      label: "Active Athletes",
      value: athleteCount.value,
      icon: Users,
      color: "text-emerald-500",
    },
    {
      label: "Programs Created",
      value: programCount.value,
      icon: Dumbbell,
      color: "text-blue-500",
    },
    {
      label: "Avg Readiness (7d)",
      value: avgReadiness.value ? Number(avgReadiness.value).toFixed(1) : "N/A",
      icon: Activity,
      color: "text-amber-500",
    },
    {
      label: "Today's Sessions",
      value: todaySessions.value,
      icon: CalendarDays,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-mute mt-1">
            Welcome back, {session!.user?.name}
          </p>
        </div>
        <div className="flex gap-3">
          <NewProgramButton />
          <Link href="/coach/athletes">
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Athlete
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mute">{kpi.label}</p>
                  <p className="text-3xl font-bold text-ink mt-1">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-surface/50 ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Weekly Completion" className="lg:col-span-2">
          <WeeklyChart data={weeklyData} />
        </Card>

        <Card
          title="Quick Actions"
          actions={
            <Link href="/coach/calendar">
              <Button variant="ghost" size="sm">
                View Calendar
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            <NewProgramQuickAction />
            <Link href="/coach/athletes" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 hover:bg-hover transition-colors">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Add Athlete</p>
                  <p className="text-xs text-mute">Invite a new athlete</p>
                </div>
              </div>
            </Link>
            <Link href="/coach/calendar" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 hover:bg-hover transition-colors">
                <div className="p-2 rounded-md bg-purple-500/10">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">View Calendar</p>
                  <p className="text-xs text-mute">See upcoming sessions</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        {recentSessions.length === 0 ? (
          <p className="text-mute text-sm">No completed sessions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-3 px-4 text-mute font-medium">
                    Athlete
                  </th>
                  <th className="text-left py-3 px-4 text-mute font-medium">
                    Session
                  </th>
                  <th className="text-left py-3 px-4 text-mute font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-mute font-medium">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-line/50 hover:bg-hover/30"
                  >
                    <td className="py-3 px-4 text-ink">{s.athleteName}</td>
                    <td className="py-3 px-4 text-ink">{s.label}</td>
                    <td className="py-3 px-4 text-ink">{s.date}</td>
                    <td className="py-3 px-4 text-ink">
                      {s.completedAt
                        ? new Date(s.completedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

async function createNewProgram() {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const coachId = parseInt((session.user as { id: string }).id);
  const [program] = await db
    .insert(programs)
    .values({ name: "New Program", coachId })
    .returning();
  redirect(`/coach/programs/${program.id}`);
}

function NewProgramButton() {
  return (
    <form action={createNewProgram}>
      <Button type="submit">
        <Plus className="w-4 h-4 mr-2" />
        New Program
      </Button>
    </form>
  );
}

function NewProgramQuickAction() {
  return (
    <form action={createNewProgram}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface/50 hover:bg-hover transition-colors text-left"
      >
        <div className="p-2 rounded-md bg-emerald-500/10">
          <Dumbbell className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">New Program</p>
          <p className="text-xs text-mute">Create a training program</p>
        </div>
      </button>
    </form>
  );
}
