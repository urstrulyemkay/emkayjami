import { cn } from "@/lib/utils";

interface SLAPillProps {
  count: number;
  type: "onTrack" | "warning" | "overdue";
}

const config = {
  onTrack: { bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "On Track" },
  warning: { bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Warning" },
  overdue: { bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Overdue" },
};

export function SLAPill({ count, type }: SLAPillProps) {
  if (count === 0) return <span className="text-muted-foreground text-sm">0</span>;

  const { bg } = config[type];

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", bg)}>
      {count}
    </span>
  );
}
