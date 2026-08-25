import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <div className="max-w-lg space-y-4 rounded-lg border border-border p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
