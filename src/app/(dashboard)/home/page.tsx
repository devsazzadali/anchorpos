import { createSupabaseServerClient } from "@/lib/supabase/server"
import HomeClient, { DashboardData } from "./HomeClient"

export default async function HomePage() {
  const supabase = createSupabaseServerClient()

  // 1. Authenticate user and get their business_id (using RLS for safety)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // If not authenticated, redirect or handle. Middleware should catch this, but just in case.
    return <div>Unauthorized</div>
  }

  // 2. Fetch Aggregations (Basic real data fetch)
  // In a real app, these would be RPC calls or complex aggregates. We'll do basic counts for now.
  const { data: sellsData } = await supabase.from('sells').select('final_total, created_at, invoice_no, payment_status, contact_id')
  const { data: purchasesData } = await supabase.from('purchases').select('final_total')
  const { data: expensesData } = await supabase.from('expenses').select('final_total')
  const { data: productsData } = await supabase.from('products').select('name, sku')

  // Calculate totals
  const totalSales = sellsData?.reduce((acc: number, curr: any) => acc + (curr.final_total || 0), 0) || 0
  const totalPurchases = purchasesData?.reduce((acc: number, curr: any) => acc + (curr.final_total || 0), 0) || 0
  const totalExpense = expensesData?.reduce((acc: number, curr: any) => acc + (curr.final_total || 0), 0) || 0
  const netProfit = totalSales - totalPurchases - totalExpense

  // Recent Sales
  const recentSalesRaw = sellsData ? sellsData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) : []
  const RECENT_SALES = recentSalesRaw.map((sale: any) => ({
    invoiceNo: sale.invoice_no || "N/A",
    customer: "Walk-In Customer", // We'd join with contacts table in a real query
    total: sale.final_total || 0,
    status: sale.payment_status || "paid",
    time: new Date(sale.created_at).toLocaleDateString()
  }))

  // Construct Data Object (Filling missing charts with dummy layout for now until full RPCs are made)
  const data: DashboardData = {
    KPIs: {
      totalSales,
      netProfit,
      totalPurchases,
      totalExpense,
      closingStockCost: 0,
      closingStockRetail: 0,
      salesChange: 0,
      profitChange: 0,
      purchasesChange: 0,
      expenseChange: 0,
    },
    SALES_VS_PURCHASES: [
      { day: "Mon", sales: totalSales * 0.2, purchases: totalPurchases * 0.1 },
      { day: "Tue", sales: totalSales * 0.3, purchases: totalPurchases * 0.2 },
      { day: "Wed", sales: totalSales * 0.5, purchases: totalPurchases * 0.7 },
    ],
    MONTHLY_REVENUE: [
      { month: "Jan", revenue: totalSales * 0.1 },
      { month: "Feb", revenue: totalSales * 0.4 },
      { month: "Mar", revenue: totalSales * 0.5 },
    ],
    TOP_PRODUCTS: productsData ? productsData.slice(0, 3).map((p: any) => ({ name: p.name, sku: p.sku, revenue: 0, qty: 0 })) : [],
    STOCK_EXPIRY_ALERTS: [],
    PENDING_SHIPMENTS: [],
    RECENT_SALES
  }

  return <HomeClient data={data} />
}
