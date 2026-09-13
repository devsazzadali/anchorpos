"use client"

import { useState } from "react"
import { 
  Save, Building2, Receipt, Shield, CreditCard, 
  Package, Users, ShoppingCart, Sliders, LayoutDashboard, Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function BusinessSettingsPage() {
  const { toast } = useToast()
  const [logo, setLogo] = useState<File | null>(null)
  const [stockWarnings, setStockWarnings] = useState(true)
  const [serialTracking, setSerialTracking] = useState(true)
  const [lotNumbers, setLotNumbers] = useState(true)
  const [showLogo, setShowLogo] = useState(true)
  const [autoPrint, setAutoPrint] = useState(false)
  const [allowNegativeStock, setAllowNegativeStock] = useState(false)

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Business settings for Rangpur Bike Parlour have been updated successfully.",
      className: "bg-surface-800 border-surface-700 text-white",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Business Settings</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Rangpur Bike Parlour
          </span>
        </div>
        <p className="text-surface-400 mt-1">Configure all 10 core system modules and operational defaults</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-surface-800 border border-surface-700 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="business" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Building2 className="w-3.5 h-3.5" /> 1. Business
          </TabsTrigger>
          <TabsTrigger value="tax" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Shield className="w-3.5 h-3.5" /> 2. Tax
          </TabsTrigger>
          <TabsTrigger value="product" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Package className="w-3.5 h-3.5" /> 3. Product
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Users className="w-3.5 h-3.5" /> 4. Contact
          </TabsTrigger>
          <TabsTrigger value="sale" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Receipt className="w-3.5 h-3.5" /> 5. Sale
          </TabsTrigger>
          <TabsTrigger value="pos" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <ShoppingCart className="w-3.5 h-3.5" /> 6. POS
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Sliders className="w-3.5 h-3.5" /> 7. Purchases
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <CreditCard className="w-3.5 h-3.5" /> 8. Payment
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <LayoutDashboard className="w-3.5 h-3.5" /> 9. Dashboard
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white text-surface-300 gap-1.5 text-xs py-2 px-3">
            <Monitor className="w-3.5 h-3.5" /> 10. System
          </TabsTrigger>
        </TabsList>

        {/* 1. Business Tab */}
        <TabsContent value="business">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-400" /> Business Profile
            </h3>
            <Separator className="bg-surface-800" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-200">Business Name *</Label>
                <Input defaultValue="Rangpur Bike Parlour" className="bg-surface-900 border-surface-700 text-white focus-visible:ring-brand-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">System Tagline</Label>
                <Input defaultValue="DATABYTE - NEXT GEN POS SOFTWARE" className="bg-surface-900 border-surface-700 text-white focus-visible:ring-brand-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Default Currency</Label>
                <Select defaultValue="BDT">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="BDT">BDT — Bangladeshi Taka (৳)</SelectItem>
                    <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Currency Symbol</Label>
                <Input defaultValue="৳" className="bg-surface-900 border-surface-700 text-white focus-visible:ring-brand-500 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Timezone</Label>
                <Input defaultValue="Asia/Dhaka (GMT+6)" disabled className="bg-surface-900 border-surface-700 text-surface-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Fiscal Year Start Month</Label>
                <Select defaultValue="1">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 2. Tax Tab */}
        <TabsContent value="tax">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" /> Tax Rates &amp; Calculation Rules
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-200">Tax 1 Name</Label>
                <Input defaultValue="VAT" className="bg-surface-900 border-surface-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Tax 1 Rate (%)</Label>
                <Input defaultValue="5.00" type="number" step="0.01" className="bg-surface-900 border-surface-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Default Tax Calculation Method</Label>
                <Select defaultValue="exclusive">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="exclusive">Exclusive (Price + Tax)</SelectItem>
                    <SelectItem value="inclusive">Inclusive (Price Includes Tax)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 3. Product Tab */}
        <TabsContent value="product">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-400" /> Product &amp; Inventory Defaults
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-200">SKU Prefix</Label>
                <Input defaultValue="PROD" className="bg-surface-900 border-surface-700 text-white font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Default Barcode Type</Label>
                <Select defaultValue="C128">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="C128">Code 128 (C128)</SelectItem>
                    <SelectItem value="EAN13">EAN-13</SelectItem>
                    <SelectItem value="C39">Code 39</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-800/40">
                <div>
                  <p className="font-medium text-white text-sm">Low Stock Alert Warnings</p>
                  <p className="text-xs text-surface-400">Trigger alerts when stock reaches threshold</p>
                </div>
                <Switch checked={stockWarnings} onCheckedChange={setStockWarnings} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-800/40">
                <div>
                  <p className="font-medium text-white text-sm">Serial / IMEI Tracking</p>
                  <p className="text-xs text-surface-400">Capture serial numbers for spare parts and accessories</p>
                </div>
                <Switch checked={serialTracking} onCheckedChange={setSerialTracking} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-800/40">
                <div>
                  <p className="font-medium text-white text-sm">Product Expiry Tracking</p>
                  <p className="text-xs text-surface-400">Track expiry dates for oils and lubricants</p>
                </div>
                <Switch checked={lotNumbers} onCheckedChange={setLotNumbers} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 4. Contact Tab */}
        <TabsContent value="contact">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" /> Customer &amp; Supplier Defaults
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-200">Default Customer Group</Label>
                <Input defaultValue="Retail Customers" className="bg-surface-900 border-surface-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Default Credit Limit (৳)</Label>
                <Input defaultValue="0.00" type="number" className="bg-surface-900 border-surface-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Walk-In Customer Name</Label>
                <Input defaultValue="Walk-In Customer" className="bg-surface-900 border-surface-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Customer ID Prefix</Label>
                <Input defaultValue="CO" className="bg-surface-900 border-surface-700 text-white font-mono" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 5. Sale Tab */}
        <TabsContent value="sale">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-brand-400" /> Sales &amp; Invoicing Defaults
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-200">Default Invoice Scheme</Label>
                <Input defaultValue="Default (4 Digits, Start 1)" disabled className="bg-surface-900 border-surface-700 text-surface-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Sales Commission Agent</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="none">Disable Commission</SelectItem>
                    <SelectItem value="logged_in">Logged in user</SelectItem>
                    <SelectItem value="select">Select from agent list</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-surface-200">Invoice Terms &amp; Conditions</Label>
              <Textarea 
                defaultValue="1. Goods once sold are not returnable without cash memo.&#10;2. Warranty claims require original packaging and receipt." 
                rows={3} 
                className="bg-surface-900 border-surface-700 text-white font-mono text-xs" 
              />
            </div>
          </div>
        </TabsContent>

        {/* 6. POS Tab */}
        <TabsContent value="pos">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-400" /> POS Terminal Configuration
            </h3>
            <Separator className="bg-surface-800" />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-800/40">
                <div>
                  <p className="font-medium text-white text-sm">Auto-Print Receipt after Checkout</p>
                  <p className="text-xs text-surface-400">Immediately send sale to thermal receipt printer</p>
                </div>
                <Switch checked={autoPrint} onCheckedChange={setAutoPrint} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-800/40">
                <div>
                  <p className="font-medium text-white text-sm">Show Business Logo on 80mm Receipt</p>
                  <p className="text-xs text-surface-400">Header contains Rangpur Bike Parlour insignia</p>
                </div>
                <Switch checked={showLogo} onCheckedChange={setShowLogo} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-800/40">
                <div>
                  <p className="font-medium text-white text-sm">Allow Overselling (Negative Stock)</p>
                  <p className="text-xs text-surface-400">Complete sale even if physical inventory count is 0</p>
                </div>
                <Switch checked={allowNegativeStock} onCheckedChange={setAllowNegativeStock} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 7. Purchases Tab */}
        <TabsContent value="purchases">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-400" /> Purchase Order Defaults
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-surface-200">Purchase Reference Prefix</Label>
                <Input defaultValue="PO" className="bg-surface-900 border-surface-700 text-white font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-surface-200">Default Purchase Status</Label>
                <Select defaultValue="received">
                  <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-800 border-surface-700 text-white">
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 8. Payment Tab */}
        <TabsContent value="payment">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-400" /> Payment Accounts &amp; Methods
            </h3>
            <Separator className="bg-surface-800" />
            <p className="text-sm text-surface-300">Accepted payment accounts for Rangpur Bike Parlour transactions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-surface-800/60 border border-surface-700">
                <p className="font-semibold text-white text-sm">💵 Cash Register</p>
                <p className="text-xs text-surface-400 mt-1">Cash in drawer</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-800/60 border border-surface-700">
                <p className="font-semibold text-white text-sm">📱 Mobile Banking</p>
                <p className="text-xs text-surface-400 mt-1">bKash / Nagad / Rocket</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-800/60 border border-surface-700">
                <p className="font-semibold text-white text-sm">💳 Bank Transfer / POS</p>
                <p className="text-xs text-surface-400 mt-1">City Bank / Card Terminal</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 9. Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-brand-400" /> Dashboard Widget Visibility
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-surface-800/40 flex items-center justify-between">
                <span className="text-white">Total Sales &amp; Net Profit Widgets</span>
                <span className="text-xs text-green-400 font-semibold">Active</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-800/40 flex items-center justify-between">
                <span className="text-white">Purchase &amp; Sale Comparison Chart</span>
                <span className="text-xs text-green-400 font-semibold">Active</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-800/40 flex items-center justify-between">
                <span className="text-white">Stock Expiry Alert Table</span>
                <span className="text-xs text-green-400 font-semibold">Active</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-800/40 flex items-center justify-between">
                <span className="text-white">Pending Shipments List</span>
                <span className="text-xs text-green-400 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 10. System Tab */}
        <TabsContent value="system">
          <div className="glass-panel rounded-xl p-6 space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-brand-400" /> System Information &amp; Sync
            </h3>
            <Separator className="bg-surface-800" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-surface-400 text-xs">Application Name</Label>
                <p className="font-mono text-white font-medium">DATABYTE POS</p>
              </div>
              <div>
                <Label className="text-surface-400 text-xs">Installed Version</Label>
                <p className="font-mono text-white font-medium">1.0.0 (Offline-First Edition)</p>
              </div>
              <div>
                <Label className="text-surface-400 text-xs">Offline IndexedDB Storage</Label>
                <p className="font-mono text-green-400 font-medium">Dexie 4.4 Engine Active</p>
              </div>
              <div>
                <Label className="text-surface-400 text-xs">Sync Interval</Label>
                <p className="font-mono text-white font-medium">30,000 ms (Automatic background sync)</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow px-8 h-11">
          <Save className="w-4 h-4 mr-2" /> Save All Settings
        </Button>
      </div>
    </div>
  )
}
