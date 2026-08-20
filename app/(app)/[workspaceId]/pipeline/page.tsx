import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Arraste os negócios entre as etapas para atualizar o status.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
