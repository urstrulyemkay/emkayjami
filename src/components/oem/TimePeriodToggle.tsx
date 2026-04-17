import { cn } from "@/lib/utils";

export type TimePeriod = "today" | "7d" | "30d" | "mtd";
const LABELS: Record<TimePeriod, string> = { today: "Today", "7d": "7d", "30d": "30d", mtd: "MTD" };

export const TimePeriodToggle = ({
  value,
  onChange,
  options = ["today", "7d", "30d", "mtd"],
}: {
  value: TimePeriod;
  onChange: (p: TimePeriod) => void;
  options?: TimePeriod[];
}) => (
  <div className="inline-flex bg-muted rounded-lg p-0.5">
    {options.map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-colors",
          value === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {LABELS[p]}
      </button>
    ))}
  </div>
);
