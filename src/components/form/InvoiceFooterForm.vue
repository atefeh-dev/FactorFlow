<script setup lang="ts">
import { computed } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import { useInvoiceTotals } from "../../composables/useInvoiceTotals";
import { currencyLabel, formatAmount } from "../../utils/formatters";
import AmountField from "./AmountField.vue";
import FieldInput from "./FieldInput.vue";
import SwitchToggle from "./SwitchToggle.vue";
import JalaliDatePicker from "./JalaliDatePicker.vue";

const store = useInvoiceStore();
const { totals } = useInvoiceTotals();

const roundingDiscountExceedsTotal = computed(
  () => totals.value.grandTotal > 0 && store.footer.roundingDiscount > totals.value.grandTotal
);
</script>

<template>
  <div class="footer-form">
    <div class="row">
      <label class="field">
        <span class="field__label">روش پرداخت</span>
        <div class="radio-row">
          <label class="radio">
            <input
              type="radio"
              name="paymentMethod"
              :checked="store.footer.paymentMethod === 'cash'"
              @change="store.updateFooter({ paymentMethod: 'cash' })"
            />
            نقدی
          </label>
          <label class="radio">
            <input
              type="radio"
              name="paymentMethod"
              :checked="store.footer.paymentMethod === 'noncash'"
              @change="store.updateFooter({ paymentMethod: 'noncash' })"
            />
            غیرنقدی
          </label>
        </div>
      </label>

      <div class="field field--readonly">
        <span class="field__label">جمع کل پس از کسر تخفیف با احتساب مالیات و عوارض</span>
        <div class="field__static ltr-nums">{{ formatAmount(totals.finalTotal, store.currency) || "0" }} {{ currencyLabel(store.currency) }}</div>
      </div>
    </div>

    <div class="optional-row">
      <SwitchToggle
        label="تخفیف کسر رندی فاکتور"
        :model-value="store.optional.roundingDiscount"
        @update:model-value="(v) => store.updateOptional({ roundingDiscount: v })"
      />
      <AmountField
        v-if="store.optional.roundingDiscount"
        label="تخفیف کسر رندی فاکتور"
        :show-label="false"
        :model-value="store.footer.roundingDiscount"
        :currency="store.currency"
        :invalid="roundingDiscountExceedsTotal"
        :caption="roundingDiscountExceedsTotal ? 'این مقدار از جمع کل فاکتور بیشتر است' : ''"
        @update:model-value="(v) => store.updateFooter({ roundingDiscount: v })"
      />
    </div>

    <div class="optional-row">
      <SwitchToggle
        label="هزینه ارسال (باربری)"
        :model-value="store.optional.shippingCost"
        @update:model-value="(v) => store.updateOptional({ shippingCost: v })"
      />
      <AmountField
        v-if="store.optional.shippingCost"
        label="هزینه ارسال (باربری)"
        :show-label="false"
        :model-value="store.footer.shippingCost"
        :currency="store.currency"
        @update:model-value="(v) => store.updateFooter({ shippingCost: v })"
      />
    </div>

    <div class="optional-row">
      <SwitchToggle
        label="توضیحات"
        :model-value="store.optional.notes"
        @update:model-value="(v) => store.updateOptional({ notes: v })"
      />
      <label v-if="store.optional.notes" class="field">
        <span class="field__label sr-only">توضیحات</span>
        <textarea
          class="field__input field__textarea"
          rows="2"
          :value="store.footer.notes"
          @input="(e) => store.updateFooter({ notes: (e.target as HTMLTextAreaElement).value })"
        />
      </label>
    </div>

    <div class="optional-row">
      <SwitchToggle
        label="اطلاعات پرداخت (بانک)"
        :model-value="store.optional.bankInfo"
        @update:model-value="(v) => store.updateOptional({ bankInfo: v })"
      />
      <div v-if="store.optional.bankInfo" class="bank-grid">
        <FieldInput
          label="بانک"
          :model-value="store.footer.bank.bankName"
          @update:model-value="(v) => store.updateBankInfo({ bankName: String(v) })"
        />
        <FieldInput
          label="به نام"
          :model-value="store.footer.bank.accountHolderName"
          @update:model-value="(v) => store.updateBankInfo({ accountHolderName: String(v) })"
        />
        <FieldInput
          label="شماره حساب"
          :model-value="store.footer.bank.accountNumber"
          @update:model-value="(v) => store.updateBankInfo({ accountNumber: String(v) })"
        />
        <FieldInput
          label="شماره کارت"
          :model-value="store.footer.bank.cardNumber"
          @update:model-value="(v) => store.updateBankInfo({ cardNumber: String(v) })"
        />
        <FieldInput
          label="شماره شبا"
          :model-value="store.footer.bank.shabaNumber"
          @update:model-value="(v) => store.updateBankInfo({ shabaNumber: String(v) })"
        />
      </div>
    </div>

    <div class="signature-grid">
      <FieldInput
        label="مهر و امضای فروشنده — نام"
        :model-value="store.footer.sellerSignature.name"
        @update:model-value="(v) => store.updateSignature('seller', { name: String(v) })"
      />
      <label class="field">
        <span class="field__label">تاریخ</span>
        <JalaliDatePicker
          :model-value="store.footer.sellerSignature.date"
          @update:model-value="(v) => store.updateSignature('seller', { date: v })"
        />
      </label>
    </div>

    <div class="signature-grid">
      <FieldInput
        label="مهر و امضای خریدار — نام"
        :model-value="store.footer.buyerSignature.name"
        @update:model-value="(v) => store.updateSignature('buyer', { name: String(v) })"
      />
      <label class="field">
        <span class="field__label">تاریخ</span>
        <JalaliDatePicker
          :model-value="store.footer.buyerSignature.date"
          @update:model-value="(v) => store.updateSignature('buyer', { date: v })"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.footer-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 7px;
}

.optional-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 7px;
  border-top: 1px dashed var(--line);
}

.bank-grid {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.signature-grid {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field__label {
  font-size: 10.5px;
  color: var(--ink-muted);
  font-weight: 500;
}

.field__input {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 5px 7px;
  background: var(--surface);
  outline: none;
  transition: border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard);
  width: 100%;
  font-size: 11.5px;
}

.field__input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.field__textarea {
  resize: vertical;
  font-family: inherit;
}

.field__static {
  border: 1px dashed var(--line);
  border-radius: var(--radius);
  padding: 5px 7px;
  background: var(--surface-muted);
  font-weight: 700;
  font-size: 11.5px;
}

.radio-row {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 26px;
}

.radio {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
