import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { StatusPill } from "@/components/ops/StatusPill";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockOemOrgs, type OemOrg } from "@/data/entityMockData";

const columns: QueueColumn<OemOrg>[] = [
  { key: "org_id", header: "Org ID", sortable: true },
  { key: "company_name", header: "Company Name", sortable: true },
  { key: "primary_city", header: "City", sortable: true },
  { key: "stores", header: "Stores", sortable: true, className: "text-center" },
  { key: "entity_admin", header: "Entity Admin" },
  { key: "kyc_status", header: "KYC Status", sortable: true, render: (row) => <StatusPill status={row.kyc_status} variant="kyc" /> },
  { key: "agreement_status", header: "Agreement", sortable: true, render: (row) => <StatusPill status={row.agreement_status} variant="agreement" /> },
  { key: "entity_status", header: "Status", sortable: true, render: (row) => <StatusPill status={row.entity_status} variant="entity" /> },
  { key: "activated_on", header: "Activated On", sortable: true, render: (row) => row.activated_on || "—" },
  { key: "active_deals", header: "Active Deals", sortable: true, className: "text-center" },
  { key: "assigned_kam", header: "Assigned KAM", render: (row) => row.assigned_kam || "—" },
];

const filters: QueueFilter[] = [
  { key: "primary_city", label: "City", options: [{ label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" }, { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" }, { label: "Pune", value: "Pune" }] },
  { key: "entity_status", label: "Status", options: [{ label: "Pending", value: "pending" }, { label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }] },
  { key: "kyc_status", label: "KYC", options: [{ label: "Not Started", value: "not_started" }, { label: "Docs Received", value: "docs_received" }, { label: "Verified", value: "verified" }, { label: "Rejected", value: "rejected" }] },
];

export default function OpsOemDirectory() {
  const navigate = useNavigate();

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">OEM Directory</h1>
            <p className="text-sm text-muted-foreground">Manage OEM organizations, KYC, and agreements</p>
          </div>
          <Button onClick={() => navigate("/ops/entities/oem/new")}>
            <Plus className="h-4 w-4 mr-1" /> Register New OEM
          </Button>
        </div>

        <QueueComponent
          title="All OEM Organizations"
          columns={columns}
          data={mockOemOrgs}
          filters={filters}
          onRowClick={(row) => navigate(`/ops/entities/oem/${row.id}`)}
        />
      </div>
    </OpsLayout>
  );
}
