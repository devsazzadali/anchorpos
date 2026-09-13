"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema"
import { ArrowLeft, Save, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, toBDTPaise } from "@/lib/utils/currency"

export default function CreateProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: 'single',
      name: '',
      barcode_type: 'C128',
      alert_quantity: 0,
      tax_method: 'exclusive',
      purchase_price: 0,
      opening_stock_qty: 0,
      track_serial: false,
      has_expiry: false,
    }
  })

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const productId = crypto.randomUUID()
      const businessId = "00000000-0000-0000-0000-000000000000" // Fallback; would be pulled from auth/session
      
      const newProduct = {
        id: productId,
        business_id: businessId,
        type: data.type,
        name: data.name,
        sku: data.sku || `SKU-${Date.now()}`,
        barcode_type: data.barcode_type,
        category_id: data.category_id || null,
        category_name: null,
        brand_id: data.brand_id || null,
        brand_name: null,
        unit_id: data.unit_id || null,
        unit_name: null,
        tax_id: data.tax_id || null,
        tax_rate: 0,
        tax_method: data.tax_method,
        unit_price: data.unit_price,
        purchase_price: data.purchase_price || 0,
        alert_quantity: data.alert_quantity || 0,
        image_url: null,
        is_active: true,
        updated_at: new Date().toISOString(),
        _synced: false
      }

      // 1. Save locally
      const { db } = await import("@/lib/db/db")
      await db.products.put(newProduct as any)

      // 2. Queue for background sync
      const { SyncEngine } = await import("@/lib/db/sync")
      await SyncEngine.enqueue('INSERT', 'products', productId, newProduct, 2)
      
      toast({
        title: "Product Created",
        description: "The product has been successfully added to the catalog.",
        className: "bg-brand-500 text-white border-none",
      })
      router.push('/products')
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create product."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const { formState: { errors } } = form

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-surface-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Add New Product</h2>
            <p className="text-surface-400 text-sm">Create a new single or variable product</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700">
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Product
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <div className="glass-panel rounded-xl p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-surface-900 border border-surface-800 p-1 rounded-lg mb-8">
            <TabsTrigger value="basic" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 rounded-md">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 rounded-md">Pricing & Tax</TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 rounded-md">Opening Stock</TabsTrigger>
            <TabsTrigger value="other" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white text-surface-400 rounded-md">Other</TabsTrigger>
          </TabsList>

          <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
            {/* BASIC INFO TAB */}
            <TabsContent value="basic" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-surface-300">Product Name *</Label>
                  <Input 
                    {...form.register("name")} 
                    placeholder="e.g. Motul 7100 10W40" 
                    className={`bg-surface-900 border-surface-700 text-white ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label className="text-surface-300">Product Type *</Label>
                  <Select onValueChange={(v: 'single'|'variable') => form.setValue("type", v)} defaultValue={form.getValues("type")}>
                    <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-800 border-surface-700 text-white">
                      <SelectItem value="single" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Single Product</SelectItem>
                      <SelectItem value="variable" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Variable Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-surface-300">Category</Label>
                  <Select onValueChange={(v) => form.setValue("category_id", v)}>
                    <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-800 border-surface-700 text-white">
                      <SelectItem value="cat1" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Engine Oil</SelectItem>
                      <SelectItem value="cat2" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Spare Parts</SelectItem>
                      <SelectItem value="cat3" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-surface-300">Brand</Label>
                  <Select onValueChange={(v) => form.setValue("brand_id", v)}>
                    <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-800 border-surface-700 text-white">
                      <SelectItem value="brand1" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Motul</SelectItem>
                      <SelectItem value="brand2" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">NGK</SelectItem>
                      <SelectItem value="brand3" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Brembo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-surface-300">SKU (Stock Keeping Unit)</Label>
                  <Input 
                    {...form.register("sku")} 
                    placeholder="Leave blank to auto-generate" 
                    className="bg-surface-900 border-surface-700 text-white"
                  />
                  <p className="text-xs text-surface-500">Unique identifier for the product.</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-surface-300">Barcode Type</Label>
                  <Select onValueChange={(v: any) => form.setValue("barcode_type", v)} defaultValue={form.getValues("barcode_type")}>
                    <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                      <SelectValue placeholder="Select barcode type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-800 border-surface-700 text-white">
                      <SelectItem value="C128" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Code 128 (C128)</SelectItem>
                      <SelectItem value="C39" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Code 39 (C39)</SelectItem>
                      <SelectItem value="EAN13" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">EAN-13</SelectItem>
                      <SelectItem value="UPC-A" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">UPC-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* PRICING & TAX TAB */}
            <TabsContent value="pricing" className="space-y-6 focus-visible:outline-none">
              <div className="bg-surface-900/50 border border-surface-800 p-4 rounded-lg flex gap-3 text-sm text-surface-300 mb-6">
                <Info className="w-5 h-5 text-brand-400 shrink-0" />
                <p>All prices should be entered in decimal format (e.g. 100.50). The system automatically stores them securely as integers (paise) to prevent calculation errors.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-surface-300">Selling Price (Inc. Tax) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">৳</span>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) form.setValue("unit_price", toBDTPaise(val));
                      }}
                      className={`pl-8 bg-surface-900 border-surface-700 text-white ${errors.unit_price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.unit_price && <span className="text-xs text-red-400">{errors.unit_price.message}</span>}
                </div>

                <div className="space-y-2">
                  <Label className="text-surface-300">Purchase Price (Inc. Tax)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">৳</span>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) form.setValue("purchase_price", toBDTPaise(val));
                      }}
                      className="pl-8 bg-surface-900 border-surface-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-surface-300">Applicable Tax</Label>
                  <Select onValueChange={(v) => form.setValue("tax_id", v)}>
                    <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-800 border-surface-700 text-white">
                      <SelectItem value="none" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">None</SelectItem>
                      <SelectItem value="tax1" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">VAT (15%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-surface-300">Tax Type</Label>
                  <Select onValueChange={(v: 'inclusive'|'exclusive') => form.setValue("tax_method", v)} defaultValue={form.getValues("tax_method")}>
                    <SelectTrigger className="bg-surface-900 border-surface-700 text-white">
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-800 border-surface-700 text-white">
                      <SelectItem value="inclusive" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Inclusive</SelectItem>
                      <SelectItem value="exclusive" className="hover:bg-surface-700 focus:bg-surface-700 cursor-pointer">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* STOCK TAB */}
            <TabsContent value="stock" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-surface-300">Alert Quantity</Label>
                  <Input 
                    type="number"
                    {...form.register("alert_quantity", { valueAsNumber: true })}
                    placeholder="e.g. 5" 
                    className="bg-surface-900 border-surface-700 text-white"
                  />
                  <p className="text-xs text-surface-500">Get notified when stock drops below this level.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-surface-300">Opening Stock Quantity</Label>
                  <Input 
                    type="number"
                    {...form.register("opening_stock_qty", { valueAsNumber: true })}
                    placeholder="0" 
                    className="bg-surface-900 border-surface-700 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* OTHER TAB */}
            <TabsContent value="other" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-surface-300">Product Image</Label>
                  <div className="border-2 border-dashed border-surface-700 rounded-xl p-8 text-center bg-surface-900/50 hover:bg-surface-800/50 hover:border-brand-500/50 transition-colors cursor-pointer">
                    <p className="text-surface-400 text-sm">Click or drag image to upload</p>
                    <p className="text-surface-600 text-xs mt-1">PNG, JPG, WebP up to 5MB</p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-surface-300">Description</Label>
                  <textarea 
                    {...form.register("description")}
                    rows={4}
                    className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Brief details about the product..."
                  />
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
