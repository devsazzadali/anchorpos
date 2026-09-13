// src/components/modules/purchases/PurchasePDF.tsx
// Dynamic import only (ssr: false)
"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PurchaseLine {
  name: string
  sku: string
  qty: number
  unitCost: number
  taxRate: number
  subtotal: number
}

export interface PurchasePDFProps {
  poNumber: string
  date: string
  expectedDate?: string
  businessName: string
  businessAddress: string
  businessPhone: string
  supplierName: string
  supplierPhone?: string
  supplierAddress?: string
  lines: PurchaseLine[]
  subtotal: number
  totalTax: number
  shippingCost: number
  grandTotal: number
  amountPaid: number
  balanceDue: number
  status: "ordered" | "received" | "partial" | "pending"
  notes?: string
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: "#ffffff",
    color: "#1a1a2e",
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  businessName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#f97316", marginBottom: 4 },
  businessDetail: { fontSize: 9, color: "#666", lineHeight: 1.5 },
  poTitle: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#f97316", textAlign: "right" },
  poMeta: { fontSize: 9, textAlign: "right", lineHeight: 1.7, color: "#555" },
  poLabel: { color: "#f97316", fontFamily: "Helvetica-Bold" },
  statusBadge: {
    marginTop: 6, paddingVertical: 3, paddingHorizontal: 10,
    borderRadius: 99, textAlign: "right", alignSelf: "flex-end",
    fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.8,
  },
  partySection: { flexDirection: "row", marginBottom: 24 },
  partyBox: { flex: 1, padding: 12, borderRadius: 6, backgroundColor: "#fff5ee" },
  partyTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  partyText: { fontSize: 9.5, lineHeight: 1.6, color: "#333" },
  partySpacer: { width: 20 },
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f97316", paddingVertical: 8, paddingHorizontal: 4, borderRadius: 4 },
  tableHeaderCell: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 7, paddingHorizontal: 4 },
  tableRowAlt: { backgroundColor: "#fafafa" },
  tableCell: { fontSize: 9, color: "#333" },
  colProduct: { flex: 4 },
  colSku: { flex: 2 },
  colQty: { flex: 1, textAlign: "right" },
  colCost: { flex: 2, textAlign: "right" },
  colTax: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  totalsSection: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalsBox: { width: 210 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#eee" },
  totalsLabel: { fontSize: 9.5, color: "#555" },
  totalsValue: { fontSize: 9.5, color: "#222", fontFamily: "Helvetica-Bold" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, marginTop: 4, backgroundColor: "#f97316", borderRadius: 4, paddingHorizontal: 8 },
  grandTotalLabel: { fontSize: 11, color: "#fff", fontFamily: "Helvetica-Bold" },
  grandTotalValue: { fontSize: 13, color: "#fff", fontFamily: "Helvetica-Bold" },
  notesSection: { marginTop: 24, padding: 12, backgroundColor: "#fff5ee", borderRadius: 4, borderLeftWidth: 3, borderLeftColor: "#f97316" },
  notesTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#f97316", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  notesText: { fontSize: 9, color: "#555", lineHeight: 1.5 },
  signatureSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureBox: { width: 140, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 6 },
  signatureLabel: { fontSize: 8, color: "#777", textAlign: "center" },
  footer: { position: "absolute", bottom: 30, left: 50, right: 50, textAlign: "center", fontSize: 8, color: "#aaa", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
})

function fmt(paise: number) {
  return `৳${(paise / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`
}

const STATUS_COLORS: Record<string, string> = {
  ordered: "#3637c5",
  received: "#080",
  partial: "#f97316",
  pending: "#888",
}

export function PurchasePDF({
  poNumber,
  date,
  expectedDate,
  businessName,
  businessAddress,
  businessPhone,
  supplierName,
  supplierPhone,
  supplierAddress,
  lines,
  subtotal,
  totalTax,
  shippingCost,
  grandTotal,
  amountPaid,
  balanceDue,
  status,
  notes,
}: PurchasePDFProps) {
  return (
    <Document title={`Purchase Order ${poNumber}`} author={businessName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{businessName}</Text>
            <Text style={styles.businessDetail}>{businessAddress}</Text>
            <Text style={styles.businessDetail}>Tel: {businessPhone}</Text>
          </View>
          <View>
            <Text style={styles.poTitle}>PURCHASE ORDER</Text>
            <Text style={styles.poMeta}><Text style={styles.poLabel}>PO No: </Text>{poNumber}</Text>
            <Text style={styles.poMeta}><Text style={styles.poLabel}>Date: </Text>{date}</Text>
            {expectedDate && <Text style={styles.poMeta}><Text style={styles.poLabel}>Expected: </Text>{expectedDate}</Text>}
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] + "22" }]}>
              <Text style={{ color: STATUS_COLORS[status], fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                ● {status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* From / Supplier */}
        <View style={styles.partySection}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>From (Buyer)</Text>
            <Text style={[styles.partyText, { fontFamily: "Helvetica-Bold" }]}>{businessName}</Text>
            <Text style={styles.partyText}>{businessAddress}</Text>
            <Text style={styles.partyText}>Tel: {businessPhone}</Text>
          </View>
          <View style={styles.partySpacer} />
          <View style={[styles.partyBox, { backgroundColor: "#f0fff0" }]}>
            <Text style={[styles.partyTitle, { color: "#080" }]}>Supplier</Text>
            <Text style={[styles.partyText, { fontFamily: "Helvetica-Bold" }]}>{supplierName}</Text>
            {supplierAddress && <Text style={styles.partyText}>{supplierAddress}</Text>}
            {supplierPhone && <Text style={styles.partyText}>Tel: {supplierPhone}</Text>}
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product / Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colCost]}>Unit Cost</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>Tax</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Subtotal</Text>
          </View>
          {lines.map((line, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colProduct]}>{line.name}</Text>
              <Text style={[styles.tableCell, styles.colSku, { color: "#888" }]}>{line.sku}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{line.qty}</Text>
              <Text style={[styles.tableCell, styles.colCost]}>{fmt(line.unitCost)}</Text>
              <Text style={[styles.tableCell, styles.colTax]}>{line.taxRate}%</Text>
              <Text style={[styles.tableCell, styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>{fmt(line.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{fmt(totalTax)}</Text>
            </View>
            {shippingCost > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Shipping</Text>
                <Text style={styles.totalsValue}>{fmt(shippingCost)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>{fmt(grandTotal)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 9.5, color: "#555" }}>Amount Paid</Text>
              <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#080" }}>{fmt(amountPaid)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 9.5, color: balanceDue > 0 ? "#d00" : "#080" }}>Balance Due</Text>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: balanceDue > 0 ? "#d00" : "#080" }}>{fmt(balanceDue)}</Text>
            </View>
          </View>
        </View>

        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes / Instructions</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Supplier Acknowledgement</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Authorized By</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {businessName} · Purchase Order {poNumber} · Generated on {date}
        </Text>
      </Page>
    </Document>
  )
}
