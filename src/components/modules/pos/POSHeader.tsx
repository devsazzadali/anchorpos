"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Bell, Clock, Maximize, Minimize, Search, Wifi, 
  WifiOff, HelpCircle, Volume2, VolumeX, Store,
  DollarSign, CheckCircle2, ChevronDown, ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { isAudioMuted, toggleAudioMuted, playClick } from "@/lib/utils/audio"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/currency"

interface POSHeaderProps {
  search?: string
  onSearchChange?: (val: string) => void
}

export default function POSHeader({ search = "", onSearchChange }: POSHeaderProps) {
  const isOnline = useOnlineStatus()
  const { toast } = useToast()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  useEffect(() => {
    setMuted(isAudioMuted())
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

  return (
    <>
      <header className="h-16 shrink-0 glass-panel rounded-2xl border border-white/10 flex items-center justify-between px-4 z-20 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative backdrop-blur-xl">
        {/* Left Side: Brand, Back to Dashboard & Online Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-900 border border-surface-700 hover:bg-surface-800 text-surface-300 hover:text-white transition-all group shadow-sm text-xs font-semibold"
            title="Return to Management Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-brand-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <div className="h-5 w-px bg-surface-800 mx-1 hidden sm:block" />

          {/* Business & Location Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
              <span className="font-display font-bold text-white text-xs">D</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">Rangpur Bike Parlour</span>
              <span className="text-[10px] text-surface-400 font-mono">BL0001 • Terminal 01</span>
            </div>
          </div>

          {/* Online Sync Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-900/80 border border-white/5 text-xs font-mono">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Online (Cloud Synced)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 font-medium">Offline (Dexie Queue)</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Live Product & SKU Barcode Search Bar */}
        <div className="flex-1 max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Scan barcode or search product by Name / SKU (Alt + S)..."
              className="w-full bg-surface-900 border-surface-700 pl-10 pr-24 h-10 focus-visible:ring-brand-500 rounded-xl text-white shadow-inner text-sm placeholder:text-surface-500"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-surface-800 border border-surface-700 px-2 py-0.5 rounded text-surface-400">
              Alt + S
            </kbd>
          </div>
        </div>

        {/* Right Side: Register, Shortcuts, Sound, Fullscreen, Cashier */}
        <div className="flex items-center gap-2">
          {/* Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-surface-300 text-xs font-mono bg-surface-900/60 px-3 py-1.5 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{currentTime || "Live"}</span>
          </div>

          {/* Cash Register Summary Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { playClick(); setIsRegisterOpen(true) }}
            className="h-9 px-2.5 rounded-xl border-surface-700 bg-surface-900 hover:bg-surface-800 text-surface-300 hover:text-white text-xs gap-1.5 font-medium"
            title="Cash Register Details"
          >
            <Store className="w-4 h-4 text-brand-400" />
            <span className="hidden md:inline">Register</span>
          </Button>

          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleAudio}
            className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-xl"
            title={muted ? "Unmute Audio" : "Mute Audio"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
          </Button>

          {/* Keyboard Shortcuts Help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { playClick(); setIsHelpOpen(true) }}
            className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-xl"
            title="Keyboard Shortcuts (F1)"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFullscreen}
            className="h-9 w-9 text-surface-400 hover:text-white hover:bg-surface-800/60 rounded-xl"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {/* Cashier Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-surface-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-xs shadow-glow">
              A
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-white block leading-tight">Admin</span>
              <span className="text-[10px] text-emerald-400 block font-mono">Active Cashier</span>
            </div>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-md bg-surface-900 border-surface-700 text-white p-5 rounded-2xl">
          <DialogHeader className="pb-2 border-b border-surface-800">
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              POS Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-3 text-xs font-mono">
            {[
              { key: "Alt + S", action: "Focus Search / Barcode Input" },
              { key: "F10", action: "Proceed to Checkout / Confirm Sale" },
              { key: "F1", action: "Open Keyboard Shortcuts Help" },
              { key: "F4", action: "Clear Terminal Cart" },
              { key: "F8", action: "Hold / Suspend Current Order" },
              { key: "ESC", action: "Close Active Modal or Dialog" },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-surface-800/60 border border-surface-700/50">
                <span className="text-surface-300 font-sans">{s.action}</span>
                <kbd className="bg-surface-900 border border-surface-700 px-2 py-1 rounded text-brand-300 font-bold">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Register Summary Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-sm bg-surface-900 border-surface-700 text-white p-5 rounded-2xl">
          <DialogHeader className="pb-2 border-b border-surface-800">
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-400" />
              Cash Register Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-800 border border-surface-700 space-y-2">
              <div className="flex justify-between text-surface-400">
                <span>Opened At:</span>
                <span className="font-mono text-white">Today 09:00 AM</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>Cashier:</span>
                <span className="font-medium text-white">Admin (Superadmin)</span>
              </div>
              <div className="flex justify-between text-surface-400">
                <span>Opening Cash Float:</span>
                <span className="font-mono text-white">৳ 10,000.00</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Total Cash Sales:</span>
                <span className="font-mono font-bold">৳ 25,160.00</span>
              </div>
              <div className="pt-2 border-t border-surface-700 flex justify-between font-bold text-sm text-white">
                <span>Expected Cash In Hand:</span>
                <span className="font-mono text-brand-400">৳ 35,160.00</span>
              </div>
            </div>
            <Button
              onClick={() => {
                playClick()
                setIsRegisterOpen(false)
                toast({ title: "Register Balanced", description: "All cash amounts verified." })
              }}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white h-10"
            >
              Verify & Keep Open
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
