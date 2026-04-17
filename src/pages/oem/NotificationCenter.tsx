import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Info, CheckCircle2, Bell } from "lucide-react";
import { NOTIFICATIONS } from "@/data/oemMockData";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const iconFor = (t: string) => {
  if (t === "alert" || t === "warning") return AlertTriangle;
  if (t === "success") return CheckCircle2;
  return Info;
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-10">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-semibold flex-1">Notifications</h1>
        </div>
      </header>

      <div className="p-4 space-y-2">
        {NOTIFICATIONS.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Bell className="w-8 h-8 mb-2" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
        {NOTIFICATIONS.map((n) => {
          const Icon = iconFor(n.type);
          const tone =
            n.type === "alert"
              ? "text-destructive"
              : n.type === "warning"
                ? "text-warning"
                : n.type === "success"
                  ? "text-success"
                  : "text-info";
          return (
            <Card
              key={n.id}
              onClick={() => n.link && navigate(n.link)}
              className={cn("p-3 flex items-start gap-3 cursor-pointer hover:bg-muted/40", !n.read && "border-primary/30")}
            >
              <div className={cn("w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0", tone)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationCenter;
