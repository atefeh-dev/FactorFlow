<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    modelValue: string | number;
    type?: "text" | "number";
    placeholder?: string;
  }>(),
  { type: "text", placeholder: "" }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit(
    "update:modelValue",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (target as any).type === "number" ? target.valueAsNumber || 0 : target.value
  );
}
</script>

<template>
  <label class="field">
    <span class="field__label">{{ label }}</span>
    <input
      class="field__input"
      :class="{ 'ltr-nums': type === 'number' }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
    />
  </label>
</template>

<style scoped>
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
</style>
