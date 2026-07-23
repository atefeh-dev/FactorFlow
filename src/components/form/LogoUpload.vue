<script setup lang="ts">
import { ref } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";

const store = useInvoiceStore();
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const error = ref("");

const MAX_BYTES = 3 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function openPicker() {
  fileInput.value?.click();
}

function handleFiles(files: FileList | null) {
  const file = files?.[0];
  if (!file) return;
  error.value = "";

  if (!ACCEPTED.includes(file.type)) {
    error.value = "فرمت مجاز: JPEG، PNG یا WebP";
    return;
  }
  if (file.size > MAX_BYTES) {
    error.value = "حجم فایل باید کمتر از ۳ مگابایت باشد";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    store.setLogo(reader.result as string);
  };
  reader.readAsDataURL(file);
}

function onDrop(e: DragEvent) {
  isDragOver.value = false;
  handleFiles(e.dataTransfer?.files ?? null);
}

function removeLogo(e: Event) {
  e.stopPropagation();
  store.setLogo(null);
  if (fileInput.value) fileInput.value.value = "";
}
</script>

<template>
  <div class="logo-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="logo-upload__input"
      @change="handleFiles(($event.target as HTMLInputElement).files)"
    />

    <div
      v-if="!store.logoDataUrl"
      class="logo-upload__dropzone"
      :class="{ 'logo-upload__dropzone--over': isDragOver }"
      @click="openPicker"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" class="logo-upload__icon">
        <path d="M12 16V4M12 4 7 9M12 4l5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p class="logo-upload__title">برای آپلود لوگوی شرکت کلیک کنید</p>
      <p class="logo-upload__hint">JPEG، PNG یا WebP (حداکثر ۳ مگابایت)</p>
    </div>

    <div v-else class="logo-upload__preview" @click="openPicker">
      <img :src="store.logoDataUrl" alt="لوگوی شرکت" class="logo-upload__image" />
      <div class="logo-upload__preview-meta">
        <span class="logo-upload__preview-title">لوگو بارگذاری شد</span>
        <span class="logo-upload__preview-hint">برای تغییر کلیک کنید</span>
      </div>
      <button type="button" class="logo-upload__remove" title="حذف لوگو" @click="removeLogo">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
          <path d="M5 5 15 15M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <p v-if="error" class="logo-upload__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.logo-upload {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.logo-upload__input {
  display: none;
}

.logo-upload__dropzone {
  border: 1.5px dashed var(--line);
  border-radius: 10px;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  cursor: pointer;
  color: var(--ink-muted);
  background: #fff;
  transition: border-color var(--duration-base) var(--ease-standard), background var(--duration-base) var(--ease-standard);
}

.logo-upload__dropzone:hover,
.logo-upload__dropzone--over {
  border-color: var(--ink);
  background: var(--surface-muted);
}

.logo-upload__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface-muted);
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-upload__title {
  margin: 2px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink);
}

.logo-upload__hint {
  margin: 0;
  font-size: 10px;
  color: var(--ink-muted);
}

.logo-upload__preview {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 6px 8px;
  cursor: pointer;
  background: #fff;
}

.logo-upload__image {
  width: 34px;
  height: 34px;
  object-fit: contain;
  background: #fff;
  border-radius: 6px;
  border: 1px solid var(--line);
  flex: 0 0 auto;
}

.logo-upload__preview-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 auto;
  min-width: 0;
}

.logo-upload__preview-title {
  font-size: 11px;
  font-weight: 600;
}

.logo-upload__preview-hint {
  font-size: 10px;
  color: var(--ink-muted);
}

.logo-upload__remove {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard);
}

.logo-upload__remove:hover {
  background: #e3e3e3;
  color: var(--danger);
}

.logo-upload__error {
  margin: 0;
  font-size: 10px;
  color: var(--danger);
}
</style>
