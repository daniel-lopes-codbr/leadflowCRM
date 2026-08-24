import { NavLinks } from "@/components/shell/nav-links";
import { WorkspaceSwitcher, type WorkspaceOption } from "@/components/shell/workspace-switcher";

export function Sidebar({
  workspaceId,
  workspaces,
  onNavigate,
}: {
  workspaceId: string;
  workspaces: WorkspaceOption[];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-6 p-4">
      <WorkspaceSwitcher workspaceId={workspaceId} workspaces={workspaces} />
      <NavLinks workspaceId={workspaceId} onNavigate={onNavigate} />
    </div>
  );
}
