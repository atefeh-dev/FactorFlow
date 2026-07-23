# 🧾 فاکتور ساز

A live-editing Persian (RTL) sales invoice generator — Vue 3, TypeScript, and Pinia. Fill out the form on the right, watch the actual invoice update instantly on the left, download it as a real PDF when you're done.

No backend, no login — everything runs and stays in your browser.

## ✨ Features

**Editing**

- Seller/buyer details via a focused modal, not a crowded inline form
- Line items as collapsible cards with live subtotal/VAT/discount math
- Company logo upload, header notes, custom invoice number & date
- Persian (Jalali) date picker, built from scratch — no generic RTL-unfriendly widget
- تومان / ریال currency toggle, applied consistently everywhere
- Inline validation (e.g. a discount larger than its own total is flagged, not silently accepted)

**Output**

- One-click PDF download — a real file, no print dialog in the way
- Amount spelled out in Persian words under the total, matching real invoice conventions
- Shareable link that reproduces the exact invoice when opened
- Autosaves to `localStorage`, so a refresh or closed tab never loses your draft

**Interface**

- Two independently scrolling panes: form and preview, always in sync
- Fully responsive down to mobile

## 🧱 Stack

Vue 3 (`<script setup>`) · TypeScript · Pinia · Vite · [jalaali-js](https://github.com/jalaali/jalaali-js) for calendar conversion · [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://github.com/niklasvh/html2canvas) for PDF export (lazy-loaded, only on first download)

## 📁 Structure

```
src/
  types/                    Invoice, PartyInfo, LineItem, InvoiceFooter, OptionalFieldsState
  stores/invoice.store.ts   Single source of truth — every field in the app reads/writes here
  composables/
    useInvoiceTotals.ts     Derived VAT/discount/total math, always computed, never stored
    useAutosave.ts          Debounced localStorage persistence
  utils/                    Jalali dates, number → words, PDF export, share links, formatting
  components/
    form/                   Inputs, line-item cards, party modal, date picker, dialogs
    preview/                The live invoice preview (what actually gets exported)
    layout/                 Top bar, sidebar, the two-pane scrolling shell
```

## 🚀 Getting started

```bash
npm install
npm run dev
```

```bash
npm run build     # type-checks with vue-tsc, then builds
npm run preview   # serve the production build locally
```
