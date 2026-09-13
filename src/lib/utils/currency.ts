import Decimal from 'decimal.js';

const DEFAULT_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '৳';

export function formatCurrency(paise: number, symbol: string = DEFAULT_CURRENCY_SYMBOL): string {
  const amount = new Decimal(paise).dividedBy(100).toFixed(2);
  const formatted = Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${formatted}`;
}

export function toBDTPaise(amount: number | string): number {
  const cleaned = String(amount).replace(/,/g, '');
  return new Decimal(cleaned).times(100).round().toNumber();
}

export function parseAmountInput(input: string): number {
  const cleaned = input.replace(/[৳,\s]/g, '');
  if (!cleaned || isNaN(Number(cleaned))) return 0;
  return toBDTPaise(cleaned);
}

export function calculateTax(amountPaise: number, ratePercent: number, method: 'exclusive' | 'inclusive' = 'exclusive') {
  if (ratePercent === 0) return { taxAmount: 0, totalWithTax: amountPaise };
  const base = new Decimal(amountPaise);
  const rate = new Decimal(ratePercent).dividedBy(100);
  if (method === 'exclusive') {
    const taxAmount = base.times(rate).round().toNumber();
    return { taxAmount, totalWithTax: amountPaise + taxAmount };
  } else {
    const taxAmount = base.minus(base.dividedBy(rate.plus(1))).round().toNumber();
    return { taxAmount, totalWithTax: amountPaise };
  }
}

export function calculateDiscountPct(amountPaise: number, discountPct: number): number {
  if (discountPct <= 0) return 0;
  return new Decimal(amountPaise).times(discountPct).dividedBy(100).round().toNumber();
}

export function paise_to_display(paise: number): string {
  return new Decimal(paise).dividedBy(100).toFixed(2);
}

export function addPaise(a: number, b: number): number {
  return new Decimal(a).plus(b).toNumber();
}

export function computeLineTotal(params: { quantity: number; unitPricePaise: number; discountAmountPaise: number; taxAmountPaise: number; }): number {
  const { quantity, unitPricePaise, discountAmountPaise, taxAmountPaise } = params;
  return new Decimal(quantity).times(unitPricePaise).minus(discountAmountPaise).plus(taxAmountPaise).round().toNumber();
}
