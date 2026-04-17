import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { GM, SMS, SES, STORES, formatINR, getStore } from "@/data/oemMockData";
import { SEPerformanceRow } from "@/components/oem/SEPerformanceRow";
import { Phone, Mail } from "lucide-react";

const GmTeam = () => {
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const filteredSms = storeFilter === "all" ? SMS : SMS.filter((s) => s.storeId === storeFilter);
  const filteredSes = storeFilter === "all" ? SES : SES.filter((s) => s.storeId === storeFilter);

  return (
    <OemAppShell variant="GM" contextLabel="Bengaluru Region · 4 stores" userName={GM.name}>
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Team</h1>

        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            {STORES.map((s) => <SelectItem key={s.id} value={s.id}>{s.name.replace("Ananda Honda — ", "")}</SelectItem>)}
          </SelectContent>
        </Select>

        <Tabs defaultValue="sm">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="sm">Sales Managers ({filteredSms.length})</TabsTrigger>
            <TabsTrigger value="se">Sales Execs ({filteredSes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="sm" className="space-y-2 mt-3">
            {filteredSms.map((sm) => {
              const st = getStore(sm.storeId);
              return (
                <Card key={sm.id} className="p-3 flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">{sm.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sm.name}</p>
                    <p className="text-xs text-muted-foreground">{st?.name.replace("Ananda Honda — ", "")}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{sm.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatINR(st?.gmv30d ?? 0)}</p>
                    <p className="text-[10px] text-muted-foreground">{st?.conversionPct}% conv</p>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
          <TabsContent value="se" className="space-y-2 mt-3">
            {filteredSes.map((se) => <SEPerformanceRow key={se.id} se={se} />)}
          </TabsContent>
        </Tabs>
      </div>
    </OemAppShell>
  );
};

export default GmTeam;
