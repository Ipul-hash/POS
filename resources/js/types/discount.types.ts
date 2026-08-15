export type DiscountType = 'percentage' | 'fixed';
export type DiscountAppliesTo = 'product' | 'transaction';

export interface Discount {
    id: number;
    name: string;
    type: DiscountType;
    value: string | number;
    applies_to: DiscountAppliesTo;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DiscountPayload {
    name: string;
    type: DiscountType;
    value: number;
    applies_to: DiscountAppliesTo;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}

export interface DiscountQueryParams {
    search?: string;
    type?: string;
    applies_to?: string;
    is_active?: boolean;
}

export type DiscountStatusFilter =
    | 'all'
    | 'active'
    | 'product'
    | 'transaction'
    | 'scheduled'
    | 'expired'
    | 'inactive';
