/**
 * Domain types for the Persian (Farsi) electronic sales invoice
 * "صورت حساب الکترونیکی فروش".
 *
 * These mirror the fields on the reference document exactly. Footer /
 * payment / signature sections are intentionally left out for now and
 * will be added as a separate slice of state later.
 */

export interface PartyInfo {
  /** نام / فروشنده یا خریدار */
  name: string;
  /** شماره اقتصادی */
  economicNumber: string;
  /** شناسه ملی */
  nationalId: string;
  /** شماره ثبت */
  registrationNumber: string;
  /** نشانی */
  address: string;
  /** تلفن */
  phone: string;
  /** شماره همراه */
  mobile: string;
  /** کد پستی */
  postalCode: string;
  /** ایمیل */
  email: string;
}

export interface InvoiceLineItem {
  id: string;
  /** شناسه کالا یا خدمت */
  itemId: string;
  /** شرح کالا یا خدمت */
  description: string;
  /** تعداد */
  quantity: number;
  /** مبلغ واحد (تومان — واحد پایه ذخیره‌سازی) */
  unitPrice: number;
  /** تخفیف (تومان) — discount amount for this line */
  discount: number;
  /** جمع مالیات و عوارض ارزش افزوده (تومان) — VAT for this line */
  vatAmount: number;
  /** آیا این ردیف در پیش‌نمایش/فاکتور نهایی نمایش داده شود */
  visible: boolean;
}

export interface InvoiceHeaderInfo {
  /** شماره فاکتور */
  invoiceNumber: string;
  /** تاریخ (Jalali date, kept as free text to match source, e.g. 1401/06/09) */
  date: string;
  /** یادداشت سربرگ — متن آزاد که در بالای فاکتور نمایش داده می‌شود */
  notes: string;
}

export type PaymentMethod = "cash" | "noncash";

export interface BankInfo {
  /** بانک ... شماره حساب (bank name shown inline with the account number label) */
  bankName: string;
  /** شماره حساب */
  accountNumber: string;
  /** به نام */
  accountHolderName: string;
  /** شماره کارت */
  cardNumber: string;
  /** شماره شبا */
  shabaNumber: string;
}

export interface SignatureInfo {
  /** مهر و امضای فروشنده / خریدار — printed name under the signature line */
  name: string;
  /** تاریخ امضا (Jalali date, free text) */
  date: string;
}

export interface InvoiceFooter {
  /** روش پرداخت: نقدی / غیرنقدی */
  paymentMethod: PaymentMethod;
  /** توضیحات */
  notes: string;
  /** هزینه ارسال (باربری) — تومان */
  shippingCost: number;
  /** تخفیف کسر رندی فاکتور — تومان */
  roundingDiscount: number;
  bank: BankInfo;
  sellerSignature: SignatureInfo;
  buyerSignature: SignatureInfo;
}

export type Currency = "toman" | "rial";

/** Fields on a party (seller/buyer) that are optional to show in the
 * preview — name, address, and mobile are always shown and not included
 * here. */
export interface PartyFieldVisibility {
  economicNumber: boolean;
  nationalId: boolean;
  registrationNumber: boolean;
  postalCode: boolean;
  phone: boolean;
  email: boolean;
}

export interface OptionalFieldsState {
  notes: boolean;
  shippingCost: boolean;
  roundingDiscount: boolean;
  bankInfo: boolean;
  headerNotes: boolean;
  /** آیا لوگو (در صورت آپلود) در پیش‌نمایش/فاکتور نهایی نمایش داده شود */
  logo: boolean;
  sellerFields: PartyFieldVisibility;
  buyerFields: PartyFieldVisibility;
}

export interface InvoiceState {
  header: InvoiceHeaderInfo;
  /** لوگوی شرکت به صورت data URL — در پیش‌نمایز و بالای فاکتور نمایش داده می‌شود */
  logoDataUrl: string | null;
  /** واحد پول نمایش داده شده در پیش‌نمایش. مقادیر داخلی همیشه به تومان ذخیره می‌شوند. */
  currency: Currency;
  seller: PartyInfo;
  buyer: PartyInfo;
  lineItems: InvoiceLineItem[];
  footer: InvoiceFooter;
  optional: OptionalFieldsState;
}

/** Per-line derived values, computed — never stored directly. */
export interface LineItemTotals {
  /** مبلغ کل = تعداد × مبلغ واحد */
  totalAmount: number;
  /** مبلغ کل پس از تخفیف */
  amountAfterDiscount: number;
  /** جمع کل پس از تخفیف و مالیات و عوارض */
  amountAfterDiscountAndVat: number;
}

/** Table-wide derived totals, computed — never stored directly. */
export interface InvoiceTotals {
  totalQuantity: number;
  totalAmount: number;
  totalDiscount: number;
  totalAfterDiscount: number;
  totalVat: number;
  grandTotal: number;
  /** جمع کل پس از کسر تخفیف رندی با احتساب هزینه ارسال */
  finalTotal: number;
}
