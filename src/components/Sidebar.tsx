"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  Settings, FileText, Activity, CreditCard, Box,
  LogOut, ShieldCheck, ChevronDown, ChevronRight,
  Sliders, Bell, Layers, Warehouse
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubItem {
  name: string
  href: string
}

interface NavGroup {
  name: string
  icon: any
  href?: string
  subItems?: SubItem[]
}

const NAV_STRUCTURE: NavGroup[] = [
  { 
    name: "Home", 
    href: "/home", 
    icon: LayoutDashboard 
  },
  {
    name: "User Management",
    icon: ShieldCheck,
    subItems: [
      { name: "Users", href: "/users" },
      { name: "Roles", href: "/users/roles" },
      { name: "Commission Agents", href: "/users/commission-agents" },
    ]
  },
  {
    name: "Contacts",
    icon: Users,
    subItems: [
      { name: "Suppliers", href: "/contacts?type=supplier" },
      { name: "Customers", href: "/contacts?type=customer" },
      { name: "Customer Groups", href: "/contacts/customer-groups" },
      { name: "Import Contacts", href: "/contacts/import" },
    ]
  },
  {
    name: "Products",
    icon: Package,
    subItems: [
      { name: "List Products", href: "/products" },
      { name: "Add Product", href: "/products/create" },
      { name: "Update Price", href: "/products/update-price" },
      { name: "Print Labels", href: "/products/labels" },
      { name: "Variations", href: "/products/variations" },
      { name: "Import Products", href: "/products/import" },
      { name: "Selling Price Group", href: "/products/selling-price-groups" },
      { name: "Units", href: "/products/units" },
      { name: "Categories", href: "/products/categories" },
      { name: "Brands", href: "/products/brands" },
      { name: "Warranties", href: "/products/warranties" },
    ]
  },
  {
    name: "Purchases",
    icon: Box,
    subItems: [
      { name: "List Purchases", href: "/purchases" },
      { name: "Add Purchase", href: "/purchases/create" },
      { name: "Purchase Return", href: "/purchases/returns" },
    ]
  },
  {
    name: "Sell",
    icon: Activity,
    subItems: [
      { name: "All Sales", href: "/sells" },
      { name: "Add Sale", href: "/sells/create" },
      { name: "POS Terminal", href: "/pos" },
      { name: "Drafts", href: "/sells/drafts" },
      { name: "Quotations", href: "/sells/quotations" },
      { name: "Sell Return", href: "/sells/returns" },
      { name: "Shipments", href: "/sells/shipments" },
      { name: "Discounts", href: "/sells/discounts" },
    ]
  },
  {
    name: "Stock Adjustment",
    icon: Sliders,
    subItems: [
      { name: "List Adjustments", href: "/stock-adjustments" },
      { name: "Add Adjustment", href: "/stock-adjustments/create" },
    ]
  },
  {
    name: "Expenses",
    icon: CreditCard,
    subItems: [
      { name: "List Expenses", href: "/expenses" },
      { name: "Add Expense", href: "/expenses/create" },
      { name: "Expense Categories", href: "/expenses/categories" },
    ]
  },
  {
    name: "Payment Accounts",
    icon: Layers,
    subItems: [
      { name: "Accounts", href: "/accounts" },
      { name: "Balance Sheet", href: "/accounts/balance-sheet" },
      { name: "Trial Balance", href: "/accounts/trial-balance" },
      { name: "Cash Flow", href: "/accounts/cash-flow" },
      { name: "Account Report", href: "/accounts/reports" },
    ]
  },
  {
    name: "Reports",
    icon: FileText,
    subItems: [
      { name: "Overview", href: "/reports" },
      { name: "Profit / Loss", href: "/reports/profit-loss" },
      { name: "Purchase & Sale", href: "/reports/purchase-sell" },
      { name: "Tax Report", href: "/reports/tax" },
      { name: "Customer & Supplier", href: "/reports/customers" },
      { name: "Stock Report", href: "/reports/stock" },
      { name: "Trending Products", href: "/reports/trending" },
      { name: "Activity Log", href: "/reports/activity" },
    ]
  },
  {
    name: "Settings",
    icon: Settings,
    subItems: [
      { name: "Business Settings", href: "/settings/business" },
      { name: "Business Locations", href: "/settings/locations" },
      { name: "Invoice Settings", href: "/settings/invoices" },
      { name: "Barcode Settings", href: "/settings/barcodes" },
      { name: "Receipt Printers", href: "/settings/printers" },
      { name: "Tax Rates", href: "/settings/taxes" },
      { name: "Subscription", href: "/settings/subscription" },
      { name: "Notifications", href: "/settings/notifications" },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Products": true,
    "Sell": true,
  })

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
    } catch {}
    document.cookie = 'pos_demo_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    router.refresh()
    router.push('/login')
  }

  // Hide sidebar on POS page for full width terminal
  if (pathname === '/pos') return null

  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0 justify-between">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <span className="font-display font-bold text-white text-lg">D</span>
          </div>
          <div>
            <span className="font-display font-bold text-base tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 block leading-tight">
              DATABYTE POS
            </span>
            <span className="text-[10px] text-surface-400 font-medium block">
              Rangpur Bike Parlour
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        {NAV_STRUCTURE.map((item) => {
          const Icon = item.icon

          // Simple link item
          if (!item.subItems) {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive 
                    ? "bg-brand-500/15 text-brand-400 border border-brand-500/20" 
                    : "text-surface-400 hover:bg-surface-800/60 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 mr-3 transition-colors shrink-0",
                  isActive ? "text-brand-400" : "text-surface-400 group-hover:text-brand-400"
                )} />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(90,103,245,0.8)]" />
                )}
              </Link>
            )
          }

          // Collapsible group
          const isGroupActive = item.subItems.some(sub => pathname.startsWith(sub.href.split('?')[0]))
          const isOpen = openGroups[item.name] ?? isGroupActive

          return (
            <div key={item.name} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(item.name)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group text-left",
                  isGroupActive
                    ? "text-white font-semibold"
                    : "text-surface-400 hover:bg-surface-800/40 hover:text-surface-200"
                )}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isGroupActive ? "text-brand-400" : "text-surface-400 group-hover:text-surface-300"
                  )} />
                  <span className="truncate">{item.name}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="pl-7 pr-1 py-0.5 space-y-0.5 border-l border-surface-800/80 ml-5">
                  {item.subItems.map((sub) => {
                    const cleanHref = sub.href.split('?')[0]
                    const isSubActive = pathname === cleanHref
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 truncate",
                          isSubActive
                            ? "bg-brand-500/20 text-brand-300 font-semibold"
                            : "text-surface-400 hover:bg-surface-800/50 hover:text-white"
                        )}
                      >
                        {sub.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 border-t border-white/5 shrink-0 bg-surface-950/40">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
        >
          <LogOut className="w-4 h-4 mr-3 text-surface-500 group-hover:text-red-400 transition-colors shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
