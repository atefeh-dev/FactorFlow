<script setup lang="ts">
import { useInvoiceStore } from "../../stores/invoice.store";
import SwitchToggle from "./SwitchToggle.vue";

const store = useInvoiceStore();
</script>

<template>
  <div class="panel">
    <div class="panel__head">
      <h2 class="panel__title">یادداشت سربرگ</h2>
      <SwitchToggle
        title="نمایش در پیش‌نمایش"
        :model-value="store.optional.headerNotes"
        @update:model-value="(v) => store.updateOptional({ headerNotes: v })"
      />
    </div>
    <textarea
      class="panel__textarea"
      rows="3"
      placeholder="یادداشت سربرگ را وارد کنید"
      :value="store.header.notes"
      @input="(e) => store.updateHeader({ notes: (e.target as HTMLTextAreaElement).value })"
    />
  </div>
</template>

<style scoped>
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.panel__title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.panel__textarea {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 11.5px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  background: var(--surface);
}

.panel__textarea:focus {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
}
</style>
