import { NavLinks } from "@/components/shell/nav-links";
import { WorkspaceSwitcher } from "@/components/shell/workspace-switcher";

export function Sidebar({
  workspaceId,
  onNavigate,
}: {
  workspaceId: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <WorkspaceSwitcher workspaceId={workspaceId} />
      <NavLinks workspaceId={workspaceId} onNavigate={onNavigate} />
    </div>
  );
}
