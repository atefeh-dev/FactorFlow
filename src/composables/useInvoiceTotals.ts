import { computed, type ComputedRef } from "vue";
import { useInvoiceStore } from "../stores/invoice.store";
import type { InvoiceTotals, LineItemTotals } from "../types/invoice.types";

/**
 * All amounts on the invoice are derived from line items — never
 * independently stored — so the table and the grand-total banner can
 * never drift out of sync with what the user typed.
 */
export function useInvoiceTotals(): {
  lineTotals: ComputedRef<Record<string, LineItemTotals>>;
  totals: ComputedRef<InvoiceTotals>;
} {
  const store = useInvoiceStore();

  const lineTotals = computed<Record<string, LineItemTotals>>(() => {
    const map: Record<string, LineItemTotals> = {};

    for (const row of store.lineItems) {
      const totalAmount = row.quantity * row.unitPrice;
      const amountAfterDiscount = totalAmount - row.discount;
      const amountAfterDiscountAndVat = amountAfterDiscount + row.vatAmount;

      map[row.id] = {
        totalAmount,
        amountAfterDiscount,
        amountAfterDiscountAndVat,
      };
    }

    return map;
  });

  const totals = computed<InvoiceTotals>(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    for (const row of store.lineItems) {
      if (!row.visible) continue;
      totalQuantity += row.quantity;
      totalAmount += row.quantity * row.unitPrice;
      totalDiscount += row.discount;
      totalVat += row.vatAmount;
    }

    const totalAfterDiscount = totalAmount - totalDiscount;
    const grandTotal = totalAfterDiscount + totalVat;
    const finalTotal =
      grandTotal - store.footer.roundingDiscount + store.footer.shippingCost;

    return {
      totalQuantity,
      totalAmount,
      totalDiscount,
      totalAfterDiscount,
      totalVat,
      grandTotal,
      finalTotal,
    };
  });

  return { lineTotals, totals };
}
