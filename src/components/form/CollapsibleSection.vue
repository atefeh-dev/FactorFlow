<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    defaultOpen?: boolean;
  }>(),
  { defaultOpen: true }
);

const isOpen = ref(props.defaultOpen);
const body = ref<HTMLElement | null>(null);

// Initial height is set imperatively (not via a reactive :style binding) so
// it never fights with the open/close animation, which also writes
// el.style.height directly.
onMounted(() => {
  if (!body.value) return;
  body.value.style.height = isOpen.value ? "auto" : "0px";
});

/**
 * Height is measured from actual content (scrollHeight) rather than the
 * CSS grid-template-rows: 0fr/1fr trick, which silently breaks whenever the
 * content's own height changes while collapsed (dynamic rows being
 * added/removed, images loading, fonts swapping, etc.) because the browser
 * only recomputes the "1fr" track size on that specific transition frame.
 * Measuring scrollHeight on every open/close is what actually stays correct.
 */
function toggle() {
  if (isOpen.value) {
    collapse();
  } else {
    expand();
  }
}

function expand() {
  const el = body.value;
  if (!el) {
    isOpen.value = true;
    return;
  }
  isOpen.value = true;
  el.style.height = "0px";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.height = `${el.scrollHeight}px`;
    });
  });
  const onDone = (e: TransitionEvent) => {
    if (e.propertyName !== "height") return;
    el.style.height = "auto";
    el.removeEventListener("transitionend", onDone);
  };
  el.addEventListener("transitionend", onDone);
}

function collapse() {
  const el = body.value;
  if (!el) {
    isOpen.value = false;
    return;
  }
  el.style.height = `${el.scrollHeight}px`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.height = "0px";
    });
  });
  const onDone = (e: TransitionEvent) => {
    if (e.propertyName !== "height") return;
    isOpen.value = false;
    el.removeEventListener("transitionend", onDone);
  };
  el.addEventListener("transitionend", onDone);
}

/** Re-measure while open, e.g. after a child adds/removes a row. */
async function refresh() {
  if (!isOpen.value) return;
  await nextTick();
  const el = body.value;
  if (el) el.style.height = "auto";
}

defineExpose({ refresh });
</script>

<template>
  <section class="collapsible" :class="{ 'collapsible--open': isOpen }">
    <button
      type="button"
      class="collapsible__header"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="collapsible__title">{{ title }}</span>
      <span class="collapsible__chevron" aria-hidden="true">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <div ref="body" class="collapsible__body">
      <div class="collapsible__inner">
        <slot :refresh="refresh" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.collapsible {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.collapsible__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 10px 12px;
  text-align: right;
}

.collapsible__title {
  font-size: 12px;
  font-weight: 700;
}

.collapsible__chevron {
  display: inline-flex;
  color: var(--ink-muted);
  transition: transform var(--duration-base) var(--ease-out);
}

.collapsible--open .collapsible__chevron {
  transform: rotate(180deg);
}

.collapsible__body {
  overflow: hidden;
  transition: height var(--duration-base) var(--ease-out);
}

.collapsible__inner {
  padding: 0 12px 12px;
}
</style>
