import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOpsAuth } from "@/contexts/OpsAuthContext";
import { Badge } from "@/components/ui/badge";

const cities = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];

export function OpsHeader() {
  const { opsUser } = useOpsAuth();

  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-4 shrink-0">
      <SidebarTrigger className="mr-1" />

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search deals, brokers, vehicles..."
          className="pl-8 h-8 text-sm"
        />
      </div>

      <Select defaultValue="All Cities">
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>{city}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">
              {opsUser?.full_name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{opsUser?.full_name || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {opsUser?.roles?.[0]?.replace("_", " ") || "ops"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
