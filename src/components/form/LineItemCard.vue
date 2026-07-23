<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import { currencyLabel, formatAmount } from "../../utils/formatters";
import type { InvoiceLineItem, LineItemTotals } from "../../types/invoice.types";
import AmountField from "./AmountField.vue";
import SwitchToggle from "./SwitchToggle.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = withDefaults(
  defineProps<{
    row: InvoiceLineItem;
    index: number;
    lineTotals: LineItemTotals;
    defaultOpen?: boolean;
    autoFocusDescription?: boolean;
  }>(),
  { defaultOpen: false, autoFocusDescription: false }
);

const store = useInvoiceStore();
const isOpen = ref(props.defaultOpen);
const isRemoveConfirmOpen = ref(false);
const inner = ref<HTMLElement | null>(null);
const descriptionInput = ref<HTMLInputElement | null>(null);

const discountExceedsTotal = computed(
  () => props.lineTotals.totalAmount > 0 && props.row.discount > props.lineTotals.totalAmount
);

// Same measured-height technique as CollapsibleSection: grid-template-rows
// 0fr/1fr silently breaks once this card is itself nested inside another
// animating collapsible (its "1fr" track is measured against a parent
// whose own height is mid-transition), so height is driven from JS instead.
onMounted(() => {
  if (inner.value) inner.value.style.height = isOpen.value ? "auto" : "0px";
  // A brand-new row opens straight into its (now full-width, no-longer
  // cramped) description field — description used to be editable directly
  // in the collapsed header, so this keeps quick entry just as fast now
  // that it's moved into the expanded body where it belongs.
  if (props.defaultOpen && props.autoFocusDescription) descriptionInput.value?.focus();
});

/** An untouched blank row (still at defaults) can be removed without asking. */
function hasData(row: InvoiceLineItem): boolean {
  return row.description.trim() !== "" || row.itemId.trim() !== "" || row.unitPrice !== 0;
}

function requestRemove() {
  if (hasData(props.row)) {
    isRemoveConfirmOpen.value = true;
  } else {
    store.removeLineItem(props.row.id);
  }
}

function confirmRemove() {
  store.removeLineItem(props.row.id);
  isRemoveConfirmOpen.value = false;
}

function toggleOpen() {
  const el = inner.value;
  if (!el) {
    isOpen.value = !isOpen.value;
    return;
  }

  if (isOpen.value) {
    el.style.height = `${el.scrollHeight}px`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.height = "0px";
      });
    });
    isOpen.value = false;
  } else {
    isOpen.value = true;
    el.style.height = "0px";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.height = `${el.scrollHeight}px`;
      });
    });
    const onDone = (e: TransitionEvent) => {
      if (e.propertyName !== "height") return;
      el.style.height = "auto";
      el.removeEventListener("transitionend", onDone);
    };
    el.addEventListener("transitionend", onDone);
  }
}

function onFieldInput(key: keyof InvoiceLineItem, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = key === "quantity" ? target.valueAsNumber || 0 : target.value;
  store.updateLineItem(props.row.id, { [key]: value } as Partial<InvoiceLineItem>);
}

function setAmount(key: "unitPrice" | "discount" | "vatAmount", value: number) {
  store.updateLineItem(props.row.id, { [key]: value });
}
</script>

<template>
  <div class="card" :class="{ 'card--open': isOpen, 'card--hidden': !row.visible }">
    <div class="card__summary" role="button" tabindex="0" :aria-expanded="isOpen" @click="toggleOpen" @keydown.enter="toggleOpen" @keydown.space.prevent="toggleOpen">
      <button
        type="button"
        class="card__toggle"
        :aria-expanded="isOpen"
        :title="isOpen ? 'بستن جزئیات' : 'برای تکمیل فرم کلیک کنید'"
        @click.stop="toggleOpen"
      >
        <span class="card__toggle-text">{{ isOpen ? 'بستن' : 'جزئیات' }}</span>
        <svg class="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <span class="card__index">{{ index + 1 }}</span>
      <span v-if="discountExceedsTotal" class="card__warning-dot" title="تخفیف نامعتبر" aria-hidden="true" />

      <span class="card__title">{{ row.description.trim() }}</span>

      <SwitchToggle
        class="card__visible-switch"
        :model-value="row.visible"
        title="نمایش در پیش‌نمایش"
        @update:model-value="(v) => store.updateLineItem(row.id, { visible: v })"
        @click.stop
      />

      <button
        type="button"
        class="card__remove"
        title="حذف ردیف"
        @click.stop="requestRemove"
      >
        ×
      </button>
    </div>

    <div class="card__subline" @click="toggleOpen">
      <span class="card__subline-item">
        تعداد:
        <input
          class="card__qty ltr-nums"
          type="number"
          title="تعداد"
          :value="row.quantity"
          @input="(e) => onFieldInput('quantity', e)"
          @click.stop
        />
      </span>
      <span class="card__total ltr-nums">{{ formatAmount(lineTotals.amountAfterDiscountAndVat, store.currency) || "0" }} {{ currencyLabel(store.currency) }}</span>
    </div>

    <div ref="inner" class="card__body">
      <div class="card__inner">
        <label class="text-field">
          <span class="text-field__label">شرح کالا یا خدمت</span>
          <input
            ref="descriptionInput"
            class="text-field__input"
            placeholder="شرح کالا یا خدمت را وارد کنید"
            :value="row.description"
            @input="(e) => onFieldInput('description', e)"
          />
        </label>

        <label class="text-field">
          <span class="text-field__label">شناسه کالا یا خدمت</span>
          <input
            class="text-field__input"
            :value="row.itemId"
            @input="(e) => onFieldInput('itemId', e)"
          />
        </label>

        <AmountField
          label="مبلغ واحد"
          :model-value="row.unitPrice"
          :currency="store.currency"
          @update:model-value="(v) => setAmount('unitPrice', v)"
        />

        <AmountField
          label="تخفیف"
          :model-value="row.discount"
          :currency="store.currency"
          :invalid="discountExceedsTotal"
          :caption="discountExceedsTotal ? 'تخفیف نمی‌تواند بیشتر از مبلغ کل ردیف باشد' : ''"
          @update:model-value="(v) => setAmount('discount', v)"
        />

        <AmountField
          label="مالیات و عوارض ارزش افزوده"
          :model-value="row.vatAmount"
          :currency="store.currency"
          @update:model-value="(v) => setAmount('vatAmount', v)"
        />

        <div class="card__divider" />

        <AmountField
          label="مبلغ کل"
          :model-value="lineTotals.totalAmount"
          :currency="store.currency"
          readonly
          caption="بر اساس تعداد × مبلغ واحد محاسبه می‌شود"
        />

        <AmountField
          label="مبلغ کل پس از تخفیف"
          :model-value="lineTotals.amountAfterDiscount"
          :currency="store.currency"
          readonly
          caption="بر اساس مبلغ کل و تخفیف محاسبه می‌شود"
        />

        <AmountField
          label="جمع کل پس از تخفیف و مالیات"
          :model-value="lineTotals.amountAfterDiscountAndVat"
          :currency="store.currency"
          readonly
          emphasize
          caption="بر اساس مبلغ پس از تخفیف و مالیات محاسبه می‌شود"
        />
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-if="isRemoveConfirmOpen"
    title="حذف ردیف"
    message="این ردیف و اطلاعات وارد شده در آن حذف خواهد شد. این عمل قابل بازگشت نیست."
    confirm-label="حذف"
    @confirm="confirmRemove"
    @cancel="isRemoveConfirmOpen = false"
  />
</template>

<style scoped>
.card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  overflow: hidden;
  transition: border-color var(--duration-base) var(--ease-standard), opacity var(--duration-base) var(--ease-standard);
}

.card--open {
  border-color: var(--line-strong);
}

.card--open .card__toggle {
  background: #111111;
  border-color: #111111;
  color: #ffffff;
}

.card--hidden {
  opacity: 0.55;
}

.card--hidden .card__title {
  text-decoration: line-through;
  text-decoration-color: var(--ink-muted);
}

.card__summary {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px 2px;
  cursor: pointer;
  border-radius: 6px;
  transition: background var(--duration-base) var(--ease-standard);
}

.card__summary:hover,
.card__summary:focus-visible {
  background: var(--surface-muted);
}

.card__summary:focus-visible {
  outline: 2px solid #111111;
  outline-offset: -2px;
}

.card__index {
  flex: 0 0 auto;
  width: 15px;
  text-align: center;
  font-size: 10.5px;
  color: var(--ink-muted);
}

.card__warning-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
}

.card__title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  padding: 3px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card__toggle {
  flex: 0 0 auto;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  height: 21px;
  padding: 0 7px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  transition: background var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard);
}

.card__toggle-text {
  white-space: nowrap;
}

.card__remove {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard);
}

.card__visible-switch {
  flex: 0 0 auto;
}

.card__toggle:hover {
  background: var(--surface-muted);
  border-color: var(--line-strong);
}

.card--open .card__toggle:hover {
  background: #2b2b2b;
  border-color: #2b2b2b;
  color: #ffffff;
}

.card__remove:hover {
  background: var(--surface-muted);
}

.card__remove {
  color: #111111;
  font-size: 14px;
}

.chevron {
  display: inline-block;
  transition: transform var(--duration-base) var(--ease-out);
}

.card--open .chevron {
  transform: rotate(180deg);
}

.card__subline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  padding: 0 7px 5px;
  cursor: pointer;
}

.card__subline-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--ink-muted);
  white-space: nowrap;
}

.card__qty {
  width: 30px;
  border: 1px solid var(--line);
  border-radius: 3px;
  text-align: center;
  padding: 2px;
  font-size: 10.5px;
  direction: ltr;
  background: var(--surface);
}

.card__total {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
}

.card__body {
  overflow: hidden;
  transition: height var(--duration-base) var(--ease-out);
}

.card__inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 8px 10px;
  border-top: 1px solid var(--line);
}

.text-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.text-field__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
}

.text-field__input {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  background: var(--surface);
  outline: none;
}

.text-field__input:focus {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
}

.card__divider {
  border-top: 1px dashed var(--line);
  margin: 2px 0;
}
</style>
