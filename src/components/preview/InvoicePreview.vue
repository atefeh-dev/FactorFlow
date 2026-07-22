<script setup lang="ts">
import { computed } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import { useInvoiceTotals } from "../../composables/useInvoiceTotals";
import { currencyLabel, formatAmount, formatRial } from "../../utils/formatters";

const store = useInvoiceStore();
const { lineTotals, totals } = useInvoiceTotals();

const partyRows = computed(() => [
  { label: "فروشنده", party: store.seller },
  { label: "خریدار", party: store.buyer },
]);

const curLabel = computed(() => currencyLabel(store.currency));

function dash(value: string): string {
  return value.trim() || "—";
}

function money(value: number | null | undefined): string {
  return formatAmount(value, store.currency);
}
</script>

<template>
  <div class="sheet">
    <header class="sheet__head">
      <div v-if="store.optional.logo" class="sheet__logo">
        <img v-if="store.logoDataUrl" :src="store.logoDataUrl" alt="لوگو" class="sheet__logo-img" />
        <div v-else class="sheet__logo-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
            <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M21 15l-5-5-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <div class="sheet__heading">
        <h1 class="sheet__title">صورت حساب الکترونیکی فروش</h1>
        <p v-if="store.optional.headerNotes && store.header.notes" class="sheet__notes">
          {{ store.header.notes }}
        </p>
      </div>

      <div class="sheet__meta">
        <div><span class="meta-label">شماره فاکتور:</span> <span class="ltr-nums">{{ dash(store.header.invoiceNumber) }}</span></div>
        <div><span class="meta-label">تاریخ:</span> <span class="ltr-nums">{{ dash(store.header.date) }}</span></div>
      </div>
    </header>

    <table
      v-for="row in partyRows"
      :key="row.label"
      class="party-table"
    >
      <tbody>
        <tr>
          <td rowspan="3" class="party-table__label"><span class="rotated">{{ row.label }}</span></td>
          <td class="lbl">نام</td>
          <td class="val">{{ dash(row.party.name) }}</td>
          <td class="lbl">شماره اقتصادی</td>
          <td class="val ltr-nums">{{ dash(row.party.economicNumber) }}</td>
          <td class="lbl">شناسه ملی</td>
          <td class="val ltr-nums">{{ dash(row.party.nationalId) }}</td>
          <td class="lbl">شماره ثبت</td>
          <td class="val ltr-nums">{{ dash(row.party.registrationNumber) }}</td>
        </tr>
        <tr>
          <td class="lbl">نشانی</td>
          <td class="val" colspan="7">{{ dash(row.party.address) }}</td>
        </tr>
        <tr>
          <td class="lbl">کد پستی</td>
          <td class="val ltr-nums">{{ dash(row.party.postalCode) }}</td>
          <td class="lbl">تلفن</td>
          <td class="val ltr-nums">{{ dash(row.party.phone) }}</td>
          <td class="lbl">شماره همراه</td>
          <td class="val ltr-nums" colspan="3">{{ dash(row.party.mobile) }}</td>
        </tr>
      </tbody>
    </table>

    <table class="items-preview">
      <thead>
        <tr>
          <th class="col-index">ردیف</th>
          <th>شناسه کالا یا خدمت</th>
          <th class="col-wide">شرح کالا یا خدمت</th>
          <th>تعداد</th>
          <th>مبلغ واحد<br /><small>({{ curLabel }})</small></th>
          <th>مبلغ کل<br /><small>({{ curLabel }})</small></th>
          <th>تخفیف<br /><small>({{ curLabel }})</small></th>
          <th>مبلغ کل پس از تخفیف<br /><small>({{ curLabel }})</small></th>
          <th>جمع مالیات و عوارض ارزش افزوده<br /><small>({{ curLabel }})</small></th>
          <th>جمع کل پس از تخفیف و مالیات و عوارض<br /><small>({{ curLabel }})</small></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in store.lineItems" :key="row.id" :class="{ 'row--hidden': !row.visible }">
          <td class="col-index">{{ index + 1 }}</td>
          <template v-if="row.visible">
            <td>{{ row.itemId }}</td>
            <td class="col-wide align-right">{{ row.description }}</td>
            <td class="ltr-nums">{{ row.quantity || "" }}</td>
            <td class="ltr-nums">{{ money(row.unitPrice) }}</td>
            <td class="ltr-nums">{{ money(lineTotals[row.id]?.totalAmount) }}</td>
            <td class="ltr-nums">{{ money(row.discount) }}</td>
            <td class="ltr-nums">{{ money(lineTotals[row.id]?.amountAfterDiscount) }}</td>
            <td class="ltr-nums">{{ money(row.vatAmount) }}</td>
            <td class="ltr-nums">{{ money(lineTotals[row.id]?.amountAfterDiscountAndVat) }}</td>
          </template>
          <template v-else>
            <td colspan="9" />
          </template>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="10" class="totals-row-label">جمع کل</td>
        </tr>
        <tr class="totals-values">
          <td colspan="3" />
          <td class="ltr-nums">{{ formatRial(totals.totalQuantity) }}</td>
          <td />
          <td class="ltr-nums">{{ money(totals.totalAmount) }}</td>
          <td class="ltr-nums">{{ money(totals.totalDiscount) }}</td>
          <td class="ltr-nums">{{ money(totals.totalAfterDiscount) }}</td>
          <td class="ltr-nums">{{ money(totals.totalVat) }}</td>
          <td class="ltr-nums"><strong>{{ money(totals.grandTotal) }}</strong></td>
        </tr>
      </tfoot>
    </table>

    <table class="footer-table">
      <tbody>
        <tr>
          <td class="footer-label">روش پرداخت :</td>
          <td class="payment-method-cell">
            <span class="check-option">
              <span class="check-box" :class="{ 'check-box--on': store.footer.paymentMethod === 'cash' }" />
              نقدی
            </span>
            <span class="check-option">
              <span class="check-box" :class="{ 'check-box--on': store.footer.paymentMethod === 'noncash' }" />
              غیرنقدی
            </span>
          </td>
          <template v-if="store.optional.roundingDiscount">
            <td class="footer-label">تخفیف کسر رندی فاکتور :</td>
            <td class="ltr-nums">{{ money(store.footer.roundingDiscount) || "0" }} {{ curLabel }}</td>
          </template>
        </tr>
        <tr v-if="store.optional.notes || store.optional.shippingCost">
          <template v-if="store.optional.notes">
            <td class="footer-label">توضیحات :</td>
            <td>{{ store.footer.notes || "—" }}</td>
          </template>
          <template v-else><td colspan="2" /></template>
          <template v-if="store.optional.shippingCost">
            <td class="footer-label">هزینه ارسال (باربری) :</td>
            <td class="ltr-nums">{{ money(store.footer.shippingCost) || "0" }} {{ curLabel }}</td>
          </template>
        </tr>
        <tr>
          <td colspan="2" />
          <td class="footer-label">جمع کل پس از کسر تخفیف با احتساب مالیات و عوارض :</td>
          <td class="ltr-nums"><strong>{{ money(totals.finalTotal) || "0" }} {{ curLabel }}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="closing-strip">
      <div class="signature-block">
        <span class="signature-title">مهر و امضای خریدار</span>
        <div class="signature-line" />
        <span class="signature-name">{{ store.footer.buyerSignature.name || "—" }}</span>
        <span class="signature-date ltr-nums">{{ store.footer.buyerSignature.date }}</span>
      </div>

      <table v-if="store.optional.bankInfo" class="bank-table">
        <tbody>
          <tr>
            <td class="footer-label">بانک :</td>
            <td>{{ store.footer.bank.bankName || "—" }}</td>
            <td class="footer-label">شماره حساب :</td>
            <td class="ltr-nums">{{ store.footer.bank.accountNumber || "—" }}</td>
          </tr>
          <tr>
            <td class="footer-label">به نام :</td>
            <td>{{ store.footer.bank.accountHolderName || "—" }}</td>
            <td class="footer-label">شماره کارت :</td>
            <td class="ltr-nums">{{ store.footer.bank.cardNumber || "—" }}</td>
          </tr>
          <tr>
            <td class="footer-label">شماره شبا :</td>
            <td class="ltr-nums" colspan="3">{{ store.footer.bank.shabaNumber || "—" }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="bank-table-spacer" />

      <div class="signature-block">
        <span class="signature-title">مهر و امضای فروشنده</span>
        <div class="signature-line" />
        <span class="signature-name">{{ store.footer.sellerSignature.name || "—" }}</span>
        <span class="signature-date ltr-nums">{{ store.footer.sellerSignature.date }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet {
  background: #fff;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 28px 32px;
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-size: 12.5px;
}

.sheet__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.sheet__logo {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
}

.sheet__logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sheet__logo-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1.5px dashed var(--line);
  background: #fff;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet__heading {
  text-align: center;
}

.sheet__title {
  font-size: 17px;
  font-weight: 800;
  margin: 6px 0 0;
}

.sheet__notes {
  margin: 6px 0 0;
  font-size: 11.5px;
  color: var(--ink-muted);
  white-space: pre-wrap;
}

.sheet__meta {
  font-size: 12px;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meta-label {
  font-weight: 600;
}

/* Party info tables — mirrors the reference "صورت حساب الکترونیکی فروش"
   layout: a rotated side label ("فروشنده"/"خریدار") plus labelled cells,
   always shown (this is a compliance-driven document, not an optional
   summary), rather than free-form typography blocks. */
.party-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  table-layout: auto;
}

.party-table td {
  border: 1px solid var(--line);
  padding: 5px 7px;
  font-size: 11px;
}

.party-table__label {
  width: 26px;
  background: var(--surface-muted);
  text-align: center;
  padding: 4px;
}

.rotated {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
}

.party-table .lbl {
  background: var(--surface-muted);
  font-weight: 700;
  white-space: nowrap;
  width: 1%;
}

.party-table .val {
  color: var(--ink);
}

.items-preview {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.items-preview th,
.items-preview td {
  border: 1px solid var(--line);
  padding: 5px;
  text-align: center;
  font-size: 11px;
}

.items-preview thead th {
  background: var(--surface-muted);
  font-weight: 700;
}

.items-preview thead small {
  font-weight: 400;
  color: var(--ink-muted);
}

.col-index {
  width: 30px;
  color: var(--ink-muted);
}

.col-wide {
  min-width: 150px;
}

.align-right {
  text-align: right;
}

.totals-row-label {
  background: var(--surface-muted);
  font-weight: 700;
  text-align: center;
}

.row--hidden td {
  background: repeating-linear-gradient(
    45deg,
    var(--surface-muted),
    var(--surface-muted) 6px,
    #fff 6px,
    #fff 12px
  );
}

.totals-values td {
  background: var(--surface-muted);
  font-weight: 600;
}

.footer-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
}

.footer-table td {
  border: 1px solid var(--line);
  padding: 6px 8px;
  font-size: 11.5px;
}

.footer-label {
  background: var(--surface-muted);
  font-weight: 700;
  white-space: nowrap;
  width: 1%;
}

.payment-method-cell {
  display: flex;
  gap: 14px;
}

.check-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.check-box {
  width: 12px;
  height: 12px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  display: inline-block;
}

.check-box--on {
  background: var(--accent);
  border-color: var(--accent);
}

/* Buyer signature (right) — bank/payment info (middle) — seller signature
   (left), matching the reference footer strip exactly. */
.closing-strip {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.signature-block {
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  padding-top: 4px;
}

.signature-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-muted);
}

.signature-line {
  width: 100%;
  border-top: 1px dashed var(--line-strong);
  margin-top: 30px;
}

.signature-name {
  font-size: 11.5px;
  font-weight: 600;
}

.signature-date {
  font-size: 10.5px;
  color: var(--ink-muted);
}

.bank-table {
  flex: 1 1 auto;
  border-collapse: collapse;
  align-self: flex-start;
}

.bank-table td {
  border: 1px solid var(--line);
  padding: 6px 8px;
  font-size: 11px;
}

.bank-table-spacer {
  flex: 1 1 auto;
}

@media print {
  .sheet {
    box-shadow: none;
    border: none;
    max-width: none;
  }
}
</style>
