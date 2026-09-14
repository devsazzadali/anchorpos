"use server"

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server"

export async function processCheckout(payload: any) {
  try {
    const supabaseUser = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !user) {
      throw new Error("Unauthorized. Please log in again.")
    }

    const adminDb = createSupabaseAdminClient()

    // 1. Fetch user's business_id
    const { data: profile, error: profileError } = await (adminDb
      .from('user_profiles' as any) as any)
      .select('business_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.business_id) {
      throw new Error("Could not find associated business account.")
    }

    const business_id = profile.business_id

    // 2. Fetch user's location_id (defaulting to the first one available)
    const { data: locations, error: locationError } = await (adminDb
      .from('user_locations' as any) as any)
      .select('location_id')
      .eq('user_id', user.id)
      .limit(1)

    if (locationError || !locations || locations.length === 0) {
      throw new Error("Could not find a valid business location for this user.")
    }

    const location_id = locations[0].location_id

    // 3. Create the sell record
    const {
      invoiceNo,
      customer_id, // we might need to pass this from frontend
      subtotal,
      tax,
      discount,
      grandTotal,
      tendered,
      change,
      paymentMethod,
      items
    } = payload

    const { data: sellRecord, error: sellError } = await (adminDb
      .from('sells' as any) as any)
      .insert({
        business_id,
        location_id,
        customer_id: customer_id || null, // null means Walk-in
        commission_agent_id: user.id,
        invoice_no: invoiceNo,
        status: 'final',
        payment_status: tendered >= grandTotal ? 'paid' : (tendered > 0 ? 'partial' : 'due'),
        subtotal: subtotal,
        tax_amount: tax,
        discount_amount: discount,
        grand_total: grandTotal,
        amount_paid: tendered,
        change_amount: change,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (sellError || !sellRecord) {
      console.error("Sell Insert Error:", sellError)
      throw new Error("Failed to record the transaction.")
    }

    // 4. Create the sell lines
    const sellLines = items.map((item: any) => ({
      sell_id: sellRecord.id,
      product_id: item.product_id,
      variation_id: item.variation_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price, // paise
      subtotal: item.subtotal, // paise
    }))

    const { error: linesError } = await (adminDb
      .from('sell_lines' as any) as any)
      .insert(sellLines)

    if (linesError) {
      console.error("Sell Lines Insert Error:", linesError)
      // Note: A true transaction would rollback `sells` here. 
      // For this prototype, we log the error.
      throw new Error("Failed to record transaction items.")
    }

    // 4.5. Deduct stock (Insert into stock_movements)
    const stockMovements = items.map((item: any) => ({
      business_id,
      product_id: item.product_id,
      variation_id: item.variation_id || null,
      location_id,
      quantity: -item.quantity, // Negative for stock OUT
      unit_cost: item.unit_price, // Assuming unit price for now
      movement_type: 'SALE',
      reference_id: sellRecord.id,
      reference_type: 'sells',
      created_by: user.id
    }))

    const { error: stockError } = await (adminDb
      .from('stock_movements' as any) as any)
      .insert(stockMovements)
      
    if (stockError) {
      console.error("Stock Movement Error:", stockError)
      // Do not throw to prevent blocking the UI, but this should be logged.
    }

    // 5. Create Payment record if tendered > 0
    if (tendered > 0) {
      // Find a default payment account for the business to attach this payment to.
      // We will skip this complex lookup for the prototype and just insert directly into `sell_payments`.
      // Actually, sell_payments requires `account_id` which is a NOT NULL foreign key.
      // Let's lookup the first payment account for this business.
      const { data: accounts } = await (adminDb
        .from('payment_accounts' as any) as any)
        .select('id')
        .eq('business_id', business_id)
        .limit(1)
      
      if (accounts && accounts.length > 0) {
        await (adminDb.from('sell_payments' as any) as any).insert({
          sell_id: sellRecord.id,
          business_id,
          account_id: accounts[0].id,
          amount: Math.min(tendered, grandTotal), // record actual payment vs grand total
          method: paymentMethod,
          created_by: user.id
        })
      }
    }

    return { success: true, sellId: sellRecord.id }

  } catch (error: any) {
    console.error("Checkout Server Action Error:", error)
    return { success: false, error: error.message }
  }
}
