"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function AddExpensePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: "Expense Saved",
        description: "The expense has been recorded successfully.",
        className: "bg-brand-500 text-white border-none",
      })
      router.push('/expenses')
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record expense."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-surface-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Add Expense</h2>
            <p className="text-surface-400 text-sm">Record business operations costs</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Expense
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-surface-300">Reference No</Label>
            <Input placeholder="Leave blank to auto-generate" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Date *</Label>
            <Input type="date" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Expense Category *</Label>
            <Select>
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="rent">Shop Rent</SelectItem>
                <SelectItem value="salary">Staff Salary</SelectItem>
                <SelectItem value="utility">Utility Bill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">৳</span>
              <Input type="number" step="0.01" className="pl-8 bg-surface-900 border-surface-700 text-white" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Payment Account *</Label>
            <Select defaultValue="cash">
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Select Account" /></SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="cash">Cash Register</SelectItem>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="bkash">bKash (Merchant)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Applicable Tax</Label>
            <Select>
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="tax1">VAT (15%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-surface-800">
          <Label className="text-surface-300">Expense Note</Label>
          <textarea 
            rows={3}
            className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Details about this expense..."
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-surface-800">
          <Label className="text-surface-300">Attach Document / Receipt</Label>
          <div className="border-2 border-dashed border-surface-700 rounded-xl p-8 text-center bg-surface-900/50 hover:bg-surface-800/50 hover:border-brand-500/50 transition-colors cursor-pointer flex flex-col items-center">
            <UploadCloud className="w-8 h-8 text-surface-500 mb-2" />
            <p className="text-surface-400 text-sm">Click or drag receipt image/PDF to upload</p>
          </div>
        </div>
      </div>
    </div>
  )
}
