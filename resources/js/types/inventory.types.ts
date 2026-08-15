import type { Product } from './product.types';

export interface InventoryItem {
    id: number;
    product_id: number;
    quantity: number;
    min_stock: number;
    created_at?: string;
    updated_at?: string;
    product?: Product;
}

export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
    id: number;
    product_id: number;
    type: StockMovementType;
    quantity: number;
    reference_type?: string;
    reference_id?: number | null;
    note?: string | null;
    created_by: number;
    created_at?: string;
    product?: Product;
    creator?: {
        id: number;
        name: string;
        email?: string;
    };
}

export interface StockAdjustmentPayload {
    product_id: number | string;
    type: StockMovementType;
    quantity: number;
    note?: string | null;
}

export interface MinStockPayload {
    min_stock: number;
}

export type InventoryFilterStatus = 'all' | 'safe' | 'low_stock' | 'out_of_stock';
