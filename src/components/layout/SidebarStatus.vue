<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";

const store = useInvoiceStore();
const lastUpdated = ref(new Date());
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = store.$subscribe(() => {
    lastUpdated.value = new Date();
  });
});

onUnmounted(() => unsubscribe?.());

const formatted = () =>
  new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(lastUpdated.value);
</script>

<template>
  <p class="sidebar-status">آخرین بروزرسانی: {{ formatted() }}</p>
</template>

<style scoped>
.sidebar-status {
  margin: 0;
  text-align: center;
  font-size: 10px;
  color: var(--ink-muted);
}
</style>
