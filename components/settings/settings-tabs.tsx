"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataPrivacyPanel } from "@/components/settings/data-privacy-panel";
import { MembersPanel } from "@/components/settings/members-panel";
import { PlansPanel } from "@/components/settings/plans-panel";
import { WorkspaceForm } from "@/components/settings/workspace-form";
import { mockUsage } from "@/components/settings/data";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="workspace">
      <TabsList>
        <TabsTrigger value="workspace">Workspace</TabsTrigger>
        <TabsTrigger value="members">Membros</TabsTrigger>
        <TabsTrigger value="plans">Plano</TabsTrigger>
        <TabsTrigger value="data">Dados (LGPD)</TabsTrigger>
      </TabsList>

      <TabsContent value="workspace" className="mt-6 max-w-lg">
        <WorkspaceForm />
      </TabsContent>

      <TabsContent value="members" className="mt-6 max-w-lg">
        <MembersPanel plan={mockUsage.plan} />
      </TabsContent>

      <TabsContent value="plans" className="mt-6">
        <PlansPanel />
      </TabsContent>

      <TabsContent value="data" className="mt-6 max-w-lg">
        <DataPrivacyPanel />
      </TabsContent>
    </Tabs>
  );
}
