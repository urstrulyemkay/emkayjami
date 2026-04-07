import { OpsLayout } from "@/components/ops/OpsLayout";
import { SummaryCard } from "@/components/ops/SummaryCard";
import { QueueHealthTable } from "@/components/ops/QueueHealthTable";
import { ActivityFeed } from "@/components/ops/ActivityFeed";
import { summaryCards, queueHealthData, recentActivity } from "@/data/opsMockData";

export default function OpsDashboard() {
  return (
    <OpsLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of all active queues, exceptions, and recent activity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} card={card} />
          ))}
        </div>

        {/* Queue Health + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <QueueHealthTable data={queueHealthData} />
          </div>
          <div>
            <ActivityFeed items={recentActivity} />
          </div>
        </div>
      </div>
    </OpsLayout>
  );
}
