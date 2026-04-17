import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SEPerformanceRow } from "@/components/oem/SEPerformanceRow";
import { sesByStore, STORES, SMS } from "@/data/oemMockData";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const STORE_ID = "s-jp";

const SmTeam = () => {
  const navigate = useNavigate();
  const store = STORES.find((s) => s.id === STORE_ID)!;
  const sm = SMS.find((s) => s.storeId === STORE_ID)!;
  const ses = sesByStore(STORE_ID);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    toast.success(`SE invitation sent to ${name}`);
    setName(""); setPhone(""); setAddOpen(false);
  };

  return (
    <OemAppShell variant="SM" contextLabel={store.name} userName={sm.name}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Team</h1>
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetTrigger asChild><Button size="sm"><Plus className="w-4 h-4" />Add SE</Button></SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader><SheetTitle>Add Sales Executive</SheetTitle></SheetHeader>
              <div className="space-y-3 mt-4">
                <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rohan Patel" /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" /></div>
                <Button onClick={handleAdd} disabled={!name || !phone} className="w-full">Send Invite</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card className="p-3 flex items-center gap-3">
          <div className="text-center flex-1">
            <p className="text-xl font-bold">{ses.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total SEs</p>
          </div>
          <div className="text-center flex-1 border-x">
            <p className="text-xl font-bold">{ses.filter((s) => s.active).length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Active</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold">{Math.round(ses.reduce((s, x) => s + x.conversionPct, 0) / ses.length)}%</p>
            <p className="text-[10px] text-muted-foreground uppercase">Avg Conv</p>
          </div>
        </Card>

        <div className="space-y-2">
          {ses.map((se) => <SEPerformanceRow key={se.id} se={se} onClick={() => navigate(`/sm/team/${se.id}`)} />)}
        </div>
      </div>
    </OemAppShell>
  );
};

export default SmTeam;
