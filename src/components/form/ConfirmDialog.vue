<script setup lang="ts">
import AppModal from "./AppModal.vue";
import AppButton from "./AppButton.vue";

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
      <AppButton variant="outline" @click="emit('cancel')">{{ cancelLabel }}</AppButton>
      <AppButton variant="solid" :tone="danger ? 'danger' : 'default'" @click="emit('confirm')">
        {{ confirmLabel }}
      </AppButton>
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
</style>
