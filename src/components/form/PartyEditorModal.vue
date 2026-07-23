<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useInvoiceStore } from "../../stores/invoice.store";
import type { PartyInfo } from "../../types/invoice.types";
import AppModal from "./AppModal.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import AppButton from "./AppButton.vue";
import SwitchToggle from "./SwitchToggle.vue";

const props = defineProps<{
  kind: "seller" | "buyer";
}>();

const emit = defineEmits<{ close: [] }>();

const store = useInvoiceStore();
const isSeller = props.kind === "seller";
const source = isSeller ? store.seller : store.buyer;
const isRemoveConfirmOpen = ref(false);

const fieldVisibility = computed(() => (isSeller ? store.optional.sellerFields : store.optional.buyerFields));

function setFieldVisible(field: keyof typeof fieldVisibility.value, value: boolean) {
  store.setPartyFieldVisible(props.kind, field, value);
}

// Local draft: nothing is written back to the store until "ذخیره" is
// pressed, so closing/cancelling the dialog never leaves half-typed data
// behind — same behaviour as the reference "Add New Seller" dialog.
const draft = reactive<PartyInfo>({ ...source });

function save() {
  if (isSeller) {
    store.updateSeller({ ...draft });
  } else {
    store.updateBuyer({ ...draft });
  }
  emit("close");
}

function confirmRemoveParty() {
  store.clearParty(props.kind);
  isRemoveConfirmOpen.value = false;
  emit("close");
}
</script>

<template>
  <AppModal
    :title="isSeller ? 'اطلاعات فروشنده' : 'اطلاعات خریدار'"
    :subtitle="isSeller ? 'اطلاعات فروشنده برای استفاده در فاکتور' : 'اطلاعات خریدار برای استفاده در فاکتور'"
    @close="emit('close')"
  >
    <label class="field">
      <span class="field__label">نام <span class="required">(الزامی)</span></span>
      <input v-model="draft.name" class="field__input" placeholder="نام فروشنده یا خریدار را وارد کنید" />
    </label>

    <label class="field">
      <span class="field__label">نشانی <span class="required">(الزامی)</span></span>
      <textarea v-model="draft.address" rows="2" class="field__input field__textarea" placeholder="نشانی را وارد کنید" />
    </label>

    <div class="field-grid">
      <div class="field">
        <span class="field__label-row">
          <label class="field__label" :for="`${kind}-economicNumber`">شماره اقتصادی</label>
          <SwitchToggle
            :model-value="fieldVisibility.economicNumber"
            title="نمایش در پیش‌نمایش"
            @update:model-value="(v) => setFieldVisible('economicNumber', v)"
          />
        </span>
        <input
          :id="`${kind}-economicNumber`"
          v-model="draft.economicNumber"
          class="field__input ltr-nums"
          dir="ltr"
          placeholder="مقدار را وارد کنید"
        />
      </div>

      <div class="field">
        <span class="field__label-row">
          <label class="field__label" :for="`${kind}-nationalId`">شناسه ملی</label>
          <SwitchToggle
            :model-value="fieldVisibility.nationalId"
            title="نمایش در پیش‌نمایش"
            @update:model-value="(v) => setFieldVisible('nationalId', v)"
          />
        </span>
        <input
          :id="`${kind}-nationalId`"
          v-model="draft.nationalId"
          class="field__input ltr-nums"
          dir="ltr"
          placeholder="مقدار را وارد کنید"
        />
      </div>

      <div class="field">
        <span class="field__label-row">
          <label class="field__label" :for="`${kind}-registrationNumber`">شماره ثبت</label>
          <SwitchToggle
            :model-value="fieldVisibility.registrationNumber"
            title="نمایش در پیش‌نمایش"
            @update:model-value="(v) => setFieldVisible('registrationNumber', v)"
          />
        </span>
        <input
          :id="`${kind}-registrationNumber`"
          v-model="draft.registrationNumber"
          class="field__input ltr-nums"
          dir="ltr"
          placeholder="مقدار را وارد کنید"
        />
      </div>

      <div class="field">
        <span class="field__label-row">
          <label class="field__label" :for="`${kind}-postalCode`">کد پستی</label>
          <SwitchToggle
            :model-value="fieldVisibility.postalCode"
            title="نمایش در پیش‌نمایش"
            @update:model-value="(v) => setFieldVisible('postalCode', v)"
          />
        </span>
        <input
          :id="`${kind}-postalCode`"
          v-model="draft.postalCode"
          class="field__input ltr-nums"
          dir="ltr"
          placeholder="مقدار را وارد کنید"
        />
      </div>

      <div class="field">
        <span class="field__label-row">
          <label class="field__label" :for="`${kind}-phone`">تلفن</label>
          <SwitchToggle
            :model-value="fieldVisibility.phone"
            title="نمایش در پیش‌نمایش"
            @update:model-value="(v) => setFieldVisible('phone', v)"
          />
        </span>
        <input :id="`${kind}-phone`" v-model="draft.phone" class="field__input ltr-nums" dir="ltr" placeholder="تلفن ثابت" />
      </div>

      <label class="field">
        <span class="field__label">شماره همراه</span>
        <input v-model="draft.mobile" class="field__input ltr-nums" dir="ltr" placeholder="شماره همراه" />
      </label>
    </div>

    <div class="field">
      <span class="field__label-row">
        <label class="field__label" :for="`${kind}-email`">ایمیل</label>
        <SwitchToggle
          :model-value="fieldVisibility.email"
          title="نمایش در پیش‌نمایش"
          @update:model-value="(v) => setFieldVisible('email', v)"
        />
      </span>
      <input :id="`${kind}-email`" v-model="draft.email" type="email" class="field__input ltr-nums" dir="ltr" placeholder="name@email.com" />
    </div>

    <template #footer>
      <AppButton
        v-if="isSeller ? store.hasSeller : store.hasBuyer"
        variant="outline"
        tone="danger"
        @click="isRemoveConfirmOpen = true"
      >
        حذف
      </AppButton>
      <div class="footer-spacer" />
      <AppButton variant="outline" @click="emit('close')">انصراف</AppButton>
      <AppButton variant="solid" :disabled="!draft.name.trim() || !draft.address.trim()" @click="save">
        ذخیره
      </AppButton>
    </template>
  </AppModal>

  <ConfirmDialog
    v-if="isRemoveConfirmOpen"
    :title="isSeller ? 'حذف اطلاعات فروشنده' : 'حذف اطلاعات خریدار'"
    :message="isSeller ? 'تمام اطلاعات فروشنده حذف خواهد شد. این عمل قابل بازگشت نیست.' : 'تمام اطلاعات خریدار حذف خواهد شد. این عمل قابل بازگشت نیست.'"
    confirm-label="حذف"
    @confirm="confirmRemoveParty"
    @cancel="isRemoveConfirmOpen = false"
  />
</template>

<style scoped>
.required {
  color: var(--ink-muted);
  font-weight: 400;
  font-size: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field__label {
  font-size: 11.5px;
  font-weight: 600;
}

.field__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field__input {
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 8px 10px;
  font-size: 12px;
  background: var(--surface);
  outline: none;
  width: 100%;
  transition: border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard);
}

.field__input:focus {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
}

.field__textarea {
  resize: vertical;
  font-family: inherit;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 14px;
}

.footer-spacer {
  flex: 1 1 auto;
}
</style>
