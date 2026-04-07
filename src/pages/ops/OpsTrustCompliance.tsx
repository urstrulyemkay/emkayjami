import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { mockTrustRecords, type TrustRecord } from "@/data/trustDisputesMockData";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle } from "lucide-react";

const complianceColors: Record<string, string> = {
  compliant: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  non_compliant: "bg-red-100 text-red-800",
};

const entityTypeColors: Record<string, string> = {
  broker: "bg-blue-100 text-blue-800",
  oem: "bg-purple-100 text-purple-800",
  runner: "bg-teal-100 text-teal-800",
};

const columns: QueueColumn<TrustRecord>[] = [
  { key: "entity_id", header: "ID", sortable: true },
  { key: "entity_name", header: "Name", sortable: true },
  {
    key: "entity_type", header: "Type", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", entityTypeColors[row.entity_type])}>
        {row.entity_type}
      </span>
    ),
  },
  { key: "city", header: "City", sortable: true },
  {
    key: "trust_score", header: "Trust Score", sortable: true,
    render: (row) => {
      const color = row.trust_score >= 80 ? "text-green-600" : row.trust_score >= 60 ? "text-yellow-600" : "text-red-600";
      return <span className={cn("font-bold", color)}>{row.trust_score}</span>;
    },
  },
  { key: "level", header: "Level", sortable: true, render: (row) => <span className="font-semibold">L{row.level}</span> },
  {
    key: "strikes_active", header: "Active Strikes", sortable: true, className: "text-center",
    render: (row) => <span className={row.strikes_active > 0 ? "text-red-600 font-bold" : "text-muted-foreground"}>{row.strikes_active}</span>,
  },
  { key: "strikes_total", header: "Total Strikes", className: "text-center" },
  {
    key: "compliance_status", header: "Compliance", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", complianceColors[row.compliance_status])}>
        {row.compliance_status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "audit_flags", header: "Flags", sortable: true, className: "text-center",
    render: (row) => row.audit_flags > 0 ? <span className="text-red-600 font-semibold">{row.audit_flags}</span> : <span className="text-muted-foreground">0</span>,
  },
  { key: "last_audit", header: "Last Audit", sortable: true },
];

const filters: QueueFilter[] = [
  { key: "entity_type", label: "Type", options: [
    { label: "Broker", value: "broker" }, { label: "OEM", value: "oem" }, { label: "Runner", value: "runner" },
  ]},
  { key: "compliance_status", label: "Compliance", options: [
    { label: "Compliant", value: "compliant" }, { label: "Warning", value: "warning" }, { label: "Non-Compliant", value: "non_compliant" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
];

export default function OpsTrustCompliance() {
  const nonCompliant = mockTrustRecords.filter(r => r.compliance_status === "non_compliant").length;
  const totalFlags = mockTrustRecords.reduce((s, r) => s + r.audit_flags, 0);

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Trust & Compliance</h1>
          <p className="text-sm text-muted-foreground">Monitor trust scores, strikes, compliance, and audit flags across all entities</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total Entities", count: mockTrustRecords.length },
            { label: "Compliant", count: mockTrustRecords.filter(r => r.compliance_status === "compliant").length },
            { label: "Warning", count: mockTrustRecords.filter(r => r.compliance_status === "warning").length, highlight: true },
            { label: "Non-Compliant", count: nonCompliant, highlight: nonCompliant > 0 },
            { label: "Audit Flags", count: totalFlags, highlight: totalFlags > 0 },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-lg border bg-card px-3 py-2 text-center min-w-[100px]", s.highlight && s.count > 0 && "border-destructive")}>
              <p className={cn("text-lg font-bold", s.highlight && s.count > 0 && "text-destructive")}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <QueueComponent
          title="Entity Trust Dashboard"
          description={`${mockTrustRecords.length} entities monitored`}
          columns={columns}
          data={mockTrustRecords}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
