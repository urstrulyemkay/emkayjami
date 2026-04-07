import { useParams, useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ops/StatusPill";
import { ArrowLeft, Ban, RotateCcw, UserCog } from "lucide-react";
import { mockBrokers } from "@/data/entityMockData";

export default function OpsBrokerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const broker = mockBrokers.find((b) => b.id === id);

  if (!broker) {
    return (
      <OpsLayout>
        <div className="text-center py-12 text-muted-foreground">Broker not found</div>
      </OpsLayout>
    );
  }

  return (
    <OpsLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ops/entities/brokers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{broker.business_name}</h1>
              <span className="text-sm text-muted-foreground">({broker.entity_id})</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StatusPill status={broker.entity_status} variant="entity" />
              <span className="text-sm text-muted-foreground">KYC:</span>
              <StatusPill status={broker.kyc_status} variant="kyc" />
              <span className="text-sm text-muted-foreground">Trust:</span>
              <Badge variant="outline" className="text-xs">{broker.trust_level}</Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Entity Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Owner Name:</span><p className="font-medium">{broker.owner_name}</p></div>
              <div><span className="text-muted-foreground">Business Name:</span><p className="font-medium">{broker.business_name}</p></div>
              <div><span className="text-muted-foreground">City:</span><p className="font-medium">{broker.city}</p></div>
              <div><span className="text-muted-foreground">Mobile:</span><p className="font-medium">{broker.mobile}</p></div>
              <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{broker.email || "—"}</p></div>
              <div><span className="text-muted-foreground">GSTIN:</span><p className="font-medium font-mono">{broker.gstin || "—"}</p></div>
              <div><span className="text-muted-foreground">PAN:</span><p className="font-medium font-mono">{broker.pan || "—"}</p></div>
              <div><span className="text-muted-foreground">KAM:</span><p className="font-medium">{broker.assigned_kam || "Unassigned"}</p></div>
              <div><span className="text-muted-foreground">Registered:</span><p className="font-medium">{broker.registered_on}</p></div>
              <div><span className="text-muted-foreground">Members:</span><p className="font-medium">{broker.members}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Trust & Gamification</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm text-center">
              <div><p className="text-2xl font-bold">{broker.trust_score}</p><p className="text-muted-foreground">Trust Score</p></div>
              <div><p className="text-2xl font-bold">{broker.coins_balance}</p><p className="text-muted-foreground">Coins</p></div>
              <div><p className="text-2xl font-bold">{broker.strikes_count}</p><p className="text-muted-foreground">Active Strikes</p></div>
              <div><p className="text-2xl font-bold">{broker.trust_level}</p><p className="text-muted-foreground text-xs">Level</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Deal Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm text-center">
              <div><p className="text-2xl font-bold">{broker.active_deals}</p><p className="text-muted-foreground">Active Deals</p></div>
              <div><p className="text-2xl font-bold">{broker.lifetime_deals}</p><p className="text-muted-foreground">Lifetime Deals</p></div>
              <div><p className="text-2xl font-bold text-green-600">92%</p><p className="text-muted-foreground">Completion Rate</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {broker.entity_status === "active" && (
              <Button variant="destructive" size="sm"><Ban className="h-3 w-3 mr-1" /> Suspend Entity</Button>
            )}
            {broker.entity_status === "suspended" && (
              <Button variant="outline" size="sm"><RotateCcw className="h-3 w-3 mr-1" /> Reactivate</Button>
            )}
            <Button variant="outline" size="sm"><UserCog className="h-3 w-3 mr-1" /> Change KAM</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Audit History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3"><span className="text-muted-foreground shrink-0">{broker.registered_on}</span><span>Entity registered</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OpsLayout>
  );
}
