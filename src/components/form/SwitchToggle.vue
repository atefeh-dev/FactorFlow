<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label?: string;
  /** Accessible name + tooltip used when there's no visible label. */
  title?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

function toggle() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <label class="switch-row">
    <span v-if="label" class="switch-row__label">{{ label }}</span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label ? undefined : title"
      :title="title"
      class="switch"
      :class="{ 'switch--on': modelValue }"
      @click="toggle"
    >
      <span class="switch__thumb" />
    </button>
  </label>
</template>

<style scoped>
.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.switch-row__label {
  font-size: 10.5px;
  color: var(--ink-muted);
  font-weight: 500;
}

.switch {
  width: 30px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface-muted);
  position: relative;
  padding: 0;
  transition: background var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard), transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.switch:active {
  transform: scale(0.94);
}

.switch--on {
  background: #111111;
  border-color: #111111;
}

.switch__thumb {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform var(--duration-base) var(--ease-out);
}

.switch--on .switch__thumb {
  transform: translateX(-12px);
}
</style>
