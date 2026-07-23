<script setup lang="ts">
import { computed, ref } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import PartyEditorModal from "./PartyEditorModal.vue";
import AppButton from "./AppButton.vue";

const props = defineProps<{
  kind: "seller" | "buyer";
}>();

const store = useInvoiceStore();
const isOpen = ref(false);

const party = computed(() => (props.kind === "seller" ? store.seller : store.buyer));
const hasParty = computed(() => (props.kind === "seller" ? store.hasSeller : store.hasBuyer));
const addLabel = computed(() => (props.kind === "seller" ? "افزودن فروشنده" : "افزودن خریدار"));
</script>

<template>
  <div class="party-section">
    <AppButton v-if="!hasParty" variant="solid" block icon="+" @click="isOpen = true">
      {{ addLabel }}
    </AppButton>

    <button v-else type="button" class="summary-card" @click="isOpen = true">
      <span class="summary-card__avatar" aria-hidden="true">{{ party.name.trim().charAt(0) || "?" }}</span>
      <span class="summary-card__text">
        <span class="summary-card__name">{{ party.name || "—" }}</span>
        <span class="summary-card__address">{{ party.address || "—" }}</span>
      </span>
      <span class="summary-card__edit">ویرایش</span>
    </button>

    <PartyEditorModal v-if="isOpen" :kind="kind" @close="isOpen = false" />
  </div>
</template>

<style scoped>
.party-section {
  display: flex;
}

.summary-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  background: var(--surface-muted);
  border-radius: 10px;
  padding: 8px 10px;
  text-align: right;
  transition: border-color 0.15s ease;
}

.summary-card:hover {
  border-color: #111111;
}

.summary-card__avatar {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.summary-card__text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-card__name {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-card__address {
  font-size: 10.5px;
  color: var(--ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-card__edit {
  flex: 0 0 auto;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ink-muted);
}
</style>
