<script setup lang="ts">
import { onMounted } from "vue";
import InvoiceEditorLayout from "./components/layout/InvoiceEditorLayout.vue";
import { useInvoiceStore } from "./stores/invoice.store";
import { readStateFromUrl } from "./utils/shareLink";
import { readDraftFromStorage, useAutosave } from "./composables/useAutosave";
import type { InvoiceState } from "./types/invoice.types";

const store = useInvoiceStore();

onMounted(() => {
  // A shared link is an explicit request to load *that* invoice, so it wins
  // over whatever the person was drafting locally before opening it.
  const urlState = readStateFromUrl();
  if (urlState) {
    store.$patch(urlState);
  } else {
    const draft = readDraftFromStorage<InvoiceState>();
    if (draft) store.$patch(draft);
  }

  useAutosave(store);
});
</script>

<template>
  <InvoiceEditorLayout />
</template>
