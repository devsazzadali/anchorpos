"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function AddUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: "User Created",
        description: "The user has been added to the system.",
        className: "bg-brand-500 text-white border-none",
      })
      router.push('/users')
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user."
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
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Add User</h2>
            <p className="text-surface-400 text-sm">Create a new system user account</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save User
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-surface-300">First Name *</Label>
            <Input placeholder="e.g. Sazzad" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Last Name</Label>
            <Input placeholder="e.g. Ali" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Email Address *</Label>
            <Input type="email" placeholder="email@example.com" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Password *</Label>
            <Input type="password" placeholder="••••••••" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Role *</Label>
            <Select defaultValue="cashier">
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Assigned Branch Location *</Label>
            <Select defaultValue="bl0001">
              <SelectTrigger className="bg-surface-900 border-surface-700 text-white"><SelectValue placeholder="Select Location" /></SelectTrigger>
              <SelectContent className="bg-surface-800 border-surface-700 text-white">
                <SelectItem value="bl0001">RANGPUR BIKE PARLOUR (BL0001 - Station Road)</SelectItem>
                <SelectItem value="all">All Accessible Branches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-800">
          <div className="space-y-2">
            <Label className="text-surface-300">Max Discount Allowed (%)</Label>
            <Input type="number" placeholder="e.g. 10" className="bg-surface-900 border-surface-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-surface-300">Commission Rate (%)</Label>
            <Input type="number" placeholder="e.g. 2" className="bg-surface-900 border-surface-700 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
