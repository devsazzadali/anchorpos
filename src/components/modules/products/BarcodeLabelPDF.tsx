// src/components/modules/products/BarcodeLabelPDF.tsx
// Dynamic import only (ssr: false)
"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer"

// ── Types ──────────────────────────────────────────────────────────────────

export interface BarcodeLabel {
  productName: string
  sku: string
  price: number         // in paise (integer)
  currency?: string     // default ৳
  barcodeDataUrl: string // base64 PNG from react-barcode via canvas toDataURL
  batchLabel?: string   // e.g. "Batch: B-240901"
}

export interface BarcodeLabelPDFProps {
  labels: BarcodeLabel[]
  paperWidth?: number   // pt — default 226.77 (80mm)
  labelWidth?: number   // pt — default 170
  labelHeight?: number  // pt — default 100
  columns?: number      // default 2
}

// ── Styles ─────────────────────────────────────────────────────────────────

const LABEL_W = 170
const LABEL_H = 100
const COLS = 2

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "#ffffff",
  },
  label: {
    width: LABEL_W,
    height: LABEL_H,
    margin: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 6,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  productName: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    textAlign: "center",
    lineHeight: 1.3,
    maxLines: 2,
  },
  barcodeImage: {
    width: LABEL_W - 24,
    height: 42,
    objectFit: "contain",
  },
  sku: {
    fontSize: 7,
    color: "#666",
    fontFamily: "Helvetica",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#3637c5",
  },
  batch: {
    fontSize: 6,
    color: "#999",
    textAlign: "center",
  },
})

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(paise: number, currency = "৳") {
  return `${currency}${(paise / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`
}

// ── Component ──────────────────────────────────────────────────────────────

export function BarcodeLabelPDF({
  labels,
  paperWidth = 595,    // A4 width
  labelWidth = LABEL_W,
  labelHeight = LABEL_H,
}: BarcodeLabelPDFProps) {
  return (
    <Document title="Barcode Labels">
      <Page
        size={{ width: paperWidth, height: "auto" as unknown as number }}
        style={styles.page}
      >
        {labels.map((label, i) => (
          <View key={i} style={[styles.label, { width: labelWidth, height: labelHeight }]}>
            {/* Product Name */}
            <Text style={styles.productName}>
              {label.productName}
            </Text>

            {/* Barcode Image */}
            <Image
              style={[styles.barcodeImage, { width: labelWidth - 24 }]}
              src={label.barcodeDataUrl}
            />

            {/* SKU */}
            <Text style={styles.sku}>{label.sku}</Text>

            {/* Price */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{fmt(label.price, label.currency)}</Text>
            </View>

            {/* Optional Batch */}
            {label.batchLabel && (
              <Text style={styles.batch}>{label.batchLabel}</Text>
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}

// ── Usage helper ─────────────────────────────────────────────────────────
// To generate barcode as data URL from react-barcode:
//
// import Barcode from 'react-barcode'
// import { renderToStaticMarkup } from 'react-dom/server'
//
// Or use a canvas approach:
// const canvas = document.createElement('canvas')
// // (render barcode to canvas via JsBarcode or similar)
// const dataUrl = canvas.toDataURL('image/png')
