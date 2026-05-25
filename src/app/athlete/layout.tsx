import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AthleteNav } from "@/components/layout/AthleteNav";
import { getUnreadMessageCount } from "@/lib/session";

export default async function AthleteLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const session = await auth();
 if (!session?.user) redirect("/login");

 const userId = parseInt((session.user as { id?: string }).id ?? "0");
 const unreadMessages = userId ? await getUnreadMessageCount(userId) : 0;

 return (
 <div className="min-h-screen bg-bg flex flex-col">
 <Header />
 <main className="flex-1 pb-20">{children}</main>
 <AthleteNav unreadMessages={unreadMessages} />
 </div>
 );
}
