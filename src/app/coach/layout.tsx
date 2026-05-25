import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { getUnreadMessageCount } from "@/lib/session";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "coach" && role !== "admin") {
    redirect("/login");
  }

  const userId = parseInt((session.user as { id?: string }).id ?? "0");
  const unreadMessages = userId ? await getUnreadMessageCount(userId) : 0;

  return (
    <div className="min-h-screen bg-neutral-900">
      <Sidebar unreadMessages={unreadMessages} />
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
