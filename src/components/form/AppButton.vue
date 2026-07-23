<script setup lang="ts">
withDefaults(
  defineProps<{
    /** solid = filled dark/danger button. outline = bordered white button.
     *  text = no background/border, just colored text (topbar-style). */
    variant?: "solid" | "outline" | "text";
    /** default | muted (dimmed text, e.g. a de-emphasized "text" action) |
     *  danger (destructive actions — red). */
    tone?: "default" | "muted" | "danger";
    /** Full width, centered content — for the dark "+ افزودن ..." actions. */
    block?: boolean;
    /** Simple leading glyph (e.g. "+"). For anything more than a single
     *  character/emoji, use the `icon` slot instead. */
    icon?: string;
    disabled?: boolean;
    /** Shows a spinner in place of the icon and disables the button —
     *  for async actions like PDF export. */
    loading?: boolean;
    /** Replaces the default slot's label while loading (e.g. "در حال ساخت PDF…"). */
    loadingLabel?: string;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "outline",
    tone: "default",
    block: false,
    icon: "",
    disabled: false,
    loading: false,
    loadingLabel: "",
    type: "button",
  }
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="app-btn"
    :class="[
      `app-btn--${variant}`,
      tone !== 'default' && `app-btn--${tone}`,
      { 'app-btn--block': block, 'app-btn--loading': loading },
    ]"
  >
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true" />
    <span v-else-if="icon" class="app-btn__icon" aria-hidden="true">{{ icon }}</span>
    <template v-if="loading && loadingLabel">{{ loadingLabel }}</template>
    <template v-else>
      <slot name="icon" />
      <slot />
    </template>
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.app-btn:disabled {
  cursor: not-allowed;
}

.app-btn--block {
  width: 100%;
  border-radius: 8px;
  padding: 9px 12px;
}

.app-btn__icon {
  font-size: 1.2em;
  line-height: 1;
}

.app-btn__spinner {
  width: 11px;
  height: 11px;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: app-btn-spin 0.7s linear infinite;
}

.app-btn--outline .app-btn__spinner,
.app-btn--text .app-btn__spinner {
  border-color: rgba(17, 17, 17, 0.2);
  border-top-color: var(--ink);
}

@keyframes app-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

/* text: no fill, no border — quiet inline actions (top bar, etc.) */
.app-btn--text {
  background: transparent;
  color: var(--ink);
}

.app-btn--text:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.app-btn--text.app-btn--muted {
  color: var(--ink-muted);
}

.app-btn--text.app-btn--muted:hover:not(:disabled) {
  background: transparent;
  color: var(--danger);
}

/* outline: bordered, white fill — secondary actions in modals/panels */
.app-btn--outline {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
}

.app-btn--outline:hover:not(:disabled) {
  border-color: #111111;
}

.app-btn--outline.app-btn--danger {
  color: var(--danger);
}

.app-btn--outline.app-btn--danger:hover:not(:disabled) {
  border-color: var(--danger);
}

/* solid: filled dark (or danger) — primary/confirm actions */
.app-btn--solid {
  background: #111111;
  color: #fff;
}

.app-btn--solid:hover:not(:disabled) {
  background: #2b2b2b;
}

.app-btn--solid:disabled {
  background: #b7b7b7;
}

.app-btn--solid.app-btn--loading:disabled {
  background: #555555;
  cursor: default;
}

.app-btn--solid.app-btn--danger {
  background: var(--danger);
}

.app-btn--solid.app-btn--danger:hover:not(:disabled) {
  background: #8f1f19;
}
</style>
