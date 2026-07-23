<script setup lang="ts">
import { ref } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import { buildShareUrl } from "../../utils/shareLink";
import { clearDraftStorage } from "../../composables/useAutosave";
import ConfirmDialog from "../form/ConfirmDialog.vue";

const store = useInvoiceStore();
const toast = ref("");
const isResetConfirmOpen = ref(false);
const isExportingPdf = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string) {
  toast.value = message;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 2400);
}

async function generateLink() {
  const url = buildShareUrl(store.$state);
  try {
    await navigator.clipboard.writeText(url);
    showToast("لینک فاکتور در کلیپ‌بورد کپی شد");
  } catch {
    window.prompt("لینک فاکتور را کپی کنید:", url);
  }
}

async function downloadPdf() {
  if (isExportingPdf.value) return;

  // There's only ever one invoice sheet rendered at a time, so a direct
  // query is simpler and just as reliable as plumbing a ref across the
  // sidebar/preview component boundary via provide/inject.
  const sheet = document.querySelector<HTMLElement>(".sheet");
  if (!sheet) {
    showToast("پیش‌نمایش فاکتور یافت نشد");
    return;
  }

  const filename = `فاکتور-${store.header.invoiceNumber.trim() || "بدون-شماره"}.pdf`;

  try {
    const { exportElementToPdf } = await import("../../utils/pdfExport");
    await exportElementToPdf(sheet, filename, {
      onStart: () => (isExportingPdf.value = true),
      onFinish: () => (isExportingPdf.value = false),
    });
  } catch (error) {
    console.error("PDF export failed", error);
    showToast("ساخت PDF با خطا مواجه شد");
    isExportingPdf.value = false;
  }
}

function confirmReset() {
  store.reset();
  clearDraftStorage();
  isResetConfirmOpen.value = false;
  showToast("فرم بازنشانی شد");
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__brand">
      <h1 class="topbar__title">فاکتور ساز</h1>
      <span class="topbar__dot" aria-hidden="true">·</span>
      <p class="topbar__subtitle">صدور رایگان و آسان فاکتور فروش</p>
    </div>

    <div class="topbar__buttons">
      <button type="button" class="btn btn--text" @click="generateLink">ایجاد لینک فاکتور</button>
      <button
        type="button"
        class="btn btn--solid"
        :disabled="isExportingPdf"
        @click="downloadPdf"
      >
        <span v-if="isExportingPdf" class="btn__spinner" aria-hidden="true" />
        {{ isExportingPdf ? "در حال ساخت PDF…" : "دانلود PDF" }}
      </button>
      <span class="btn-divider" aria-hidden="true" />
      <button type="button" class="btn btn--text btn--muted" @click="isResetConfirmOpen = true">
        بازنشانی فرم
      </button>
    </div>

    <Transition name="toast-fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>

    <ConfirmDialog
      v-if="isResetConfirmOpen"
      title="بازنشانی فرم"
      message="تمام اطلاعات وارد شده — فروشنده، خریدار، ردیف‌ها و تنظیمات — پاک خواهد شد. این عمل قابل بازگشت نیست."
      confirm-label="بازنشانی"
      @confirm="confirmReset"
      @cancel="isResetConfirmOpen = false"
    />
  </header>
</template>

<style scoped>
/* Light, minimal chrome: no boxed white surface, no hard border — just a
   hairline to separate it from the panes below, so it reads as part of the
   same page rather than a floating bar on top of it. */
.topbar {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  background: #eef0ef;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.topbar__brand {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.topbar__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.topbar__dot {
  color: var(--ink-muted);
  font-size: 12px;
}

.topbar__subtitle {
  margin: 0;
  font-size: 11px;
  color: var(--ink-muted);
  font-weight: 400;
}

.topbar__buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: var(--line);
}

.btn {
  border-radius: 7px;
  padding: 6px 11px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid transparent;
  white-space: nowrap;
  background: transparent;
}

.btn--text {
  color: var(--ink);
}

.btn--text:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn--muted {
  color: var(--ink-muted);
}

.btn--muted:hover {
  background: transparent;
  color: var(--danger);
}

.btn--solid {
  background: #111111;
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn--solid:hover {
  background: #2b2b2b;
}

.btn--solid:disabled {
  background: #555555;
  cursor: default;
}

.btn__spinner {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: btn-spin 0.7s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.toast {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #111111;
  color: #fff;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 20;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
