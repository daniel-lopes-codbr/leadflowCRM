import { Navbar } from "@/components/shell/navbar";
import { Sidebar } from "@/components/shell/sidebar";

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  return (
    <div className="bg-secondary/30 flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex">
        <Sidebar workspaceId={params.workspaceId} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar workspaceId={params.workspaceId} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
