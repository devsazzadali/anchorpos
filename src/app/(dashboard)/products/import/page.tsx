"use client"

import { useState } from "react"
import { UploadCloud, Download, CheckCircle2, ArrowRight, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportToCsv } from "@/lib/utils/export"
import { playClick, playSuccess } from "@/lib/utils/audio"

export default function ImportProductsPage() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<number | null>(null)

  const handleDownloadTemplate = () => {
    playClick()
    const templateRows = [
      {
        "Product Name": "Motul 300V Factory Line 15W50",
        Brand: "Motul",
        Category: "Engine Oil & Lubricants",
        Unit: "Liters",
        SKU: "MOT-300V-15W50",
        "Barcode Type": "C128",
        "Purchase Price (BDT)": 1850.00,
        "Selling Price (BDT)": 2200.00,
        "Alert Quantity": 5,
        "Opening Stock Qty": 12,
      },
      {
        "Product Name": "Yamaha R15 V3 Air Filter Element",
        Brand: "Yamaha Genuine Parts",
        Category: "Spare Parts & Consumables",
        Unit: "Pieces",
        SKU: "YAM-BK6-E4450-00",
        "Barcode Type": "C128",
        "Purchase Price (BDT)": 420.00,
        "Selling Price (BDT)": 550.00,
        "Alert Quantity": 4,
        "Opening Stock Qty": 20,
      }
    ]
    exportToCsv("rangpur_bike_products_import_template.csv", templateRows)
    toast({
      title: "Template Downloaded",
      description: "Sample product template CSV saved with required Rangpur Bike Parlour headers.",
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleImport = async () => {
    if (!file) return
    playClick()
    setIsImporting(true)

    // Simulate batch parsing and database bulk insert
    await new Promise(resolve => setTimeout(resolve, 1200))

    setIsImporting(false)
    setImportSuccess(18) // Simulated parsed count
    playSuccess()
    toast({
      title: "Import Completed",
      description: `Successfully imported 18 new motorbike products into the catalog.`,
      className: "bg-surface-900 text-white border-emerald-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Import Products</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Bulk Catalog
          </span>
        </div>
        <p className="text-surface-400 mt-1">Bulk create or update catalog inventory from Excel / CSV spreadsheets</p>
      </div>

      <div className="glass-panel rounded-xl p-8 space-y-6 border border-surface-800">
        {/* Step 1: Download Sample */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-xl bg-surface-800/40 border border-surface-700/80">
          <div>
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-400" />
              Download Product CSV Template
            </h4>
            <p className="text-xs text-surface-400 mt-1 max-w-lg leading-relaxed">
              Standard pre-formatted headers: Product Name, Brand, Unit, Category, SKU, Barcode Type, Selling Price, Purchase Price, Alert Qty, Opening Stock.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="border-brand-500/40 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 whitespace-nowrap"
          >
            <Download className="w-4 h-4 mr-2" /> Download Template
          </Button>
        </div>

        {/* Step 2: Upload Zone */}
        <div className="border-2 border-dashed border-surface-700 hover:border-brand-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all bg-surface-900/40">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-400">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Choose CSV or Excel file to upload</h3>
          <p className="text-surface-400 text-xs max-w-sm mb-5">
            Supports .csv and .xlsx spreadsheets with up to 5,000 product rows per batch.
          </p>
          <input 
            type="file" 
            accept=".csv,.xlsx" 
            id="csv-prod-upload" 
            className="hidden" 
            onChange={(e) => {
              const selected = e.target.files?.[0] || null
              setFile(selected)
              setImportSuccess(null)
              if (selected) playClick()
            }} 
          />
          <label htmlFor="csv-prod-upload">
            <span className="inline-flex items-center px-6 py-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-600 text-white font-medium cursor-pointer shadow-md text-sm transition-colors">
              Browse Files
            </span>
          </label>
          {file && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready for upload: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Step 3: Success Banner if done */}
        {importSuccess !== null && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center justify-between text-sm animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Batch complete: Successfully indexed <strong>{importSuccess}</strong> new SKUs into Rangpur Bike Parlour stock records.</span>
            </div>
            <Button asChild size="sm" variant="outline" className="border-emerald-700 bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/40">
              <a href="/products">View Products</a>
            </Button>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            disabled={!file || isImporting} 
            onClick={handleImport}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow px-8 h-11"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Spreadsheet...
              </>
            ) : (
              <>
                Upload &amp; Import Products <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
