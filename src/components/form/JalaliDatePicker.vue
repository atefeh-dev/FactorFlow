<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick } from "vue";
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_SHORT,
  toPersianDigits,
  parseJalaliString,
  formatJalaliString,
  todayJalali,
  jalaliWeekday,
  daysInJalaliMonth,
  addJalaliMonths,
  sameJalaliDay,
  type JalaliYmd,
} from "../../utils/jalali";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
  }>(),
  { placeholder: "۱۴۰۱/۰۶/۰۹" }
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const trigger = ref<HTMLElement | null>(null);
const popover = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const popoverStyle = ref({ top: "0px", left: "0px" });

const selected = computed(() => parseJalaliString(props.modelValue));
/** The month currently shown in the grid — starts on the selected date, or today. */
const viewDate = ref<JalaliYmd>(selected.value ?? todayJalali());

function openPicker() {
  viewDate.value = selected.value ?? todayJalali();
  isOpen.value = true;
  nextTick(positionPopover);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("scroll", closeOnScroll, true);
}

function closePicker() {
  isOpen.value = false;
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", closeOnScroll, true);
}

function closeOnScroll(e: Event) {
  // Allow scrolling *inside* the popover itself (e.g. a future year list);
  // any other ancestor scrolling should close it so it never gets stranded
  // at a stale position.
  if (popover.value && e.target instanceof Node && popover.value.contains(e.target)) return;
  closePicker();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closePicker();
}

function positionPopover() {
  const el = trigger.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const popoverWidth = 280;
  let left = rect.left;
  if (left + popoverWidth > window.innerWidth - 8) {
    left = window.innerWidth - popoverWidth - 8;
  }
  left = Math.max(8, left);
  popoverStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${left}px`,
  };
}

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", closeOnScroll, true);
});

const monthLabel = computed(
  () => `${PERSIAN_MONTH_NAMES[viewDate.value.jm - 1]} ${toPersianDigits(viewDate.value.jy)}`
);

const weeks = computed(() => {
  const { jy, jm } = viewDate.value;
  const firstWeekday = jalaliWeekday({ jy, jm, jd: 1 });
  const totalDays = daysInJalaliMonth(jy, jm);

  const cells: (JalaliYmd | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push({ jy, jm, jd: d });
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (JalaliYmd | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
});

function stepMonth(delta: number) {
  viewDate.value = addJalaliMonths(viewDate.value, delta);
}

function stepYear(delta: number) {
  viewDate.value = addJalaliMonths(viewDate.value, delta * 12);
}

function pickDay(day: JalaliYmd | null) {
  if (!day) return;
  emit("update:modelValue", formatJalaliString(day));
  closePicker();
}

function pickToday() {
  const t = todayJalali();
  emit("update:modelValue", formatJalaliString(t));
  closePicker();
}

function clearDate() {
  emit("update:modelValue", "");
  closePicker();
}

function onManualInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}
</script>

<template>
  <div ref="trigger" class="jdp">
    <input
      class="jdp__input ltr-nums"
      dir="ltr"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onManualInput"
      @focus="openPicker"
    />
    <button type="button" class="jdp__icon-btn" tabindex="-1" title="انتخاب تاریخ" @click="openPicker">
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
        <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5" />
        <path d="M3 8.5h14M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="jdp-backdrop" @mousedown="closePicker">
        <div
          ref="popover"
          class="jdp-panel"
          :style="popoverStyle"
          @mousedown.stop
        >
          <div class="jdp-panel__nav">
            <button type="button" class="jdp-nav-btn" title="سال قبل" @click="stepYear(-1)">»</button>
            <button type="button" class="jdp-nav-btn" title="ماه قبل" @click="stepMonth(-1)">›</button>
            <span class="jdp-panel__label">{{ monthLabel }}</span>
            <button type="button" class="jdp-nav-btn" title="ماه بعد" @click="stepMonth(1)">‹</button>
            <button type="button" class="jdp-nav-btn" title="سال بعد" @click="stepYear(1)">«</button>
          </div>

          <div class="jdp-weekdays">
            <span v-for="w in PERSIAN_WEEKDAY_SHORT" :key="w">{{ w }}</span>
          </div>

          <div class="jdp-grid">
            <div v-for="(row, ri) in weeks" :key="ri" class="jdp-grid__row">
              <button
                v-for="(day, di) in row"
                :key="di"
                type="button"
                class="jdp-day"
                :class="{
                  'jdp-day--empty': !day,
                  'jdp-day--selected': sameJalaliDay(day, selected),
                  'jdp-day--today': sameJalaliDay(day, todayJalali()),
                }"
                :disabled="!day"
                @click="pickDay(day)"
              >
                {{ day ? toPersianDigits(day.jd) : "" }}
              </button>
            </div>
          </div>

          <div class="jdp-panel__footer">
            <button type="button" class="jdp-text-btn" @click="clearDate">پاک کردن</button>
            <button type="button" class="jdp-text-btn jdp-text-btn--accent" @click="pickToday">امروز</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.jdp {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  transition: border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard);
}

.jdp:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.jdp__input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 5px 7px;
  font-size: 11.5px;
  outline: none;
  text-align: right;
}

.jdp__icon-btn {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  color: var(--ink-muted);
  padding: 0 8px;
  transition: color var(--duration-base) var(--ease-standard);
  display: flex;
  align-items: center;
  height: 100%;
}

.jdp__icon-btn:hover {
  color: var(--accent);
}
</style>

<style>
/* Unscoped: this panel is teleported to <body>, outside this component's
   scoped-style boundary. */
.jdp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
}

.jdp-panel {
  position: fixed;
  width: 280px;
  background: #ffffff;
  border: 1px solid #bdbdbd;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  padding: 10px;
  direction: rtl;
  font-family: "Vazirmatn", "Tahoma", sans-serif;
}

.jdp-panel__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 8px;
}

.jdp-panel__label {
  flex: 1 1 auto;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #1c1c1c;
}

.jdp-nav-btn {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  transition: background var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard);
  color: #6b6b6b;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jdp-nav-btn:hover {
  background: #f4f4f4;
  color: #1c1c1c;
}

.jdp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.jdp-weekdays span {
  text-align: center;
  font-size: 10.5px;
  font-weight: 600;
  color: #6b6b6b;
}

.jdp-grid__row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.jdp-day {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  background: transparent;
  border-radius: 50%;
  font-size: 11.5px;
  color: #1c1c1c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard);
}

.jdp-day:hover:not(:disabled) {
  background: #e6efee;
}

.jdp-day--empty {
  cursor: default;
  visibility: hidden;
}

.jdp-day--today {
  font-weight: 700;
  color: #0f5c52;
}

.jdp-day--selected {
  background: #0f5c52;
  color: #ffffff;
  font-weight: 700;
}

.jdp-panel__footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e6e6e6;
}

.jdp-text-btn {
  border: none;
  background: transparent;
  font-size: 11.5px;
  font-weight: 600;
  color: #6b6b6b;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard);
}

.jdp-text-btn:hover {
  background: #f4f4f4;
}

.jdp-text-btn--accent {
  color: #0f5c52;
}
</style>
