import { Badge } from "@/components/ui/badge";
import type { ActivityItem } from "@/data/opsMockData";

const moduleBadgeVariant: Record<string, string> = {
  Entities: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Auctions: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Finance: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Logistics: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  Documentation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  Disputes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Trust: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

interface Props {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: Props) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Recent Activity</h3>
        <p className="text-xs text-muted-foreground">Latest ops actions across all modules</p>
      </div>
      <div className="divide-y max-h-[500px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm">{item.action}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      moduleBadgeVariant[item.module] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.module}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.details}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">{item.timestamp}</p>
                <p className="text-[10px] text-muted-foreground">{item.user}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
