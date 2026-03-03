"use client"


import { Calendar, Home, Inbox, Search, Settings, ChevronDown, ChevronUp, User2 } from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

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
  SidebarFooter,
} from "@/components/ui/sidebar"

import { useAuth } from '@/contexts/auth-context';
import { usePathname } from "next/navigation"
import Link from "next/link"
// Menu items with sub-items
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Products Management",
    url: "/admin-products",
    icon: Inbox,
    sub: [
      { title: "Assets", url: "/admin-products/product-assets" },
      { title: "Products", url: "/admin-products/product-lists" },
    ]
  },
  {
    title: "Orders Management",
    url: "/admin-orders",
    icon: Calendar,
  },
  // {
  //   title: "Settings",
  //   url: "#",
  //   icon: Settings,
  //   sub: [
  //     { title: "Account", url: "#" },
  //     { title: "Preferences", url: "#" },
  //   ]
  // },
]



export function AppSidebar() {
  const pathname = usePathname()
  const { logoutAdmin } = useAuth();
  const isActive = (url: string) => {
    if (!url || url === "#") return false
    return pathname.startsWith(url)
  }
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SNOWCRAFT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <div key={item.title}>
                  {item.sub ? (
                    <Collapsible
                      defaultOpen={item.sub.some(sub => isActive(sub.url))} // 子菜单高亮则展开
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <CollapsibleTrigger
                            className={`flex items-center justify-between w-full px-2 py-2 rounded }`}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" size={16} />
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.sub.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  href={subItem.url}
                                  className={`block w-full px-2 py-1 rounded} ${isActive(subItem.url) ? 'bg-blue-100 text-blue-600' : ''}`}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center gap-2 px-2 py-2 rounded ${isActive(item.url) ? 'bg-blue-100' : ''}`}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 flex items-center ">
                  <User2 /> Admin
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={logoutAdmin}>
                  <span className="cursor-pointer text-red-400">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}