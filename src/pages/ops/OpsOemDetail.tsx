import { useParams, useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ops/StatusPill";
import { ArrowLeft, Edit, Ban, RotateCcw, UserCog } from "lucide-react";
import { mockOemOrgs } from "@/data/entityMockData";
import { Separator } from "@/components/ui/separator";

export default function OpsOemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const oem = mockOemOrgs.find((o) => o.id === id);

  if (!oem) {
    return (
      <OpsLayout>
        <div className="text-center py-12 text-muted-foreground">OEM not found</div>
      </OpsLayout>
    );
  }

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ops/entities/oem")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{oem.trade_name || oem.company_name}</h1>
              <span className="text-sm text-muted-foreground">({oem.org_id})</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StatusPill status={oem.entity_status} variant="entity" />
              <span className="text-sm text-muted-foreground">KYC:</span>
              <StatusPill status={oem.kyc_status} variant="kyc" />
              <span className="text-sm text-muted-foreground">Agreement:</span>
              <StatusPill status={oem.agreement_status} variant="agreement" />
            </div>
          </div>
        </div>

        {/* Company Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Company Information</CardTitle>
              <Button variant="outline" size="sm"><Edit className="h-3 w-3 mr-1" /> Edit</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Company Name:</span><p className="font-medium">{oem.company_name}</p></div>
              <div><span className="text-muted-foreground">Trade Name:</span><p className="font-medium">{oem.trade_name || "—"}</p></div>
              <div><span className="text-muted-foreground">GST:</span><p className="font-medium font-mono">{oem.gst_number}</p></div>
              <div><span className="text-muted-foreground">PAN:</span><p className="font-medium font-mono">{oem.pan_number}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground">Address:</span><p className="font-medium">{oem.registered_address}</p></div>
              <div><span className="text-muted-foreground">Primary City:</span><p className="font-medium">{oem.primary_city}</p></div>
              <div><span className="text-muted-foreground">Brands:</span><div className="flex gap-1 mt-0.5">{oem.brands.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div></div>
              <div><span className="text-muted-foreground">Volume:</span><p className="font-medium">{oem.estimated_monthly_volume} vehicles/month</p></div>
              <div><span className="text-muted-foreground">Assigned KAM:</span><p className="font-medium">{oem.assigned_kam || "Unassigned"}</p></div>
              <div><span className="text-muted-foreground">Registered:</span><p className="font-medium">{oem.created_at}</p></div>
              <div><span className="text-muted-foreground">Activated:</span><p className="font-medium">{oem.activated_on || "Not yet"}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Signatory */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Authorized Signatory</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span><p className="font-medium">{oem.signatory_name}</p></div>
              <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{oem.signatory_phone}</p></div>
              <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{oem.signatory_email}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Summary */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Deal Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm text-center">
              <div><p className="text-2xl font-bold">{oem.active_deals}</p><p className="text-muted-foreground">Active Deals</p></div>
              <div><p className="text-2xl font-bold">{oem.stores}</p><p className="text-muted-foreground">Stores</p></div>
              <div><p className="text-2xl font-bold">23</p><p className="text-muted-foreground">Completed (30d)</p></div>
              <div><p className="text-2xl font-bold text-green-600">94.2%</p><p className="text-muted-foreground">Price Realization</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {oem.notes && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{oem.notes}</p></CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {oem.entity_status === "active" && (
              <Button variant="destructive" size="sm"><Ban className="h-3 w-3 mr-1" /> Suspend Entity</Button>
            )}
            {oem.entity_status === "suspended" && (
              <Button variant="outline" size="sm"><RotateCcw className="h-3 w-3 mr-1" /> Reactivate Entity</Button>
            )}
            <Button variant="outline" size="sm"><UserCog className="h-3 w-3 mr-1" /> Change KAM Assignment</Button>
          </CardContent>
        </Card>

        {/* Audit History */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Audit History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {oem.activated_on && <div className="flex gap-3"><span className="text-muted-foreground shrink-0">{oem.activated_on}</span><span>Entity activated</span></div>}
              <div className="flex gap-3"><span className="text-muted-foreground shrink-0">{oem.created_at}</span><span>Entity registered</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OpsLayout>
  );
}
