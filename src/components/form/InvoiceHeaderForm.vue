<script setup lang="ts">
import { useInvoiceStore } from "../../stores/invoice.store";
import FieldInput from "./FieldInput.vue";
import JalaliDatePicker from "./JalaliDatePicker.vue";

const store = useInvoiceStore();
</script>

<template>
  <section class="panel">
    <h2 class="panel__title">اطلاعات فاکتور</h2>
    <div class="panel__grid">
      <FieldInput
        label="شماره فاکتور"
        :model-value="store.header.invoiceNumber"
        @update:model-value="(v) => store.updateHeader({ invoiceNumber: String(v) })"
      />
      <label class="field">
        <span class="field__label">تاریخ</span>
        <JalaliDatePicker
          :model-value="store.header.date"
          @update:model-value="(v) => store.updateHeader({ date: v })"
        />
      </label>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
}

.panel__title {
  margin: 0 0 7px;
  font-size: 12px;
  font-weight: 700;
}

.panel__grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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
</style>
