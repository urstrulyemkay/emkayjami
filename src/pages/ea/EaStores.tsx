import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ORG, STORES, formatINR } from "@/data/oemMockData";
import { Plus, MapPin, Power } from "lucide-react";
import { toast } from "sonner";

const EaStores = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [city, setCity] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [pendingDeactivate, setPendingDeactivate] = useState<string | null>(null);

  const handleCreate = () => {
    toast.success(`${storeName} added`);
    setStoreName(""); setCity(""); setAddOpen(false);
  };

  return (
    <OemAppShell variant="EA" contextLabel={ORG.name} userName="Admin">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Stores</h1>
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetTrigger asChild><Button size="sm"><Plus className="w-4 h-4" />New Store</Button></SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader><SheetTitle>Create Store</SheetTitle></SheetHeader>
              <div className="space-y-3 mt-4">
                <div><Label>Store name</Label><Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ananda Honda — Indiranagar" /></div>
                <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" /></div>
                <Button onClick={handleCreate} disabled={!storeName || !city} className="w-full">Create Store</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-2">
          {STORES.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.address}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {s.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div><p className="text-[10px] text-muted-foreground uppercase">GMV</p><p className="text-sm font-semibold">{formatINR(s.gmv30d)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Active</p><p className="text-sm font-semibold">{s.vehiclesActive}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Conv</p><p className="text-sm font-semibold">{s.conversionPct}%</p></div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                <AlertDialog open={pendingDeactivate === s.id} onOpenChange={(o) => !o && setPendingDeactivate(null)}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={() => setPendingDeactivate(s.id)}>
                      <Power className="w-3.5 h-3.5" />Deactivate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate {s.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Type the store name to confirm. This will hide the store from all users.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={s.name} />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={confirmText !== s.name}
                        onClick={() => { toast.success(`${s.name} deactivated`); setConfirmText(""); setPendingDeactivate(null); }}
                      >
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </OemAppShell>
  );
};

export default EaStores;
