import type { Product } from './product.types';

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'qris' | 'ewallet';

export interface PaymentPayload {
    method: PaymentMethod;
    amount: number;
    reference_no?: string | null;
}

export interface CartItem {
    product: Product;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
    note?: string;
}

export interface TransactionItemPayload {
    product_id: number;
    quantity: number;
    price: number;
    discount?: number;
}

export interface TransactionPayload {
    shift_id?: number | null;
    customer_id?: number | null;
    items: TransactionItemPayload[];
    payments: PaymentPayload[];
    discount_total?: number;
    tax_total?: number;
}

export interface Payment {
    id: number;
    transaction_id: number;
    method: PaymentMethod;
    amount: string | number;
    reference_no?: string | null;
    paid_at?: string;
    created_at?: string;
}

export interface TransactionItem {
    id: number;
    transaction_id: number;
    product_id: number;
    quantity: number;
    price: string | number;
    discount: string | number;
    subtotal: string | number;
    created_at?: string;
    product?: Product;
}

export interface Customer {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    loyalty_points?: number;
}

export interface Transaction {
    id: number;
    invoice_number: string;
    cashier_id: number;
    customer_id?: number | null;
    shift_id: number;
    subtotal: string | number;
    discount_total: string | number;
    tax_total: string | number;
    grand_total: string | number;
    status: 'paid' | 'void' | 'refunded';
    created_at?: string;
    updated_at?: string;
    items?: TransactionItem[];
    payments?: Payment[];
    cashier?: {
        id: number;
        name: string;
        email?: string;
    };
    customer?: Customer | null;
    shift?: {
        id: number;
        cashier_id: number;
        opened_at?: string;
    };
}

export interface StoreProfile {
    id?: number;
    name: string;
    address?: string | null;
    phone?: string | null;
    logo_url?: string | null;
}

export interface ReceiptData {
    store: StoreProfile;
    transaction: Transaction;
}

export interface Shift {
    id: number;
    cashier_id: number;
    opening_balance: string | number;
    closing_balance?: string | number | null;
    opened_at: string;
    closed_at?: string | null;
    cashier?: {
        id: number;
        name: string;
        email?: string;
    };
    transactions?: Transaction[];
    total_sales?: number;
    total_transactions_count?: number;
    expected_cash?: number;
    cash_variance?: number | null;
}

export interface ShiftSummary {
    total_sales: number;
    total_discount?: number;
    total_tax?: number;
    total_transactions_count?: number;
    void_transactions_count?: number;
    total_cash_payments: number;
    payments_by_method?: {
        cash: number;
        qris: number;
        debit: number;
        credit: number;
        ewallet: number;
    };
    opening_balance: number;
    expected_cash: number;
    closing_balance: number | null;
    cash_variance: number | null;
}

export interface ShiftDetailResponse {
    shift: Shift;
    summary: ShiftSummary;
    store?: StoreProfile;
}

export interface OpenShiftPayload {
    opening_balance: number;
}

export interface CloseShiftPayload {
    closing_balance: number;
}
