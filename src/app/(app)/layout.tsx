import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TopBar from "@/components/ui/TopBar";
import BottomNav from "@/components/ui/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <TopBar
        name={session.user.name ?? "Staff"}
        email={session.user.email ?? ""}
      />
      <main className="pt-14 pb-18 px-4 bg-[#f8f9ff] min-h-screen">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
