"use client";
import { Home, SidebarClose, SidebarOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const items = [
  {
    title: "Página Inicial",
    url: "/",
    icon: Home,
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      {!open ? (
                        <Tooltip>
                          <TooltipTrigger className="cursor-pointer print:hidden">
                            <item.icon size={16} className="text-amber-600" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <item.icon size={16} className="text-amber-600" />
                      )}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export const CustomTrigger = () => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={toggleSidebar}
        className="cursor-pointer print:hidden"
      >
        {open ? <SidebarClose size={18} /> : <SidebarOpen size={18} />}
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Abrir/Fechar o Menu Lateral</p>
      </TooltipContent>
    </Tooltip>
  );
};
