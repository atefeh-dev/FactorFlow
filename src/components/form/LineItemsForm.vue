<script setup lang="ts">
import { ref } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import { useInvoiceTotals } from "../../composables/useInvoiceTotals";
import { currencyLabel, formatAmount } from "../../utils/formatters";
import LineItemCard from "./LineItemCard.vue";

const store = useInvoiceStore();
const { lineTotals, totals } = useInvoiceTotals();
const lastAddedId = ref<string | null>(null);

function handleAddRow() {
  lastAddedId.value = store.addLineItem();
}
</script>

<template>
  <div class="line-items">
    <div class="currency-switch" role="group" aria-label="واحد پول">
      <button
        type="button"
        class="currency-switch__option"
        :class="{ 'currency-switch__option--active': store.currency === 'toman' }"
        @click="store.setCurrency('toman')"
      >
        تومان
      </button>
      <button
        type="button"
        class="currency-switch__option"
        :class="{ 'currency-switch__option--active': store.currency === 'rial' }"
        @click="store.setCurrency('rial')"
      >
        ریال
      </button>
    </div>

    <div class="line-items__list">
      <LineItemCard
        v-for="(row, index) in store.lineItems"
        :key="row.id"
        :row="row"
        :index="index"
        :line-totals="lineTotals[row.id]"
        :default-open="row.id === lastAddedId"
        :auto-focus-description="row.id === lastAddedId"
      />
    </div>

    <button type="button" class="add-row" @click="handleAddRow">
      <span class="add-row__icon" aria-hidden="true">+</span>
      افزودن ردیف
    </button>

    <div class="summary">
      <div class="summary__item">
        <span>جمع کل</span>
        <span class="ltr-nums">{{ formatAmount(totals.totalAmount, store.currency) || "0" }} {{ currencyLabel(store.currency) }}</span>
      </div>
      <div class="summary__item">
        <span>تخفیف</span>
        <span class="ltr-nums">{{ formatAmount(totals.totalDiscount, store.currency) || "0" }} {{ currencyLabel(store.currency) }}</span>
      </div>
      <div class="summary__item">
        <span>مالیات و عوارض</span>
        <span class="ltr-nums">{{ formatAmount(totals.totalVat, store.currency) || "0" }} {{ currencyLabel(store.currency) }}</span>
      </div>
      <div class="summary__item summary__item--total">
        <span>جمع کل نهایی</span>
        <span class="ltr-nums">{{ formatAmount(totals.grandTotal, store.currency) || "0" }} {{ currencyLabel(store.currency) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-items {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.line-items__list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.currency-switch {
  align-self: flex-start;
  display: inline-flex;
  padding: 2px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--surface-muted);
  gap: 2px;
}

.currency-switch__option {
  border: none;
  background: transparent;
  color: var(--ink-muted);
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
}

.currency-switch__option--active {
  background: #111111;
  color: #fff;
}

.add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  border: none;
  color: #ffffff;
  background: #111111;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  transition: background 0.15s ease;
}

.add-row:hover {
  background: #2b2b2b;
}

.add-row__icon {
  font-size: 14px;
  line-height: 1;
}

.summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px 14px;
  padding: 7px;
  border-top: 1px dashed var(--line);
  margin-top: 2px;
}

.summary__item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--ink-muted);
}

.summary__item--total {
  grid-column: 1 / -1;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  border-top: 1px solid var(--line);
  padding-top: 3px;
  margin-top: 2px;
}
</style>
