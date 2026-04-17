import type { Stage } from "@/data/oemTypes";
import { STAGE_LABELS } from "@/data/oemMockData";
import { cn } from "@/lib/utils";

interface Props {
  counts: Record<Stage, number>;
  onStageClick?: (stage: Stage) => void;
}

const ORDER: Stage[] = ["registered", "inspected", "listed", "live", "allocated", "transit", "closed"];

const stageBg: Record<Stage, string> = {
  registered: "bg-stage-registered",
  inspected: "bg-stage-inspected",
  listed: "bg-stage-listed",
  live: "bg-stage-live",
  allocated: "bg-stage-allocated",
  transit: "bg-stage-transit",
  closed: "bg-stage-closed",
  failed: "bg-stage-failed",
};

export const VehiclePipelineBar = ({ counts, onStageClick }: Props) => {
  const total = ORDER.reduce((s, st) => s + (counts[st] ?? 0), 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Vehicle Pipeline</p>
        <p className="text-xs text-muted-foreground">{total} active</p>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        {ORDER.map((s) => {
          const w = total > 0 ? (counts[s] / total) * 100 : 0;
          if (w === 0) return null;
          return <div key={s} className={cn(stageBg[s])} style={{ width: `${w}%` }} />;
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ORDER.map((s) => (
          <button
            key={s}
            onClick={() => onStageClick?.(s)}
            className="text-left p-2 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", stageBg[s])} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{STAGE_LABELS[s]}</p>
            </div>
            <p className="text-lg font-semibold mt-0.5">{counts[s] ?? 0}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
