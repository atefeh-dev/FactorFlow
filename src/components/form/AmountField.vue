<script setup lang="ts">
import { computed } from "vue";
import type { Currency } from "../../types/invoice.types";
import {
  currencyLabel,
  fromDisplayAmount,
  normalizeDigits,
  parseAmountInput,
  toDisplayAmount,
} from "../../utils/formatters";

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
    /** Shows the caption (if any) as a warning instead of a neutral hint. */
    invalid?: boolean;
  }>(),
  {
    currency: "toman",
    readonly: false,
    caption: "",
    emphasize: false,
    showLabel: true,
    invalid: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const suffix = computed(() => currencyLabel(props.currency));

// Live thousand-separators while typing (e.g. "122445568" -> "122,445,568")
// rather than a raw digit string — the read-only preview already formats
// amounts this way, so editable fields being unformatted was an
// inconsistency, and 9-digit Toman amounts are genuinely hard to read
// without separators.
const displayValue = computed(() => {
  const amount = toDisplayAmount(props.modelValue, props.currency);
  if (!amount) return "";
  return new Intl.NumberFormat("en-US").format(amount);
});

const ALLOWED_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Escape",
]);

/**
 * Blocks non-numeric characters at the keystroke itself rather than
 * silently stripping them after the fact — the field should never let a
 * letter/symbol appear at all, per the "reject non-numeric input" goal.
 * Persian/Arabic-indic digits are allowed here (normalized on submit);
 * copy/paste/select-all/undo shortcuts are always allowed through.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) return;
  if (ALLOWED_KEYS.has(event.key)) return;
  if (/^[0-9۰-۹٠-٩]$/.test(event.key)) return;
  event.preventDefault();
}

/**
 * Pasting is the other way invalid characters get into a field — sanitize
 * the clipboard content and splice in only its digits instead of letting
 * the browser paste the raw (possibly non-numeric) text.
 */
function onPaste(event: ClipboardEvent) {
  event.preventDefault();
  const target = event.target as HTMLInputElement;
  const pasted = event.clipboardData?.getData("text") ?? "";
  const sanitized = normalizeDigits(pasted).replace(/[^\d]/g, "");

  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const nextRaw = target.value.slice(0, start) + sanitized + target.value.slice(end);

  emit("update:modelValue", fromDisplayAmount(parseAmountInput(nextRaw), props.currency));
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const parsed = parseAmountInput(target.value);
  emit("update:modelValue", fromDisplayAmount(parsed, props.currency));
}
</script>

<template>
  <div class="amount-field" :class="{ 'amount-field--readonly': readonly }">
    <span v-if="showLabel" class="amount-field__label">{{ label }}</span>

    <div class="amount-field__control" :class="{ 'amount-field__control--invalid': invalid }">
      <input
        class="amount-field__input ltr-nums"
        :class="{ 'amount-field__input--emphasize': emphasize }"
        type="text"
        inputmode="numeric"
        dir="ltr"
        :readonly="readonly"
        :tabindex="readonly ? -1 : 0"
        :value="displayValue"
        :aria-label="showLabel ? undefined : label"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
      />
      <span class="amount-field__suffix">{{ suffix }}</span>
    </div>

    <p v-if="caption" class="amount-field__caption" :class="{ 'amount-field__caption--invalid': invalid }">
      {{ caption }}
    </p>
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
  transition: border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard);
}

.amount-field__control:focus-within {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
}

.amount-field__control--invalid {
  border-color: var(--danger);
}

.amount-field__control--invalid:focus-within {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 15%, transparent);
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

.amount-field__caption--invalid {
  color: var(--danger);
  font-weight: 600;
}
</style>
