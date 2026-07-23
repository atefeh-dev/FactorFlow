# فاکتور فروش — Vue Live Invoice Editor

Live-editable Persian (RTL) sales invoice, built with Vue 3 + TypeScript + Pinia,
matching the reference "صورت حساب الکترونیکی فروش" layout in full: header,
seller, buyer, line-items table, and footer (payment terms, bank info,
signatures).

## Architecture

```
src/
  types/invoice.types.ts        # Invoice, PartyInfo, LineItem, InvoiceFooter, OptionalFieldsState
  stores/invoice.store.ts       # Pinia store — single source of truth, incl. optional-field flags
  composables/useInvoiceTotals.ts  # derived VAT/sum/final totals, computed (never stored)
  utils/                        # id generator, number formatting
  components/
    form/
      FieldInput.vue            # reusable labeled input atom
      SwitchToggle.vue          # reusable on/off switch, drives conditional rendering
      CollapsibleSection.vue    # accordion wrapper, CSS-grid height animation (no layout jump)
      InvoiceHeaderForm.vue     # invoice number, date
      PartyForm.vue             # reused for both Seller and Buyer (kind="seller"|"buyer")
      LineItemsForm.vue         # renders the list of LineItemCard + running summary
      LineItemCard.vue          # one collapsible card per line item — see below
      InvoiceFooterForm.vue     # payment terms, bank info, signatures
    preview/InvoicePreview.vue  # live preview, reads the same store, mirrors the reference layout 1:1
    layout/InvoiceEditorLayout.vue  # fixed-height desktop workspace, two independently-scrolling panes
```

## Workspace layout

The page itself never scrolls (`html, body, #app` are locked to `height: 100%`
with `overflow: hidden`). `InvoiceEditorLayout` is a `100vh` flex column: a
fixed-height topbar, then a `flex: 1; min-height: 0` grid with two panes, each
owning its own `overflow-y: auto` scroll container (`.pane__scroll`). The form
pane and the preview pane scroll completely independently of one another.

## Collapsible sections

Each form area (invoice info, seller, buyer, line items, sale/payment terms)
is wrapped in `CollapsibleSection`. It animates open/closed with a CSS
`grid-template-rows: 0fr -> 1fr` transition instead of `max-height` tricks, so
expanding or collapsing a section never causes the surrounding layout to jump
or reflow — it just changes how much the form pane's own scroll container has
to scroll.

## Optional fields

Fields that are genuinely optional on the source document (registration
number, mobile, postal code per party; notes, shipping cost, rounding
discount, the whole bank-info block, and the buyer's signature) are gated by a
`SwitchToggle` bound to `store.optional.*`. Turning a switch off doesn't hide
the field with CSS — the `v-if` unmounts the input in the form **and** the
corresponding cell/row in the preview, so no stale or invisible data is ever
carried in the DOM.

## Shared state

Every input — including every switch — writes into the single
`useInvoiceStore()` instance. The preview reads from that same store, so any
change (typing, adding/removing a line item, flipping a switch, expanding a
section) is reflected in the live preview immediately, with no extra
event plumbing.

## Line-item cards

Each row in `store.lineItems` renders as a `LineItemCard` instead of a table
row. Collapsed, a card shows only what's essential to scan a list of items:
row number, description (editable inline), quantity (editable inline), and
the computed line total. Expanding a card (via its own chevron button, local
`ref` — not shared state) reveals the detail fields: item ID, unit price,
discount, VAT amount, and a small breakdown of totals after discount/VAT.

Both the ten initial placeholder rows and any row added via "+ افزودن ردیف"
default to collapsed (`defaultOpen: false`), matching the EasyInvoicePDF
pattern of new items entering the list closed rather than expanded. Expand
state is per-card local UI state, so opening one card never affects the
others or the store.

## Density pass

Base font size, input padding, panel padding, and inter-section gaps were all
reduced (e.g. panel padding 16px → 12px, field padding 8/10px → 6/8px, base
font 14px → 13px) so more of the form fits in the scrollable pane without
feeling cramped — line-item cards in particular are deliberately compact
(11–12px type, ~30px row height when collapsed) since they're the
highest-repetition element in the form.

## Run it

```bash
npm install
npm run dev
```

## Next steps (not built yet, on purpose)

- Zod validation schema mirroring `invoice.types.ts`
- Logo upload for the top-right circular mark
- PDF export (pdfmake, doc-definition built from the same store) + debounced
  live PDF preview, reusing the exact same data → document mapping used for download
- Shareable link (serialize store to URL) and localStorage persistence
# FactorFlow
