// src/components/modules/sells/InvoicePDF.tsx
// Dynamic import only (ssr: false) — do NOT use in Server Components directly
"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"

// ── Types ──────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  name: string
  sku: string
  qty: number
  unitPrice: number
  discount: number
  taxRate: number
  subtotal: number
}

export interface InvoicePDFProps {
  invoiceNo: string
  date: string
  dueDate?: string
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail?: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  lines: InvoiceLine[]
  subtotal: number
  totalDiscount: number
  totalTax: number
  shippingCost: number
  grandTotal: number
  amountPaid: number
  balanceDue: number
  notes?: string
  termsAndConditions?: string
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
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  businessName: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#3637c5", marginBottom: 4 },
  businessDetail: { fontSize: 9, color: "#555", lineHeight: 1.5 },
  invoiceTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#f0f0ff", textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: "#555", textAlign: "right", lineHeight: 1.7 },
  invoiceLabel: { color: "#3637c5", fontFamily: "Helvetica-Bold" },
  // Party Section
  partySection: { flexDirection: "row", marginBottom: 24 },
  partyBox: { flex: 1, padding: 12, borderRadius: 6, backgroundColor: "#f5f5ff" },
  partyTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#3637c5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  partyText: { fontSize: 9.5, lineHeight: 1.6, color: "#333" },
  partySpacer: { width: 20 },
  // Table
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#3637c5", paddingVertical: 8, paddingHorizontal: 4, borderRadius: 4 },
  tableHeaderCell: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 7, paddingHorizontal: 4 },
  tableRowAlt: { backgroundColor: "#fafafa" },
  tableCell: { fontSize: 9, color: "#333" },
  colProduct: { flex: 4 },
  colSku: { flex: 2 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colDiscount: { flex: 1.5, textAlign: "right" },
  colTax: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  // Totals
  totalsSection: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalsBox: { width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#eee" },
  totalsLabel: { fontSize: 9.5, color: "#555" },
  totalsValue: { fontSize: 9.5, color: "#222", fontFamily: "Helvetica-Bold" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, marginTop: 4, backgroundColor: "#3637c5", borderRadius: 4, paddingHorizontal: 8 },
  grandTotalLabel: { fontSize: 11, color: "#fff", fontFamily: "Helvetica-Bold" },
  grandTotalValue: { fontSize: 13, color: "#fff", fontFamily: "Helvetica-Bold" },
  balanceDueRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 8 },
  balanceDueLabel: { fontSize: 9.5, color: "#d00" },
  balanceDueValue: { fontSize: 11, color: "#d00", fontFamily: "Helvetica-Bold" },
  // Notes
  notesSection: { marginTop: 24, padding: 12, backgroundColor: "#fafafa", borderRadius: 4, borderLeftWidth: 3, borderLeftColor: "#3637c5" },
  notesTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#3637c5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  notesText: { fontSize: 9, color: "#555", lineHeight: 1.5 },
  // Terms
  termsSection: { marginTop: 16 },
  // Footer
  footer: { position: "absolute", bottom: 30, left: 50, right: 50, textAlign: "center", fontSize: 8, color: "#aaa", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
  pageNumber: { textAlign: "right", fontSize: 8, color: "#aaa" },
  // Signature
  signatureSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureBox: { width: 140, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 6 },
  signatureLabel: { fontSize: 8, color: "#777", textAlign: "center" },
})

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(paise: number) {
  return `৳${(paise / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`
}

// ── Component ──────────────────────────────────────────────────────────────

export function InvoicePDF({
  invoiceNo,
  date,
  dueDate,
  businessName,
  businessAddress,
  businessPhone,
  businessEmail,
  customerName,
  customerPhone,
  customerAddress,
  lines,
  subtotal,
  totalDiscount,
  totalTax,
  shippingCost,
  grandTotal,
  amountPaid,
  balanceDue,
  notes,
  termsAndConditions,
}: InvoicePDFProps) {
  return (
    <Document title={`Invoice ${invoiceNo}`} author={businessName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{businessName}</Text>
            <Text style={styles.businessDetail}>{businessAddress}</Text>
            <Text style={styles.businessDetail}>Tel: {businessPhone}{businessEmail ? ` | ${businessEmail}` : ""}</Text>
          </View>
          <View>
            <Text style={[styles.invoiceTitle, { color: "#3637c5" }]}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>
              <Text style={styles.invoiceLabel}>No: </Text>{invoiceNo}
            </Text>
            <Text style={styles.invoiceMeta}>
              <Text style={styles.invoiceLabel}>Date: </Text>{date}
            </Text>
            {dueDate && (
              <Text style={styles.invoiceMeta}>
                <Text style={styles.invoiceLabel}>Due: </Text>{dueDate}
              </Text>
            )}
          </View>
        </View>

        {/* Bill To / Ship To */}
        <View style={styles.partySection}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Bill To</Text>
            <Text style={[styles.partyText, { fontFamily: "Helvetica-Bold" }]}>{customerName}</Text>
            {customerAddress && <Text style={styles.partyText}>{customerAddress}</Text>}
            {customerPhone && <Text style={styles.partyText}>Tel: {customerPhone}</Text>}
          </View>
          <View style={styles.partySpacer} />
          <View style={[styles.partyBox, { backgroundColor: "#fff9f0" }]}>
            <Text style={[styles.partyTitle, { color: "#c47a00" }]}>Payment Info</Text>
            <Text style={styles.partyText}>Amount Paid: {fmt(amountPaid)}</Text>
            <Text style={[styles.partyText, { color: balanceDue > 0 ? "#d00" : "#080" }]}>
              Balance Due: {fmt(balanceDue)}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>SKU</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colDiscount]}>Disc.</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>Tax</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Subtotal</Text>
          </View>
          {lines.map((line, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colProduct]}>{line.name}</Text>
              <Text style={[styles.tableCell, styles.colSku, { color: "#888" }]}>{line.sku}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{line.qty}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{fmt(line.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.colDiscount, { color: "#d00" }]}>
                {line.discount > 0 ? fmt(line.discount) : "—"}
              </Text>
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
            {totalDiscount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { color: "#d00" }]}>Discount</Text>
                <Text style={[styles.totalsValue, { color: "#d00" }]}>- {fmt(totalDiscount)}</Text>
              </View>
            )}
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
            <View style={styles.balanceDueRow}>
              <Text style={styles.balanceDueLabel}>{balanceDue > 0 ? "Balance Due" : "Paid in Full"}</Text>
              <Text style={[styles.balanceDueValue, { color: balanceDue > 0 ? "#d00" : "#080" }]}>
                {fmt(balanceDue)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Terms */}
        {termsAndConditions && (
          <View style={styles.termsSection}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{termsAndConditions}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Customer Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {businessName} — This is a computer generated invoice and does not require physical signature.
        </Text>
      </Page>
    </Document>
  )
}
