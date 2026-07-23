<script setup lang="ts">
import { useInvoiceStore } from "../../stores/invoice.store";
import TopBar from "./TopBar.vue";
import SidebarStatus from "./SidebarStatus.vue";
import HeaderNotesPanel from "../form/HeaderNotesPanel.vue";
import LogoUpload from "../form/LogoUpload.vue";
import SwitchToggle from "../form/SwitchToggle.vue";
import PartySection from "../form/PartySection.vue";
import LineItemsForm from "../form/LineItemsForm.vue";
import InvoiceFooterForm from "../form/InvoiceFooterForm.vue";
import CollapsibleSection from "../form/CollapsibleSection.vue";
import InvoiceHeaderForm from "../form/InvoiceHeaderForm.vue";
import InvoicePreview from "../preview/InvoicePreview.vue";

const invoiceStore = useInvoiceStore();
</script>

<template>
  <div class="layout">
    <TopBar />

    <div class="panes">
      <div class="pane pane--form">
        <div class="pane__scroll">
          <InvoiceHeaderForm />

          <HeaderNotesPanel />

          <section class="plain-panel">
            <div class="plain-panel__head">
              <h2 class="plain-panel__title">لوگوی شرکت</h2>
              <SwitchToggle
                title="نمایش در پیش‌نمایش"
                :model-value="invoiceStore.optional.logo"
                @update:model-value="(v) => invoiceStore.updateOptional({ logo: v })"
              />
            </div>
            <LogoUpload />
          </section>

          <CollapsibleSection title="اطلاعات فروشنده">
            <PartySection kind="seller" />
          </CollapsibleSection>

          <CollapsibleSection title="اطلاعات خریدار">
            <PartySection kind="buyer" />
          </CollapsibleSection>

          <CollapsibleSection title="شرح کالا یا خدمت">
            <LineItemsForm />
          </CollapsibleSection>

          <CollapsibleSection title="شرایط فروش و پرداخت" :default-open="false">
            <InvoiceFooterForm />
          </CollapsibleSection>
        </div>

        <div class="pane__footer">
          <SidebarStatus />
        </div>
      </div>

      <div class="pane pane--preview">
        <div class="pane__scroll">
          <InvoicePreview />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fixed-height workspace: pinned directly to the viewport rectangle via
   position:fixed + inset:0, so it can never depend on (or be broken by)
   height propagation through html/body/#app. The page itself never
   scrolls. Only .pane__scroll elements (left form, right preview) scroll,
   independently of each other, and each has its own scrollbar. */
.layout {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #eef0ef;
}

.panes {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.pane {
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.pane--form {
  flex: 0 0 316px;
  width: 316px;
  border-left: 1px solid var(--line);
  background: #eef0ef;
  display: flex;
  flex-direction: column;
}

.pane--preview {
  flex: 1 1 auto;
  min-width: 0;
  background: #f7f8f7;
}

/* min-height: 0 on the flex item (.pane) is what lets overflow-y: auto
   actually kick in inside a flex row — without it the pane happily grows
   to fit its content instead of clipping+scrolling. */
.pane__scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 13px;
}

/* Inside .pane--form specifically, .pane__scroll shares its column with
   .pane__footer below, so it needs to flex/shrink to make room instead of
   claiming the full pane height. min-height: 0 here is deliberate and
   wanted (unlike the collapsible-section bug below) — it's exactly what
   lets this region shrink to "remaining space" and scroll internally. */
.pane--form .pane__scroll {
  height: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.pane__footer {
  flex: 0 0 auto;
  padding: 8px 13px;
  border-top: 1px solid var(--line);
  background: #e7e9e8;
}

/* The preview is the primary focus of the page, so it gets noticeably more
   breathing room around the sheet than the utilitarian form sidebar does. */
.pane--preview .pane__scroll {
  padding: 28px 34px;
}

/* Deliberately NOT display:flex here. .pane__scroll used to be a flex
   column with a fixed height; any child that sets overflow:hidden (every
   collapsible section, for its expand/collapse animation) then gets an
   automatic min-height of 0 per the flexbox spec instead of a
   content-based floor, so the moment total sidebar content exceeded the
   viewport, flexbox silently *shrank the smallest sections to 0px* to make
   room — which is exactly what looked like a broken "New Seller" button
   and a broken expand/collapse animation. Plain block flow has no
   shrink-to-fit behavior, so this class of bug can't happen here. */
.pane__scroll > * + * {
  margin-top: 10px;
}

.plain-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plain-panel__title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.plain-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

@media (max-width: 780px) {
  .panes {
    flex-direction: column;
  }

  .pane--form {
    flex: 0 0 50%;
    width: 100%;
    border-left: none;
    border-bottom: 1px solid var(--line);
  }

  .pane--preview {
    flex: 1 1 auto;
  }
}

/* Printing: only the invoice sheet itself should end up on the page. */
@media print {
  .layout {
    position: static;
    inset: auto;
  }

  .pane--form,
  :deep(.topbar) {
    display: none !important;
  }

  .panes {
    display: block;
  }

  .pane--preview {
    background: #fff;
  }

  .pane__scroll,
  .pane--preview .pane__scroll {
    height: auto;
    overflow: visible;
    padding: 0;
  }
}
</style>
