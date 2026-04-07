import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { Badge } from "@/components/ui/badge";
import { mockOnboardingPipeline, type OnboardingPipelineItem } from "@/data/entityMockData";

const stageLabels: Record<string, string> = {
  registered: "Registered",
  docs_submitted: "Docs Submitted",
  kyc_review: "KYC Review",
  agreement: "Agreement",
  activation: "Activation",
};

const stageColors: Record<string, string> = {
  registered: "bg-muted text-muted-foreground",
  docs_submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  kyc_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  agreement: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  activation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const columns: QueueColumn<OnboardingPipelineItem>[] = [
  {
    key: "entity_type", header: "Type",
    render: (row) => (
      <Badge variant={row.entity_type === "oem" ? "default" : "secondary"} className="text-xs uppercase">
        {row.entity_type}
      </Badge>
    ),
  },
  { key: "entity_name", header: "Entity Name", sortable: true },
  { key: "city", header: "City", sortable: true },
  {
    key: "stage", header: "Stage",
    render: (row) => (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${stageColors[row.stage]}`}>
        {stageLabels[row.stage]}
      </span>
    ),
  },
  {
    key: "days_in_stage", header: "Days in Stage", sortable: true, className: "text-center",
    render: (row) => (
      <span className={`font-medium ${row.days_in_stage > 5 ? "text-red-600" : ""}`}>
        {row.days_in_stage}d
      </span>
    ),
  },
  { key: "assigned_to", header: "Assigned To", render: (row) => row.assigned_to || <span className="text-red-500 text-xs">Unassigned</span> },
  {
    key: "sla_status", header: "SLA",
    render: (row) => (
      <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} />
    ),
  },
  { key: "created_at", header: "Created", sortable: true },
];

const filters: QueueFilter[] = [
  { key: "entity_type", label: "Type", options: [{ label: "OEM", value: "oem" }, { label: "Broker", value: "broker" }] },
  { key: "stage", label: "Stage", options: Object.entries(stageLabels).map(([k, v]) => ({ label: v, value: k })) },
  { key: "sla_status", label: "SLA", options: [{ label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" }] },
];

export default function OpsOnboardingPipeline() {
  return (
    <OpsLayout>
      <div className="space-y-4">
        {/* Pipeline Summary */}
        <div>
          <h1 className="text-2xl font-bold">Onboarding Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track entities through the onboarding journey from registration to activation</p>
        </div>

        {/* Stage Summary Cards */}
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(stageLabels).map(([key, label]) => {
            const count = mockOnboardingPipeline.filter((p) => p.stage === key).length;
            const overdueCount = mockOnboardingPipeline.filter((p) => p.stage === key && p.sla_status === "overdue").length;
            return (
              <div key={key} className="rounded-lg border bg-card p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{count}</p>
                {overdueCount > 0 && (
                  <p className="text-[10px] text-red-600">{overdueCount} overdue</p>
                )}
              </div>
            );
          })}
        </div>

        <QueueComponent
          title="All Onboarding Items"
          columns={columns}
          data={mockOnboardingPipeline}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
