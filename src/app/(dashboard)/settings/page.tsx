"use client"

import Link from "next/link"
import { Building2, MapPin, Receipt, Percent, Barcode, Bell, Printer, ShieldCheck } from "lucide-react"

const SETTINGS_SECTIONS = [
  { name: "Business Info", href: "/settings/business", icon: Building2, desc: "Name, logo, currency, timezone and fiscal year" },
  { name: "Business Locations", href: "/settings/locations", icon: MapPin, desc: "Manage branches and outlet locations (BL0001)" },
  { name: "Invoice Schemes", href: "/settings/invoices", icon: Receipt, desc: "Configure invoice number formats, prefixes and pad digits" },
  { name: "Tax Rates", href: "/settings/taxes", icon: Percent, desc: "Add and manage VAT and other sales tax rates" },
  { name: "Barcode Settings", href: "/settings/barcodes", icon: Barcode, desc: "Barcode label templates and paper sizes" },
  { name: "Notification Templates", href: "/settings/notifications", icon: Bell, desc: "Customize SMS and email notification text" },
  { name: "Receipt Printers", href: "/settings/printers", icon: Printer, desc: "Thermal ESC/POS hardware, 80mm/58mm rolls & network IPs" },
  { name: "License & Subscription", href: "/settings/subscription", icon: ShieldCheck, desc: "Manage enterprise tier quota, renewals, and payments" },
]

export default function SettingsIndexPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Settings</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Rangpur Bike Parlour
          </span>
        </div>
        <p className="text-surface-400 mt-1">Manage your business configuration, hardware profiles, and system preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.name}
              href={section.href}
              className="glass-panel rounded-xl p-5 flex flex-col justify-between hover:bg-surface-800/50 transition-all group hover:shadow-card-hover hover:-translate-y-0.5 border border-surface-800"
            >
              <div>
                <div className="p-3 rounded-xl bg-brand-500/15 w-fit mb-3">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">{section.name}</h3>
                <p className="text-surface-400 text-xs mt-1 leading-relaxed">{section.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-800/60 text-[11px] font-semibold text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Configure &rarr;
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
