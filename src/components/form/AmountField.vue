<script setup lang="ts">
import { computed } from "vue";
import type { Currency } from "../../types/invoice.types";
import { currencyLabel, fromDisplayAmount, toDisplayAmount } from "../../utils/formatters";

const props = withDefaults(
  defineProps<{
    label: string;
    /** Always in the canonical Toman storage unit, regardless of `currency`. */
    modelValue: number;
    currency?: Currency;
    readonly?: boolean;
    caption?: string;
    emphasize?: boolean;
    /** Set to false when a switch/heading above already states this field's name. */
    showLabel?: boolean;
  }>(),
  { currency: "toman", readonly: false, caption: "", emphasize: false, showLabel: true }
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const suffix = computed(() => currencyLabel(props.currency));
const displayValue = computed(() => toDisplayAmount(props.modelValue, props.currency));

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", fromDisplayAmount(target.valueAsNumber || 0, props.currency));
}
</script>

<template>
  <div class="amount-field" :class="{ 'amount-field--readonly': readonly }">
    <span v-if="showLabel" class="amount-field__label">{{ label }}</span>

    <div class="amount-field__control">
      <input
        class="amount-field__input ltr-nums"
        :class="{ 'amount-field__input--emphasize': emphasize }"
        type="number"
        :readonly="readonly"
        :tabindex="readonly ? -1 : 0"
        :value="displayValue"
        :aria-label="showLabel ? undefined : label"
        @input="onInput"
      />
      <span class="amount-field__suffix">{{ suffix }}</span>
    </div>

    <p v-if="caption" class="amount-field__caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.amount-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.amount-field__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
}

.amount-field__control {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.amount-field__control:focus-within {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
}

.amount-field__input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 6px 8px;
  font-size: 12px;
  direction: ltr;
  text-align: right;
}

.amount-field__input--emphasize {
  font-weight: 700;
}

.amount-field__suffix {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 8px;
  background: var(--surface-muted);
  border-right: 1px solid var(--line);
  font-size: 10px;
  color: var(--ink-muted);
  font-weight: 600;
}

.amount-field--readonly .amount-field__control {
  background: var(--surface-muted);
}

.amount-field--readonly .amount-field__input {
  color: var(--ink);
  cursor: default;
}

.amount-field__caption {
  margin: 0;
  font-size: 10px;
  color: var(--ink-muted);
  line-height: 1.35;
}
</style>
