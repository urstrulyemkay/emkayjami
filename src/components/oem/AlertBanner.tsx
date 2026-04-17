import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  type?: "alert" | "info" | "success" | "warning";
  title: string;
  body?: string;
  onDismiss?: () => void;
  onClick?: () => void;
}

const tones = {
  alert: { bg: "bg-destructive/10 border-destructive/30 text-destructive", icon: AlertTriangle },
  warning: { bg: "bg-warning/10 border-warning/30 text-warning-foreground", icon: AlertTriangle },
  info: { bg: "bg-info/10 border-info/30 text-info", icon: Info },
  success: { bg: "bg-success/10 border-success/30 text-success", icon: CheckCircle2 },
};

export const AlertBanner = ({ type = "info", title, body, onDismiss, onClick }: Props) => {
  const { bg, icon: Icon } = tones[type];
  return (
    <div onClick={onClick} className={cn("flex items-start gap-3 p-3 rounded-xl border", bg, onClick && "cursor-pointer")}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {body && <p className="text-xs text-muted-foreground mt-0.5">{body}</p>}
      </div>
      {onDismiss && (
        <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
