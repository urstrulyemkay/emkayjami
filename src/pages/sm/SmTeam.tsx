import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEPerformanceRow } from "@/components/oem/SEPerformanceRow";
import { sesByStore, STORES, SMS, formatINR, vehiclesByStore } from "@/data/oemMockData";
import type { SalesExecutive } from "@/data/oemTypes";
import { Plus, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

const STORE_ID = "s-jp";

const SmTeam = () => {
  const store = STORES.find((s) => s.id === STORE_ID)!;
  const sm = SMS.find((s) => s.storeId === STORE_ID)!;
  const ses = sesByStore(STORE_ID);
  const [selected, setSelected] = useState<SalesExecutive | null>(null);
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
          {ses.map((se) => <SEPerformanceRow key={se.id} se={se} onClick={() => setSelected(se)} />)}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{selected.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <SheetTitle>{selected.name}</SheetTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />Joined {new Date(selected.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Card className="p-3 text-center"><p className="text-xl font-bold">{selected.vehiclesActive}</p><p className="text-[10px] text-muted-foreground uppercase">Active</p></Card>
                <Card className="p-3 text-center"><p className="text-xl font-bold">{selected.vehiclesClosed30d}</p><p className="text-[10px] text-muted-foreground uppercase">Closed 30d</p></Card>
                <Card className="p-3 text-center"><p className="text-xl font-bold">{selected.conversionPct}%</p><p className="text-[10px] text-muted-foreground uppercase">Conversion</p></Card>
              </div>
              <Card className="p-3 mt-3">
                <p className="text-[10px] text-muted-foreground uppercase">GMV (30 days)</p>
                <p className="text-2xl font-bold">{formatINR(selected.gmv30d)}</p>
              </Card>
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Active Vehicles</p>
                <div className="space-y-2">
                  {vehiclesByStore(STORE_ID).filter((v) => v.seId === selected.id).slice(0, 5).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div><p className="text-sm font-medium">{v.model}</p><p className="text-xs text-muted-foreground">{v.reg}</p></div>
                      <span className="text-[10px] uppercase text-muted-foreground">{v.stage}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4"><Phone className="w-4 h-4" />Call {selected.name.split(" ")[0]}</Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </OemAppShell>
  );
};

export default SmTeam;
