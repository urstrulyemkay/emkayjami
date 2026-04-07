import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: string;
  variant?: "kyc" | "agreement" | "entity" | "trust" | "generic";
}

const kycColors: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  docs_received: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const agreementColors: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  sent: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  signed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const entityColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  browse_only: "bg-muted text-muted-foreground",
};

const variantMap: Record<string, Record<string, string>> = {
  kyc: kycColors,
  agreement: agreementColors,
  entity: entityColors,
};

export function StatusPill({ status, variant = "generic" }: StatusPillProps) {
  const colors = variantMap[variant];
  const colorClass = colors?.[status] || "bg-muted text-muted-foreground";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", colorClass)}>
      {label}
    </span>
  );
}
