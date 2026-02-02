import { ReactNode } from "react";
import { Check, Clock, Loader2, ChevronRight, AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceStageCardProps {
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  icon: ReactNode;
  deadline?: string;
  completedAt?: string | null;
  isUrgent?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  showUpload?: boolean;
  onUpload?: () => void;
  documents?: Array<{
    id: string;
    file_name: string;
    verification_status: string;
  }>;
  children?: ReactNode;
}

const ServiceStageCard = ({
  title,
  description,
  status,
  icon,
  deadline,
  completedAt,
  isUrgent,
  actionLabel,
  onAction,
  showUpload,
  onUpload,
  documents,
  children,
}: ServiceStageCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant={isUrgent ? "destructive" : "default"}>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className={cn(
      "transition-all",
      status === "completed" && "border-green-200 bg-green-50/50",
      isUrgent && status !== "completed" && "border-red-200 bg-red-50/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              status === "completed" && "bg-green-100 text-green-600",
              status === "in_progress" && "bg-primary/10 text-primary",
              status === "pending" && "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Deadline / Completion info */}
        {(deadline || completedAt) && (
          <div className="flex items-center gap-2 text-sm">
            {completedAt ? (
              <span className="text-green-600">
                ✓ Completed on {formatDate(completedAt)}
              </span>
            ) : deadline ? (
              <span className={cn(
                "flex items-center gap-1",
                isUrgent ? "text-red-600" : "text-muted-foreground"
              )}>
                {isUrgent && <AlertTriangle className="w-4 h-4" />}
                Deadline: {formatDate(deadline)}
              </span>
            ) : null}
          </div>
        )}

        {/* Uploaded documents */}
        {documents && documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Uploaded Documents</p>
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                <span className="truncate">{doc.file_name}</span>
                <Badge variant={
                  doc.verification_status === "verified" ? "default" :
                  doc.verification_status === "rejected" ? "destructive" : "secondary"
                } className="text-xs">
                  {doc.verification_status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Custom children */}
        {children}

        {/* Actions */}
        {(actionLabel || showUpload) && status !== "completed" && (
          <div className="flex gap-2 pt-2">
            {showUpload && (
              <Button variant="outline" size="sm" onClick={onUpload}>
                <Upload className="w-4 h-4 mr-1" />
                Upload Proof
              </Button>
            )}
            {actionLabel && (
              <Button size="sm" onClick={onAction}>
                {actionLabel}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceStageCard;
