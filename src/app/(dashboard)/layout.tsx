import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-transparent p-2 sm:p-4 lg:p-6 overflow-hidden">
      {/* Floating App Shell Container */}
      <div className="flex-1 flex w-full max-w-[1920px] mx-auto bg-surface-950/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-black/20">
          <Header />
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

