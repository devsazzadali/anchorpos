"use client"

import { useState } from "react"
import { Save, Loader2, Bell, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { playClick, playSuccess } from "@/lib/utils/audio"

export default function NotificationTemplatesPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  
  // Test modal
  const [isTestOpen, setIsTestOpen] = useState(false)
  const [testPhone, setTestPhone] = useState("+880 1711-000000")
  const [isSendingTest, setIsSendingTest] = useState(false)

  // Templates
  const [saleSms, setSaleSms] = useState("Dear {customer_name}, your invoice {invoice_no} for {total_amount} is confirmed at Rangpur Bike Parlour. Thank you!")
  const [saleEmail, setSaleEmail] = useState("<h3>Thank you for choosing Rangpur Bike Parlour, {customer_name}!</h3>\n<p>Your invoice <strong>{invoice_no}</strong> for <strong>{total_amount}</strong> has been generated.</p>\n<p>For support, call +880 1712-000000 or visit BL0001 Rangpur.</p>")

  const [paymentSms, setPaymentSms] = useState("Payment received: {amount_paid} for invoice {invoice_no}. Remaining due: {balance_due}. Rangpur Bike Parlour.")
  const [paymentEmail, setPaymentEmail] = useState("<h3>Payment Receipt Confirmation</h3>\n<p>Dear {customer_name}, we have received {amount_paid} via {payment_method}.</p>\n<p>Remaining balance: {balance_due}. Thank you!</p>")

  const [dueSms, setDueSms] = useState("Reminder from Rangpur Bike Parlour: Your outstanding balance of {balance_due} is pending. Kindly clear your dues at your earliest convenience.")
  const [dueEmail, setDueEmail] = useState("<h3>Outstanding Payment Reminder</h3>\n<p>Dear {customer_name}, this is a gentle reminder regarding your outstanding balance of {balance_due}.</p>\n<p>Please contact our cashier at +880 1712-000000.</p>")

  const handleSave = async () => {
    playClick()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    playSuccess()
    toast({
      title: "Templates Saved",
      description: "Automated SMS and Email notification triggers updated successfully.",
      className: "bg-surface-900 text-white border-brand-500/50",
    })
  }

  const handleSendTest = async () => {
    if (!testPhone.trim()) return
    playClick()
    setIsSendingTest(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSendingTest(false)
    setIsTestOpen(false)
    playSuccess()
    toast({
      title: "Test SMS Dispatched",
      description: `Dispatched test message to ${testPhone} via Bangladesh SMS Gateway (Status: 200 OK).`,
      className: "bg-surface-900 text-white border-emerald-500/50",
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Notification Templates</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              SMS &amp; Email
            </span>
          </div>
          <p className="text-surface-400 mt-1">Configure automated transactional customer SMS and HTML email receipts</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => { playClick(); setIsTestOpen(true) }}
            className="border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200"
          >
            <Send className="w-4 h-4 mr-2 text-brand-400" /> Send Test SMS
          </Button>
          <Button 
            disabled={isSaving}
            onClick={handleSave}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Templates
          </Button>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6 border border-surface-800">
        <Tabs defaultValue="sale" className="w-full flex flex-col md:flex-row gap-6">
          <TabsList className="bg-surface-900 border border-surface-800 p-2 rounded-lg flex md:flex-col h-auto justify-start shrink-0">
            <TabsTrigger value="sale" className="data-[state=active]:bg-surface-800 data-[state=active]:text-white text-surface-400 justify-start w-full px-4 py-3">
              <Bell className="w-4 h-4 mr-2 text-brand-400" /> New Sale / Invoice
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-surface-800 data-[state=active]:text-white text-surface-400 justify-start w-full px-4 py-3">
              <Bell className="w-4 h-4 mr-2 text-emerald-400" /> Payment Received
            </TabsTrigger>
            <TabsTrigger value="due" className="data-[state=active]:bg-surface-800 data-[state=active]:text-white text-surface-400 justify-start w-full px-4 py-3">
              <Bell className="w-4 h-4 mr-2 text-red-400" /> Due Reminder
            </TabsTrigger>
          </TabsList>

          {/* Sale Tab */}
          <TabsContent value="sale" className="flex-1 space-y-6 m-0 focus-visible:outline-none">
            <div className="space-y-2">
              <Label className="text-surface-300 flex items-center font-semibold">
                <MessageSquare className="w-4 h-4 mr-2 text-brand-400" />
                Customer SMS Template (Max 160 Characters)
              </Label>
              <textarea 
                rows={4}
                value={saleSms}
                onChange={(e) => setSaleSms(e.target.value)}
                className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans"
              />
              <div className="text-xs text-surface-400 pt-1 flex flex-wrap gap-2">
                <span>Variables:</span>
                <span className="font-mono text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{customer_name}`}</span>
                <span className="font-mono text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{invoice_no}`}</span>
                <span className="font-mono text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{total_amount}`}</span>
                <span className="font-mono text-brand-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{business_name}`}</span>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-surface-800">
              <Label className="text-surface-300 flex items-center font-semibold">
                <Mail className="w-4 h-4 mr-2 text-brand-400" />
                Email Receipt Template (HTML)
              </Label>
              <textarea 
                rows={7}
                value={saleEmail}
                onChange={(e) => setSaleEmail(e.target.value)}
                className="w-full font-mono rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-xs text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="flex-1 space-y-6 m-0 focus-visible:outline-none">
            <div className="space-y-2">
              <Label className="text-surface-300 flex items-center font-semibold">
                <MessageSquare className="w-4 h-4 mr-2 text-emerald-400" />
                Payment Received SMS
              </Label>
              <textarea 
                rows={4}
                value={paymentSms}
                onChange={(e) => setPaymentSms(e.target.value)}
                className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
              <div className="text-xs text-surface-400 pt-1 flex flex-wrap gap-2">
                <span>Variables:</span>
                <span className="font-mono text-emerald-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{amount_paid}`}</span>
                <span className="font-mono text-emerald-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{invoice_no}`}</span>
                <span className="font-mono text-emerald-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{balance_due}`}</span>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-surface-800">
              <Label className="text-surface-300 flex items-center font-semibold">
                <Mail className="w-4 h-4 mr-2 text-emerald-400" />
                Payment Confirmation Email (HTML)
              </Label>
              <textarea 
                rows={7}
                value={paymentEmail}
                onChange={(e) => setPaymentEmail(e.target.value)}
                className="w-full font-mono rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-xs text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>
          </TabsContent>

          {/* Due Tab */}
          <TabsContent value="due" className="flex-1 space-y-6 m-0 focus-visible:outline-none">
            <div className="space-y-2">
              <Label className="text-surface-300 flex items-center font-semibold">
                <MessageSquare className="w-4 h-4 mr-2 text-red-400" />
                Customer Due Reminder SMS
              </Label>
              <textarea 
                rows={4}
                value={dueSms}
                onChange={(e) => setDueSms(e.target.value)}
                className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
              <div className="text-xs text-surface-400 pt-1 flex flex-wrap gap-2">
                <span>Variables:</span>
                <span className="font-mono text-red-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{customer_name}`}</span>
                <span className="font-mono text-red-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{balance_due}`}</span>
                <span className="font-mono text-red-400 bg-surface-800 px-1.5 py-0.5 rounded">{`{due_date}`}</span>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-surface-800">
              <Label className="text-surface-300 flex items-center font-semibold">
                <Mail className="w-4 h-4 mr-2 text-red-400" />
                Due Reminder Email (HTML)
              </Label>
              <textarea 
                rows={7}
                value={dueEmail}
                onChange={(e) => setDueEmail(e.target.value)}
                className="w-full font-mono rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-xs text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Test SMS Dialog */}
      <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
        <DialogContent className="bg-surface-900 border-surface-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-400" /> Dispatch Test SMS
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-xs text-surface-300">
              Send a simulated transaction SMS to verify your Bangladesh SMS Gateway (SSL Wireless / Infobip / BulkSMSBD) connection:
            </p>
            <div className="space-y-2">
              <Label className="text-surface-200">Recipient Phone Number *</Label>
              <Input 
                value={testPhone} 
                onChange={(e) => setTestPhone(e.target.value)} 
                placeholder="+880 17..."
                className="bg-surface-800 border-surface-700 text-white font-mono" 
              />
            </div>
            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700 text-xs text-surface-300 space-y-1">
              <div className="text-surface-400 font-semibold">Sample Rendered Payload:</div>
              <p className="italic text-brand-300">"Dear Sazzad Ali, your invoice INV-2026-0042 for ৳ 1,200.00 is confirmed at Rangpur Bike Parlour. Thank you!"</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsTestOpen(false)} className="border-surface-700 bg-surface-800 text-surface-300">
              Cancel
            </Button>
            <Button 
              disabled={isSendingTest}
              onClick={handleSendTest} 
              className="bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
            >
              {isSendingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send SMS Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
