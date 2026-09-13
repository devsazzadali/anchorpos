"use client"

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { formatCurrency } from '@/lib/utils/currency'

// Create styles for 80mm thermal printer
// 80mm = ~226.77 pt
const styles = StyleSheet.create({
  page: {
    padding: 10,
    width: 226,
    fontFamily: 'Helvetica',
    fontSize: 9,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    marginBottom: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    marginVertical: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  colLeft: {
    flex: 1,
  },
  colRight: {
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemName: {
    flex: 2,
    paddingRight: 5,
  },
  itemQty: {
    width: 25,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 8,
  }
})

interface ReceiptProps {
  business: {
    name: string
    address: string
    phone: string
  }
  invoiceNo: string
  date: string
  cashier: string
  customer?: string
  items: Array<{
    name: string
    qty: number
    price: number
    subtotal: number
  }>
  totals: {
    subtotal: number
    discount: number
    tax: number
    grandTotal: number
    paid: number
    change: number
  }
}

export function ReceiptPDF({ business, invoiceNo, date, cashier, customer, items, totals }: ReceiptProps) {
  return (
    <Document>
      <Page size={[226, 842]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{business.name}</Text>
          <Text style={styles.subtitle}>{business.address}</Text>
          <Text style={styles.subtitle}>Phone: {business.phone}</Text>
        </View>

        <View style={styles.divider} />

        {/* Meta Info */}
        <View style={styles.row}>
          <Text>Inv No: {invoiceNo}</Text>
          <Text>{date}</Text>
        </View>
        <View style={styles.row}>
          <Text>Cashier: {cashier}</Text>
          {customer && <Text>Cust: {customer}</Text>}
        </View>

        <View style={styles.divider} />

        {/* Table Header */}
        <View style={[styles.itemRow, styles.bold]}>
          <Text style={styles.itemName}>Item</Text>
          <Text style={styles.itemQty}>Qty</Text>
          <Text style={styles.itemPrice}>Total</Text>
        </View>

        {/* Line Items */}
        {items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>{item.qty}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.row}>
          <Text>Subtotal</Text>
          <Text>{formatCurrency(totals.subtotal)}</Text>
        </View>
        {totals.discount > 0 && (
          <View style={styles.row}>
            <Text>Discount</Text>
            <Text>-{formatCurrency(totals.discount)}</Text>
          </View>
        )}
        {totals.tax > 0 && (
          <View style={styles.row}>
            <Text>Tax</Text>
            <Text>+{formatCurrency(totals.tax)}</Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={[styles.row, styles.bold, { fontSize: 11 }]}>
          <Text>TOTAL</Text>
          <Text>{formatCurrency(totals.grandTotal)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Payment */}
        <View style={styles.row}>
          <Text>Paid</Text>
          <Text>{formatCurrency(totals.paid)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Change</Text>
          <Text>{formatCurrency(totals.change)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 5, fontSize: 6, color: '#666' }}>Powered by Databyte POS</Text>
        </View>
      </Page>
    </Document>
  )
}
