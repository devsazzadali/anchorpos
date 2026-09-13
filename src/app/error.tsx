"use client"

import { useEffect } from "react"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="glass-panel p-10 rounded-2xl max-w-md w-full border-t-4 border-t-red-500 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5">
          <AlertTriangle className="w-64 h-64 text-red-500" />
        </div>
        
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-surface-400 mb-8 text-sm leading-relaxed">
          We encountered an unexpected error while processing your request. Please try again or return to the dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-white">
            <Link href="/home">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
