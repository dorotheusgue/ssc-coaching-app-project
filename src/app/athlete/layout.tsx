import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AthleteNav } from "@/components/layout/AthleteNav";

export default async function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <AthleteNav />
    </div>
  );
}
