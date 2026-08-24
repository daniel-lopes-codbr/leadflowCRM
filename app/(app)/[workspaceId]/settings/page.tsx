import { SettingsTabs } from "@/components/settings/settings-tabs";

export default function SettingsPage({ params }: { params: { workspaceId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o workspace, sua equipe, o plano e a privacidade dos dados.
        </p>
      </div>
      <SettingsTabs workspaceId={params.workspaceId} />
    </div>
  );
}
