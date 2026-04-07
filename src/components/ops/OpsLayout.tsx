import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { OpsAuthProvider } from "@/contexts/OpsAuthContext";
import { OpsSidebar } from "./OpsSidebar";
import { OpsHeader } from "./OpsHeader";

interface Props {
  children: ReactNode;
}

export function OpsLayout({ children }: Props) {
  return (
    <OpsAuthProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <OpsSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <OpsHeader />
            <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </OpsAuthProvider>
  );
}
