"use client"

import { useState } from "react";
import POSCart from "@/components/modules/pos/POSCart";
import POSProducts from "@/components/modules/pos/POSProducts";
import POSHeader from "@/components/modules/pos/POSHeader";

export default function POSPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black relative selection:bg-brand-500/30">
      
      {/* Deep Aurora Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/10 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Floating Header */}
      <div className="relative z-20 px-4 pt-4 pb-2">
        <POSHeader search={search} onSearchChange={setSearch} />
      </div>
      
      {/* Main Terminal Shell */}
      <div className="flex flex-1 overflow-hidden relative z-10 px-4 pb-4 gap-4">
        {/* Left Side - Product Catalog (Bento Grid) */}
        <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-3xl overflow-hidden border border-white/5">
          <POSProducts searchQuery={search} />
        </div>
        
        {/* Right Side - Cart/Terminal */}
        <div className="w-[440px] shrink-0 flex flex-col glass-luxury rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
          <POSCart />
        </div>
      </div>
    </div>
  );
}

