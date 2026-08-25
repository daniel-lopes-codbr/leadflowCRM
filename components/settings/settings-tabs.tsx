"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataPrivacyPanel } from "@/components/settings/data-privacy-panel";
import { MembersPanel, type Member, type PendingInvite } from "@/components/settings/members-panel";
import { PlansPanel } from "@/components/settings/plans-panel";
import { WorkspaceForm } from "@/components/settings/workspace-form";
import type { WorkspacePlan } from "@/lib/plans";

export function SettingsTabs({
  workspaceId,
  workspace,
  members,
  pendingInvites,
  currentUserId,
  isAdmin,
  leadsUsed,
}: {
  workspaceId: string;
  workspace: { name: string; logoUrl: string | null; plan: WorkspacePlan };
  members: Member[];
  pendingInvites: PendingInvite[];
  currentUserId: string;
  isAdmin: boolean;
  leadsUsed: number;
}) {
  return (
    <Tabs defaultValue="workspace">
      <TabsList>
        <TabsTrigger value="workspace">Workspace</TabsTrigger>
        <TabsTrigger value="members">Membros</TabsTrigger>
        <TabsTrigger value="plans">Plano</TabsTrigger>
        <TabsTrigger value="data">Dados (LGPD)</TabsTrigger>
      </TabsList>

      <TabsContent value="workspace" className="mt-6 max-w-lg">
        <WorkspaceForm workspaceId={workspaceId} workspace={workspace} isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="members" className="mt-6 max-w-lg">
        <MembersPanel
          workspaceId={workspaceId}
          plan={workspace.plan}
          members={members}
          pendingInvites={pendingInvites}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      </TabsContent>

      <TabsContent value="plans" className="mt-6 max-w-3xl">
        <PlansPanel plan={workspace.plan} membersUsed={members.length} leadsUsed={leadsUsed} />
      </TabsContent>

      <TabsContent value="data" className="mt-6 max-w-lg">
        <DataPrivacyPanel />
      </TabsContent>
    </Tabs>
  );
}
