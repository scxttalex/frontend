"use client"

import {
  DropdownMenu,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { IconUser } from "@tabler/icons-react"

export function NavLogin() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <IconUser/>
              <div className="grid flex-1 text-center text-sm leading-tight">
                <a href="/login" className="grid flex-1">
                <span className="truncate font-medium">Log In</span>
                <span className="text-muted-foreground truncate text-xs">
                  Click me!
                </span>
                </a>
              </div>
            </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
