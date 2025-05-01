"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Users, Bell, Settings, LogOut, Menu } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "POS",
      icon: ShoppingCart,
      href: "/dashboard/pos",
      active: pathname === "/dashboard/pos",
    },
    {
      label: "Products",
      icon: Package,
      href: "/dashboard/products",
      active: pathname.includes("/dashboard/products"),
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
      active: pathname.includes("/dashboard/reports"),
    },
    {
      label: "Customers",
      icon: Users,
      href: "/dashboard/customers",
      active: pathname.includes("/dashboard/customers"),
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname.includes("/dashboard/notifications"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname.includes("/dashboard/settings"),
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <MobileSidebar routes={routes} onLogout={logout} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("hidden lg:flex h-screen border-r flex-col", className)}>
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            Smart POS+
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </>
  )
}

interface MobileSidebarProps {
  routes: {
    label: string
    icon: React.ElementType
    href: string
    active: boolean
  }[]
  onLogout: () => void
  onNavigate: () => void
}

function MobileSidebar({ routes, onLogout, onNavigate }: MobileSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl" onClick={onNavigate}>
          Smart POS+
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
