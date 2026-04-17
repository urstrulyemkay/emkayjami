import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Input } from "@/components/ui/input";
import { StoreCard } from "@/components/oem/StoreCard";
import { STORES, GM } from "@/data/oemMockData";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const GmStores = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "attention">("all");

  const filtered = STORES.filter((s) => {
    if (filter === "attention" && s.attentionFlags === 0 && s.conversionPct >= 65) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <OemAppShell variant="GM" contextLabel="Bengaluru Region · 4 stores" userName={GM.name}>
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Stores</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stores" className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["all", "attention"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border", filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground")}
            >
              {f === "all" ? "All stores" : "Needs attention"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map((s) => <StoreCard key={s.id} store={s} onClick={() => navigate(`/gm/store/${s.id}`)} />)}
        </div>
      </div>
    </OemAppShell>
  );
};

export default GmStores;
