"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

import { 
  Search, Bell, Maximize, Minimize, Volume2, VolumeX,
  Calculator as CalcIcon, Plus, Sparkles, ChevronDown, 
  ShoppingCart, Package, DollarSign, Users, Settings, 
  LogOut, CheckCircle2, AlertTriangle, Truck, RefreshCw,
  X, Check, Equal, Divide, Percent
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { isAudioMuted, toggleAudioMuted, playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [isCalcOpen, setIsCalcOpen] = useState(false)
  const [calcInput, setCalcInput] = useState("0")
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [commandSearch, setCommandSearch] = useState("")
  const [unreadNotifications, setUnreadNotifications] = useState(3)

  // Sync audio state
  useEffect(() => {
    setMuted(isAudioMuted())
  }, [])

  // Live dynamic clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }))
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (pathname === "/pos") return null

  const handleToggleFullscreen = () => {
    playClick()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleToggleAudio = () => {
    const next = toggleAudioMuted()
    setMuted(next)
    if (!next) playClick()
    toast({
      title: next ? "Sound Muted" : "Sound Enabled",
      description: next ? "POS audio effects are turned off." : "POS audio effects are now active.",
      duration: 2000,
    })
  }

  // Calculator Logic
  const handleCalcPress = (val: string) => {
    playClick()
    if (val === "C") {
      setCalcInput("0")
    } else if (val === "⌫") {
      setCalcInput(prev => prev.length > 1 ? prev.slice(0, -1) : "0")
    } else if (val === "=") {
      try {
        // Safe evaluation of simple math
        const sanitized = calcInput.replace(/×/g, "*").replace(/÷/g, "/")
        if (/^[\d+\-*/. ]+$/.test(sanitized)) {
          const res = Function(`'use strict'; return (${sanitized})`)()
          setCalcInput(String(Math.round(res * 100) / 100))
        }
      } catch {
        setCalcInput("Error")
      }
    } else {
      setCalcInput(prev => prev === "0" || prev === "Error" ? val : prev + val)
    }
  }

  const handleLogout = () => {
    playClick()
    document.cookie = 'pos_demo_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    router.push('/login')
  }

  // Command Palette Items
  const COMMANDS = [
    { label: "POS Terminal (Open Terminal)", href: "/pos", icon: ShoppingCart, category: "Fast Action" },
    { label: "Add New Product", href: "/products/create", icon: Package, category: "Products" },
    { label: "All Sales Invoices", href: "/sells", icon: DollarSign, category: "Sales" },
    { label: "Stock Valuation & Alerts", href: "/reports/stock", icon: AlertTriangle, category: "Inventory" },
    { label: "Add Business Expense", href: "/expenses/create", icon: DollarSign, category: "Expenses" },
    { label: "Customer & Supplier Contacts", href: "/contacts", icon: Users, category: "Contacts" },
    { label: "Business Locations", href: "/settings/locations", icon: Settings, category: "Settings" },
    { label: "Subscription & Billing", href: "/settings/subscription", icon: Sparkles, category: "Settings" },
  ]

  const filteredCommands = COMMANDS.filter(c => 
    c.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(commandSearch.toLowerCase())
  )

  return (
    <>
      <div className="px-6 pt-6 pb-2 shrink-0 sticky top-0 z-30 pointer-events-none">
        <header className="h-16 px-6 glass-panel rounded-2xl flex items-center justify-between shadow-2xl pointer-events-auto border-white/10">
        {/* Left Side: Global Search / Command Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-900/80 border border-surface-700/80 hover:border-brand-500/50 hover:bg-surface-800/80 text-surface-400 hover:text-white transition-all text-sm group shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-surface-400 group-hover:text-brand-400 transition-colors" />
              <span>Search products, invoices, customers...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono bg-surface-800 border border-surface-700 px-2 py-0.5 rounded text-surface-400 group-hover:text-surface-200">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Center / Right: Dynamic Time & Executive Actions */}
        <div className="flex items-center gap-3">
          {/* Live Dynamic Clock with Bangladesh Time */}
          <div className="hidden xl:flex items-center gap-2 bg-surface-900/60 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-surface-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">{currentTime}</span>
            <span className="text-surface-500">• {currentDate}</span>
          </div>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white gap-1.5 shadow-glow rounded-lg h-9 px-3">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Quick Action</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-surface-900 border-surface-700 text-surface-200">
              <DropdownMenuLabel className="text-xs uppercase text-surface-400">Create New</DropdownMenuLabel>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800 focus:bg-surface-800">
                <Link href="/pos" className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-400" />
                  <span>Open POS Terminal</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800 focus:bg-surface-800">
                <Link href="/products/create" className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Add Product</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800 focus:bg-surface-800">
                <Link href="/purchases/create" className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Add Purchase</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800 focus:bg-surface-800">
                <Link href="/expenses/create" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Add Expense</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800 focus:bg-surface-800">
                <Link href="/contacts" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Add Contact</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Calculator Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { playClick(); setIsCalcOpen(true) }}
            className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-lg"
            title="Open Calculator"
          >
            <CalcIcon className="w-4 h-4" />
          </Button>

          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleAudio}
            className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-lg"
            title={muted ? "Unmute Audio" : "Mute Audio"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFullscreen}
            className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-lg"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-lg relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-surface-900 border-surface-700 text-surface-200 p-0 shadow-2xl">
              <div className="p-3.5 border-b border-surface-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300">
                    {unreadNotifications} new
                  </span>
                </div>
                <button
                  onClick={() => setUnreadNotifications(0)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-surface-800/60 max-h-72 overflow-y-auto text-xs">
                <div className="p-3 hover:bg-surface-800/40 transition-colors flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Stock Expiry Warning</p>
                    <p className="text-surface-400 mt-0.5">Engine Oil 1L (BAT-7100-26) expires in 78 days.</p>
                    <span className="text-[10px] text-surface-500 mt-1 block">10 mins ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-surface-800/40 transition-colors flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Pending Shipment</p>
                    <p className="text-surface-400 mt-0.5">Order INV-2026-0002 packed for RANGPUR delivery.</p>
                    <span className="text-[10px] text-surface-500 mt-1 block">1 hour ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-surface-800/40 transition-colors flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Dexie Offline Sync</p>
                    <p className="text-surface-400 mt-0.5">All local sales synced with Supabase cloud.</p>
                    <span className="text-[10px] text-surface-500 mt-1 block">3 hours ago</span>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile & Branch Selector */}
          <div className="pl-2 border-l border-surface-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-800/60 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-glow">
                    A
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="text-xs font-bold text-white block leading-tight">Admin</span>
                    <span className="text-[10px] text-brand-400 block font-mono">Superadmin</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-surface-400 group-hover:text-white transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-surface-900 border-surface-700 text-surface-200">
                <div className="p-2 border-b border-surface-800">
                  <p className="text-xs font-bold text-white">Rangpur Bike Parlour</p>
                  <p className="text-[11px] text-surface-400 font-mono">Location ID: BL0001</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    Online • Full Access
                  </span>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800">
                  <Link href="/settings/business" className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-surface-400" />
                    <span>Business Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface-800">
                  <Link href="/settings/locations" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-surface-400" />
                    <span>Manage Locations</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-surface-800" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      </div>

      {/* Command Palette Dialog */}
      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="max-w-xl bg-surface-900 border-surface-700 text-white p-0 overflow-hidden shadow-2xl">
          <div className="p-3 border-b border-surface-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-brand-400 shrink-0" />
            <Input
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              placeholder="Search actions, modules, or jump to page..."
              className="bg-transparent border-0 focus-visible:ring-0 text-white text-base h-10 px-0 shadow-none placeholder:text-surface-500"
              autoFocus
            />
            <kbd className="text-[10px] font-mono bg-surface-800 border border-surface-700 px-2 py-1 rounded text-surface-400">
              ESC
            </kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <p className="text-center py-8 text-surface-500 text-sm">No matching actions or pages found.</p>
            ) : (
              filteredCommands.map((cmd) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.label}
                    onClick={() => {
                      setIsCommandOpen(false)
                      router.push(cmd.href)
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-800/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface-800 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-surface-200 group-hover:text-white">
                        {cmd.label}
                      </span>
                    </div>
                    <span className="text-xs text-surface-500 font-mono">{cmd.category}</span>
                  </button>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Quick Calculator Modal */}
      <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
        <DialogContent className="max-w-xs bg-surface-950 border-surface-700 text-white p-4 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-2 border-b border-surface-800">
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <CalcIcon className="w-4 h-4 text-brand-400" />
              Cashier Calculator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {/* Display screen */}
            <div className="bg-surface-900 p-3 rounded-xl border border-surface-800 text-right overflow-x-auto">
              <span className="font-mono text-2xl font-bold text-brand-400 tracking-wider">
                {calcInput}
              </span>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              {["C", "⌫", "%", "÷"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcPress(btn)}
                  className="h-11 rounded-xl bg-surface-800 hover:bg-surface-700 text-brand-400 transition-colors"
                >
                  {btn}
                </button>
              ))}
              {["7", "8", "9", "×"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcPress(btn)}
                  className={`h-11 rounded-xl transition-colors ${
                    btn === "×" ? "bg-surface-800 hover:bg-surface-700 text-brand-400" : "bg-surface-900 hover:bg-surface-800 text-white"
                  }`}
                >
                  {btn}
                </button>
              ))}
              {["4", "5", "6", "-"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcPress(btn)}
                  className={`h-11 rounded-xl transition-colors ${
                    btn === "-" ? "bg-surface-800 hover:bg-surface-700 text-brand-400" : "bg-surface-900 hover:bg-surface-800 text-white"
                  }`}
                >
                  {btn}
                </button>
              ))}
              {["1", "2", "3", "+"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcPress(btn)}
                  className={`h-11 rounded-xl transition-colors ${
                    btn === "+" ? "bg-surface-800 hover:bg-surface-700 text-brand-400" : "bg-surface-900 hover:bg-surface-800 text-white"
                  }`}
                >
                  {btn}
                </button>
              ))}
              {["0", "00", ".", "="].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcPress(btn)}
                  className={`h-11 rounded-xl transition-colors ${
                    btn === "=" ? "bg-brand-600 hover:bg-brand-500 text-white shadow-glow" : "bg-surface-900 hover:bg-surface-800 text-white"
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
