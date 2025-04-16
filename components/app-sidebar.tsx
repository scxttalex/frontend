// Modified From ShadCN

"use client"

import * as React from "react"
import {
  IconBook2,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconReport,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { NavLogin } from "./login"
import { useUser } from "./UserContext"

const data = {

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "My Bookings",
      url: "/bookings",
      icon: IconBook2,
    }
  ],
  documents: [
    {
      name: "User Management",
      url: "/admin/users",
      icon: IconDatabase,
    },
    {
      name: "Booking Management",
      url: "/admin/bookings",
      icon: IconReport,
    },
    {
      name: "Area Management",
      url: "/admin/areas",
      icon: IconFileWord,
    },
    {
      name: "Addon Management",
      url: "/admin/addons",
      icon: IconFileWord,
    },
    {
      name: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
 
  const { user } = useUser();
  const isUserSignedIn = Boolean(user); // Check if user is signed in
  const isAdmin = user?.permissions.includes("admin");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="">

                <Image
                src='/quins.png'
                alt='Company logo'
                height={30}
                width={30}
                />

                <span className="text-base font-semibold">Harlequins</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {isAdmin && (
          <NavDocuments items={data.documents} />
          
        )}

      </SidebarContent>
      
      <SidebarFooter>
      {isUserSignedIn ? <NavUser user={user} /> : <NavLogin />}
      </SidebarFooter>
    </Sidebar>
  )
}
