"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FollowUpActionResult } from "@/app/(app)/[workspaceId]/leads/followup-actions";

function splitDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function RescheduleFollowUpDialog({
  open,
  onOpenChange,
  currentScheduledAt,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentScheduledAt: string;
  onSubmit: (newScheduledAt: string) => Promise<FollowUpActionResult>;
}) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const { date, time } = splitDateTime(currentScheduledAt);
      setNewDate(date);
      setNewTime(time);
      setServerError(null);
    }
  }, [open, currentScheduledAt]);

  async function handleSubmit() {
    setSubmitting(true);
    setServerError(null);
    const result = await onSubmit(new Date(`${newDate}T${newTime}`).toISOString());
    setSubmitting(false);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reagendar follow-up</DialogTitle>
          <DialogDescription>
            O agendamento atual é cancelado e um novo é criado para a nova data — o histórico do
            reagendamento fica visível na timeline.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-date">Nova data</Label>
            <Input
              id="reschedule-date"
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-time">Novo horário</Label>
            <Input
              id="reschedule-time"
              type="time"
              value={newTime}
              onChange={(event) => setNewTime(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !newDate || !newTime}
          >
            Reagendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
