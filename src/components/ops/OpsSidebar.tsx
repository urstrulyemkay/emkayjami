import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { opsNavigation, type OpsRole } from "@/data/opsNavigation";
import { useOpsAuth } from "@/contexts/OpsAuthContext";
import { cn } from "@/lib/utils";

export function OpsSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { hasAnyRole } = useOpsAuth();

  const isActive = (path: string) => location.pathname === path;
  const isChildActive = (children?: { url: string }[]) =>
    children?.some((c) => location.pathname.startsWith(c.url)) ?? false;

  const visibleNav = opsNavigation.filter((item) => {
    if (item.roles === "all") return true;
    return hasAnyRole(item.roles);
  });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">DX</span>
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">DriveX Ops</p>
                  <p className="text-[10px] text-muted-foreground">Operations Center</p>
                </div>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNav.map((item) => {
                if (!item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isChildActive(item.children)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full hover:bg-muted/50">
                          <item.icon className="h-4 w-4 mr-2" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children
                              .filter((child) => {
                                if (child.roles === "all") return true;
                                return hasAnyRole(child.roles as OpsRole[]);
                              })
                              .map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={child.url}
                                      end
                                      className="hover:bg-muted/50"
                                      activeClassName="bg-muted text-primary font-medium"
                                    >
                                      <span>{child.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
