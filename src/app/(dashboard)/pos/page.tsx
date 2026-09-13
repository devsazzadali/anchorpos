"use client"

import { useState } from "react";
import POSCart from "@/components/modules/pos/POSCart";
import POSProducts from "@/components/modules/pos/POSProducts";
import POSHeader from "@/components/modules/pos/POSHeader";

export default function POSPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <POSHeader search={search} onSearchChange={setSearch} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Product Catalog */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 bg-surface-950/50">
          <POSProducts searchQuery={search} />
        </div>
        
        {/* Right Side - Cart/Terminal */}
        <div className="w-[420px] shrink-0 flex flex-col bg-surface-900 shadow-xl z-10 relative">
          <POSCart />
        </div>
      </div>
    </div>
  );
}

