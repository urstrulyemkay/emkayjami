import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
      {icon ?? <Inbox className="w-6 h-6" />}
    </div>
    <p className="font-semibold">{title}</p>
    {body && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{body}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
