import Link from "next/link"
import { Search, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <div className="glass-panel p-10 rounded-2xl max-w-md w-full relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5">
          <Search className="w-64 h-64 text-brand-500" />
        </div>
        
        <div className="mx-auto flex flex-col items-center justify-center mb-6 relative">
          <h1 className="text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-300 to-brand-600">
            404
          </h1>
          <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full -z-10" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-surface-400 mb-8 text-sm leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-white">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
          <Button asChild className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            <Link href="/home">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
