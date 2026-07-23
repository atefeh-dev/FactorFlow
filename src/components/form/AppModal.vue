<script lang="ts">
// Module-level (shared across every AppModal instance), not per-instance —
// tracks which modals are currently open so nested modals (e.g. a confirm
// dialog opened on top of an edit modal) behave correctly: only the
// topmost modal responds to Escape, and the body stays scroll-locked until
// the *last* modal closes rather than the first one to unmount clearing it
// out from under a still-open parent.
const openModals: symbol[] = [];
</script>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{
  title: string;
  subtitle?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const id = Symbol("modal");

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && openModals[openModals.length - 1] === id) {
    emit("close");
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  openModals.push(id);
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  const index = openModals.indexOf(id);
  if (index !== -1) openModals.splice(index, 1);
  if (openModals.length === 0) document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade" appear>
      <div class="modal-overlay" @mousedown.self="emit('close')">
        <div class="modal" role="dialog" aria-modal="true">
          <header class="modal__head">
            <div>
              <h2 class="modal__title">{{ props.title }}</h2>
              <p v-if="props.subtitle" class="modal__subtitle">{{ props.subtitle }}</p>
            </div>
            <div class="modal__head-end">
              <div v-if="$slots['header-actions']" class="modal__head-actions">
                <slot name="header-actions" />
              </div>
              <button type="button" class="modal__close" title="بستن" @click="emit('close')">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                  <path d="M5 5 15 15M15 5 5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </header>

          <div class="modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  max-height: min(86vh, 660px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
}

.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--line);
  flex: 0 0 auto;
}

.modal__title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
}

.modal__subtitle {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: var(--ink-muted);
}

.modal__close {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard);
}

.modal__head-end {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal__head-actions {
  flex: 0 0 auto;
  padding-top: 2px;
}

.modal__close:hover {
  background: var(--surface-muted);
  color: var(--ink);
}

.modal__body {
  padding: 20px 22px;
  overflow-y: auto;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal__footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--line);
}

/* Overlay fades; the panel itself fades in with a slight scale + lift —
   restrained enough to read as quality, not as a "bounce". */
.modal-fade-enter-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.modal-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.modal-fade-enter-active .modal {
  transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);
}

.modal-fade-leave-active .modal {
  transition: opacity var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  opacity: 0;
  transform: scale(0.97) translateY(6px);
}
</style>
