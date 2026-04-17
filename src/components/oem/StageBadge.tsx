import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stage } from "@/data/oemTypes";
import { STAGE_LABELS } from "@/data/oemMockData";

const stageStyle: Record<Stage, string> = {
  registered: "bg-stage-registered/10 text-stage-registered border-stage-registered/30",
  inspected: "bg-stage-inspected/10 text-stage-inspected border-stage-inspected/30",
  listed: "bg-stage-listed/10 text-stage-listed border-stage-listed/30",
  live: "bg-stage-live/10 text-stage-live border-stage-live/30",
  allocated: "bg-stage-allocated/10 text-stage-allocated border-stage-allocated/30",
  transit: "bg-stage-transit/10 text-stage-transit border-stage-transit/30",
  closed: "bg-stage-closed/10 text-stage-closed border-stage-closed/30",
  failed: "bg-stage-failed/10 text-stage-failed border-stage-failed/30",
};

export const StageBadge = ({ stage, className }: { stage: Stage; className?: string }) => (
  <Badge variant="outline" className={cn("font-medium border", stageStyle[stage], className)}>
    {STAGE_LABELS[stage]}
  </Badge>
);
