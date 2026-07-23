import { defineStore } from "pinia";
import { nanoid } from "../utils/id";
import type {
  BankInfo,
  Currency,
  InvoiceFooter,
  InvoiceLineItem,
  InvoiceState,
  OptionalFieldsState,
  PartyFieldVisibility,
  PartyInfo,
  SignatureInfo,
} from "../types/invoice.types";

function emptyParty(): PartyInfo {
  return {
    name: "",
    economicNumber: "",
    nationalId: "",
    registrationNumber: "",
    address: "",
    phone: "",
    mobile: "",
    postalCode: "",
    email: "",
  };
}

function emptyLineItem(): InvoiceLineItem {
  return {
    id: nanoid(),
    itemId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    vatAmount: 0,
    visible: true,
  };
}

function emptySignature(): SignatureInfo {
  return { name: "", date: "" };
}

function emptyBankInfo(): BankInfo {
  return {
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    cardNumber: "",
    shabaNumber: "",
  };
}

function emptyFooter(): InvoiceFooter {
  return {
    paymentMethod: "cash",
    notes: "",
    shippingCost: 0,
    roundingDiscount: 0,
    bank: emptyBankInfo(),
    sellerSignature: emptySignature(),
    buyerSignature: emptySignature(),
  };
}

function defaultPartyFieldVisibility(): PartyFieldVisibility {
  return {
    economicNumber: true,
    nationalId: true,
    registrationNumber: true,
    postalCode: true,
    phone: true,
    email: true,
  };
}

function defaultOptionalFields(): OptionalFieldsState {
  return {
    notes: false,
    shippingCost: false,
    roundingDiscount: false,
    bankInfo: true,
    headerNotes: false,
    logo: true,
    sellerFields: defaultPartyFieldVisibility(),
    buyerFields: defaultPartyFieldVisibility(),
  };
}

/** New invoices start with a single row — more rows are added on demand via "افزودن ردیف". */
export const MIN_LINE_ITEM_ROWS = 1;

function initialState(): InvoiceState {
  return {
    header: {
      invoiceNumber: "",
      date: "",
      notes: "",
    },
    logoDataUrl: null,
    currency: "toman",
    seller: emptyParty(),
    buyer: emptyParty(),
    lineItems: Array.from({ length: MIN_LINE_ITEM_ROWS }, emptyLineItem),
    footer: emptyFooter(),
    optional: defaultOptionalFields(),
  };
}

export const useInvoiceStore = defineStore("invoice", {
  state: (): InvoiceState => initialState(),

  getters: {
    /** Rows that actually have data, in case callers need only "real" rows. */
    filledLineItems(state): InvoiceLineItem[] {
      return state.lineItems.filter(
        (row) =>
          row.description.trim() !== "" ||
          row.itemId.trim() !== "" ||
          row.quantity !== 0 ||
          row.unitPrice !== 0
      );
    },
    hasSeller(state): boolean {
      return state.seller.name.trim() !== "" || state.seller.address.trim() !== "";
    },
    hasBuyer(state): boolean {
      return state.buyer.name.trim() !== "" || state.buyer.address.trim() !== "";
    },
  },

  actions: {
    updateHeader(patch: Partial<InvoiceState["header"]>) {
      Object.assign(this.header, patch);
    },
    updateSeller(patch: Partial<PartyInfo>) {
      Object.assign(this.seller, patch);
    },
    updateBuyer(patch: Partial<PartyInfo>) {
      Object.assign(this.buyer, patch);
    },
    updateLineItem(id: string, patch: Partial<InvoiceLineItem>) {
      const row = this.lineItems.find((r) => r.id === id);
      if (row) Object.assign(row, patch);
    },
    addLineItem(): string {
      const row = emptyLineItem();
      this.lineItems.push(row);
      return row.id;
    },
    removeLineItem(id: string) {
      const index = this.lineItems.findIndex((r) => r.id === id);
      if (index !== -1) this.lineItems.splice(index, 1);
    },
    updateFooter(
      patch: Partial<Omit<InvoiceFooter, "bank" | "sellerSignature" | "buyerSignature">>
    ) {
      Object.assign(this.footer, patch);
    },
    updateBankInfo(patch: Partial<BankInfo>) {
      Object.assign(this.footer.bank, patch);
    },
    updateSignature(party: "seller" | "buyer", patch: Partial<SignatureInfo>) {
      const key = party === "seller" ? "sellerSignature" : "buyerSignature";
      Object.assign(this.footer[key], patch);
    },
    updateOptional(patch: Partial<OptionalFieldsState>) {
      Object.assign(this.optional, patch);
    },
    setPartyFieldVisible(kind: "seller" | "buyer", field: keyof PartyFieldVisibility, value: boolean) {
      const target = kind === "seller" ? this.optional.sellerFields : this.optional.buyerFields;
      target[field] = value;
    },
    setLogo(dataUrl: string | null) {
      this.logoDataUrl = dataUrl;
    },
    setCurrency(currency: Currency) {
      this.currency = currency;
    },
    clearParty(kind: "seller" | "buyer") {
      Object.assign(kind === "seller" ? this.seller : this.buyer, emptyParty());
    },
    reset() {
      Object.assign(this, initialState());
    },
  },
});
