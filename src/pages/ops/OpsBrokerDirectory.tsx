import { useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { StatusPill } from "@/components/ops/StatusPill";
import { mockBrokers, type BrokerDirectoryItem } from "@/data/entityMockData";

const columns: QueueColumn<BrokerDirectoryItem>[] = [
  { key: "entity_id", header: "Entity ID", sortable: true },
  { key: "business_name", header: "Business Name", sortable: true },
  { key: "owner_name", header: "Owner Name", sortable: true },
  { key: "city", header: "City", sortable: true },
  { key: "kyc_status", header: "KYC", sortable: true, render: (row) => <StatusPill status={row.kyc_status} variant="kyc" /> },
  { key: "agreement_status", header: "Agreement", sortable: true, render: (row) => <StatusPill status={row.agreement_status} variant="agreement" /> },
  { key: "entity_status", header: "Status", sortable: true, render: (row) => <StatusPill status={row.entity_status} variant="entity" /> },
  { key: "trust_level", header: "Trust Level", render: (row) => <span className="text-xs font-medium">{row.trust_level}</span> },
  { key: "members", header: "Members", sortable: true, className: "text-center" },
  { key: "active_deals", header: "Active Deals", sortable: true, className: "text-center" },
  { key: "lifetime_deals", header: "Lifetime", sortable: true, className: "text-center" },
  { key: "registered_on", header: "Registered On", sortable: true },
  { key: "assigned_kam", header: "KAM", render: (row) => row.assigned_kam || "—" },
];

const filters: QueueFilter[] = [
  { key: "city", label: "City", options: [{ label: "Mumbai", value: "Mumbai" }, { label: "Bangalore", value: "Bangalore" }, { label: "Chennai", value: "Chennai" }, { label: "Hyderabad", value: "Hyderabad" }, { label: "Pune", value: "Pune" }] },
  { key: "entity_status", label: "Status", options: [{ label: "Active", value: "active" }, { label: "Browse Only", value: "browse_only" }, { label: "Suspended", value: "suspended" }] },
  { key: "kyc_status", label: "KYC", options: [{ label: "Verified", value: "verified" }, { label: "In Progress", value: "in_progress" }, { label: "Rejected", value: "rejected" }] },
];

export default function OpsBrokerDirectory() {
  const navigate = useNavigate();

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Broker Directory</h1>
          <p className="text-sm text-muted-foreground">Manage broker entities, KYC status, trust levels, and compliance</p>
        </div>

        <QueueComponent
          title="All Broker Entities"
          columns={columns}
          data={mockBrokers}
          filters={filters}
          onRowClick={(row) => navigate(`/ops/entities/brokers/${row.id}`)}
        />
      </div>
    </OpsLayout>
  );
}
