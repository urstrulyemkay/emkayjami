import { useNavigate } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ORG, ORG_KPIS, formatINR } from "@/data/oemMockData";
import { Building2, FileCheck, LogOut, Bell, Moon, Languages, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Row = ({ label, value, onClick, right }: { label: string; value?: string | React.ReactNode; onClick?: () => void; right?: React.ReactNode }) => (
  <div onClick={onClick} className={`flex items-center justify-between py-2.5 ${onClick ? "cursor-pointer" : ""}`}>
    <p className="text-sm">{label}</p>
    <div className="flex items-center gap-2">
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {right}
      {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </div>
  </div>
);

const EaProfile = () => {
  const navigate = useNavigate();
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <OemAppShell variant="EA" contextLabel={ORG.name} userName="Admin">
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">More</h1>

        {/* Profile */}
        <Card className="p-4 flex items-center gap-3">
          <Avatar className="w-14 h-14"><AvatarFallback className="bg-oem/10 text-oem text-lg">AA</AvatarFallback></Avatar>
          <div>
            <p className="font-semibold">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@anandahonda.com</p>
            <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-oem/15 text-oem font-medium">Entity Admin</span>
          </div>
        </Card>

        {/* Org details */}
        <Card className="p-4 divide-y">
          <div className="flex items-center gap-2 pb-2"><Building2 className="w-4 h-4" /><p className="text-sm font-semibold">Organization</p></div>
          <Row label="Name" value={ORG.name} />
          <Row label="Brand" value={ORG.brand} />
          <Row label="City" value={ORG.city} />
          <Row label="Founded" value={ORG.founded} />
          <Row label="GSTIN" value={ORG.gstin} />
          <Row label="PAN" value={ORG.pan} />
        </Card>

        {/* Compliance */}
        <Card className="p-4 divide-y">
          <div className="flex items-center gap-2 pb-2"><FileCheck className="w-4 h-4" /><p className="text-sm font-semibold">Legal & Compliance</p></div>
          <Row label="DriveX Agreement" right={<span className="text-xs px-2 py-0.5 bg-success/15 text-success rounded-full">Active</span>} />
          <Row label="GST Certificate" right={<span className="text-xs px-2 py-0.5 bg-success/15 text-success rounded-full">Verified</span>} />
          <Row label="PAN Verification" right={<span className="text-xs px-2 py-0.5 bg-success/15 text-success rounded-full">Verified</span>} />
        </Card>

        {/* Stats */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Platform Stats</p>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] text-muted-foreground uppercase">Lifetime GMV</p><p className="text-lg font-bold">{formatINR(ORG_KPIS.gmv30d * 6)}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Lifetime Deals</p><p className="text-lg font-bold">{ORG_KPIS.deals30d * 6}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Stores</p><p className="text-lg font-bold">{ORG.totalStores}</p></div>
            <div><p className="text-[10px] text-muted-foreground uppercase">Team size</p><p className="text-lg font-bold">{ORG.totalGm + ORG.totalSm + ORG.totalSe}</p></div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4 divide-y">
          <p className="text-sm font-semibold pb-2">App Settings</p>
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2"><Bell className="w-4 h-4" /><span className="text-sm">Notifications</span></div>
            <Switch checked={notif} onCheckedChange={setNotif} />
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2"><Moon className="w-4 h-4" /><span className="text-sm">Dark mode</span></div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
          <Row label="Language" value="English" right={<Languages className="w-4 h-4 text-muted-foreground" />} />
        </Card>

        <Button variant="outline" className="w-full text-destructive" onClick={() => { toast.success("Logged out"); navigate("/role-select"); }}>
          <LogOut className="w-4 h-4" />Sign out
        </Button>
      </div>
    </OemAppShell>
  );
};

export default EaProfile;
