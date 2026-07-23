<script setup lang="ts">
import AppModal from "./AppModal.vue";

withDefaults(
  defineProps<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Danger styling for irreversible/destructive actions (red confirm button). */
    danger?: boolean;
  }>(),
  { confirmLabel: "تایید", cancelLabel: "انصراف", danger: true }
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <AppModal :title="title" @close="emit('cancel')">
    <p class="confirm-message">{{ message }}</p>

    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('cancel')">{{ cancelLabel }}</button>
      <button
        type="button"
        class="btn"
        :class="danger ? 'btn--danger' : 'btn--dark'"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.confirm-message {
  margin: 0;
  font-size: 12px;
  color: var(--ink);
  line-height: 1.6;
}

.btn {
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.btn--ghost {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
}

.btn--ghost:hover {
  border-color: #111111;
}

.btn--dark {
  background: #111111;
  color: #fff;
}

.btn--dark:hover {
  background: #2b2b2b;
}

.btn--danger {
  background: var(--danger);
  color: #fff;
}

.btn--danger:hover {
  background: #8f1f19;
}
</style>
