import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { calculateDiscountPct, calculateTax, computeLineTotal } from '@/lib/utils/currency';

// Enable Map/Set support in Immer (required for Map-based cart state)
enableMapSet();


export interface CartItem {
  id: string; // unique ID for cart row (could be product_id + variation_id)
  product_id: string;
  variation_id: string | null;
  name: string;
  quantity: number;
  unit_price: number; // paise
  tax_rate: number;
  tax_method: 'inclusive' | 'exclusive';
  discount_type: 'fixed' | 'percentage';
  discount_value: number; // paise for fixed, % for percentage
  stock_available: number;
  
  // Computed values
  tax_amount: number; // paise
  discount_amount: number; // paise
  subtotal: number; // paise
}

export interface HeldCart {
  id: string;
  time: string;
  customer_name: string;
  items: CartItem[];
  grand_total: number;
}

export interface POSState {
  cart: Map<string, CartItem>;
  customer_id: string | null;
  customer_name: string;
  order_notes: string;
  location_id: string | null;
  held_carts: HeldCart[];
  
  // Global cart modifiers
  global_discount_type: 'fixed' | 'percentage';
  global_discount_value: number;
  shipping_amount: number;
  
  // Computed Totals
  subtotal: number;
  total_tax: number;
  total_discount: number;
  grand_total: number;
  
  // Payment
  amount_paid: number;
  payment_method: 'cash' | 'card' | 'mobile' | 'due';
  
  // Actions
  addItem: (item: Omit<CartItem, 'tax_amount' | 'discount_amount' | 'subtotal'>) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  setCustomer: (id: string | null, name?: string) => void;
  setOrderNotes: (notes: string) => void;
  setLocation: (id: string) => void;
  setGlobalDiscount: (type: 'fixed' | 'percentage', value: number) => void;
  setShipping: (amount: number) => void;
  setPayment: (amount: number, method: POSState['payment_method']) => void;
  holdCurrentCart: () => void;
  restoreHeldCart: (heldId: string) => void;
  deleteHeldCart: (heldId: string) => void;
  clearCart: () => void;
  recompute: () => void;
}


export const usePOSStore = create<POSState>()(
  immer((set, get) => ({
    cart: new Map(),
    customer_id: null,
    customer_name: 'Walk-In Customer',
    order_notes: '',
    location_id: 'BL0001',
    held_carts: [],
    
    global_discount_type: 'fixed',
    global_discount_value: 0,
    shipping_amount: 0,
    
    subtotal: 0,
    total_tax: 0,
    total_discount: 0,
    grand_total: 0,
    
    amount_paid: 0,
    payment_method: 'cash',

    recompute: () => set((state) => { _recompute(state); }),

    addItem: (item) => set((state) => {
      const existing = state.cart.get(item.id);
      if (existing) {
        if (existing.quantity + item.quantity <= existing.stock_available) {
          existing.quantity += item.quantity;
        }
      } else {
        state.cart.set(item.id, {
          ...item,
          tax_amount: 0,
          discount_amount: 0,
          subtotal: 0
        });
      }
      _recompute(state);
    }),

    updateQuantity: (id, qty) => set((state) => {
      const item = state.cart.get(id);
      if (item && qty > 0 && qty <= item.stock_available) {
        item.quantity = qty;
        _recompute(state);
      } else if (item && qty === 0) {
        state.cart.delete(id);
        _recompute(state);
      }
    }),

    removeItem: (id) => set((state) => {
      state.cart.delete(id);
      _recompute(state);
    }),

    setCustomer: (id, name) => set((state) => {
      state.customer_id = id;
      if (name) state.customer_name = name;
    }),

    setOrderNotes: (notes) => set((state) => {
      state.order_notes = notes;
    }),

    setLocation: (id) => set((state) => { state.location_id = id; }),
    
    setGlobalDiscount: (type, value) => set((state) => {
      state.global_discount_type = type;
      state.global_discount_value = value;
      _recompute(state);
    }),
    
    setShipping: (amount) => set((state) => {
      state.shipping_amount = amount;
      _recompute(state);
    }),
    
    setPayment: (amount, method) => set((state) => {
      state.amount_paid = amount;
      state.payment_method = method;
    }),

    holdCurrentCart: () => set((state) => {
      if (state.cart.size === 0) return;
      const held: HeldCart = {
        id: `HOLD-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customer_name: state.customer_name,
        items: Array.from(state.cart.values()),
        grand_total: state.grand_total,
      };
      state.held_carts.unshift(held);
      state.cart.clear();
      state.customer_id = null;
      state.customer_name = 'Walk-In Customer';
      state.order_notes = '';
      state.global_discount_value = 0;
      _recompute(state);
    }),

    restoreHeldCart: (heldId) => set((state) => {
      const heldIndex = state.held_carts.findIndex(h => h.id === heldId);
      if (heldIndex === -1) return;
      const held = state.held_carts[heldIndex];
      state.held_carts.splice(heldIndex, 1);
      state.cart.clear();
      held.items.forEach(item => {
        state.cart.set(item.id, item);
      });
      state.customer_name = held.customer_name;
      _recompute(state);
    }),

    deleteHeldCart: (heldId) => set((state) => {
      state.held_carts = state.held_carts.filter(h => h.id !== heldId);
    }),
    
    clearCart: () => set((state) => {
      state.cart.clear();
      state.customer_id = null;
      state.customer_name = 'Walk-In Customer';
      state.order_notes = '';
      state.global_discount_type = 'fixed';
      state.global_discount_value = 0;
      state.shipping_amount = 0;
      state.amount_paid = 0;
      _recompute(state);
    })
  }))
);

// ── Shared recompute helper (operates on immer draft directly) ─────────────

function _recompute(state: {
  cart: Map<string, CartItem>;
  global_discount_type: 'fixed' | 'percentage';
  global_discount_value: number;
  shipping_amount: number;
  subtotal: number;
  total_tax: number;
  total_discount: number;
  grand_total: number;
}) {
  let newSubtotal = 0;
  let newTotalTax = 0;
  let newTotalDiscount = 0;

  state.cart.forEach((item) => {
    // Line discount
    item.discount_amount = item.discount_type === 'fixed'
      ? item.discount_value
      : calculateDiscountPct(item.unit_price * item.quantity, item.discount_value);

    // Line tax (applied after discount)
    const amountAfterDiscount = (item.unit_price * item.quantity) - item.discount_amount;
    const { taxAmount } = calculateTax(amountAfterDiscount, item.tax_rate, item.tax_method);
    item.tax_amount = taxAmount;

    // Line subtotal
    item.subtotal = computeLineTotal({
      quantity: item.quantity,
      unitPricePaise: item.unit_price,
      discountAmountPaise: item.discount_amount,
      taxAmountPaise: item.tax_amount
    });

    newSubtotal += (item.unit_price * item.quantity);
    newTotalTax += item.tax_amount;
    newTotalDiscount += item.discount_amount;
  });

  // Global discount
  const globalDiscountAmt = state.global_discount_type === 'fixed'
    ? state.global_discount_value
    : calculateDiscountPct(newSubtotal, state.global_discount_value);

  newTotalDiscount += globalDiscountAmt;

  // Grand total = (Subtotal - Total Discount) + Total Tax + Shipping
  state.subtotal = newSubtotal;
  state.total_tax = newTotalTax;
  state.total_discount = newTotalDiscount;
  state.grand_total = (newSubtotal - newTotalDiscount) + newTotalTax + state.shipping_amount;
}

