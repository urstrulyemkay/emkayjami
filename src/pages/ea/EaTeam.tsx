import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ORG, GM, SMS, SES, getStore, formatINR } from "@/data/oemMockData";
import { SEPerformanceRow } from "@/components/oem/SEPerformanceRow";
import { Plus, Phone } from "lucide-react";
import { toast } from "sonner";

const EaTeam = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreate = () => {
    toast.success(`GM ${name} invited`);
    setName(""); setPhone(""); setOpen(false);
  };

  return (
    <OemAppShell variant="EA" contextLabel={ORG.name} userName="Admin">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Team</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="sm"><Plus className="w-4 h-4" />Add GM</Button></SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader><SheetTitle>Add General Manager</SheetTitle></SheetHeader>
              <div className="space-y-3 mt-4">
                <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <Button onClick={handleCreate} disabled={!name || !phone} className="w-full">Send Invite</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs defaultValue="gm">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="gm">GMs (1)</TabsTrigger>
            <TabsTrigger value="sm">SMs ({SMS.length})</TabsTrigger>
            <TabsTrigger value="se">SEs ({SES.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="gm" className="space-y-2 mt-3">
            <Card className="p-3 flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-oem/10 text-oem">{GM.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{GM.name}</p>
                <p className="text-xs text-muted-foreground">{GM.storeIds.length} stores · {GM.email}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{GM.phone}</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sm" className="space-y-2 mt-3">
            {SMS.map((sm) => {
              const st = getStore(sm.storeId);
              return (
                <Card key={sm.id} className="p-3 flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">{sm.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sm.name}</p>
                    <p className="text-xs text-muted-foreground">{st?.name.replace("Ananda Honda — ", "")}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatINR(st?.gmv30d ?? 0)}</p>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="se" className="space-y-2 mt-3">
            {SES.map((se) => <SEPerformanceRow key={se.id} se={se} />)}
          </TabsContent>
        </Tabs>
      </div>
    </OemAppShell>
  );
};

export default EaTeam;
