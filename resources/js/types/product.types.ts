import type { Category } from './category.types';

export interface ProductInventory {
    id: number;
    product_id: number;
    quantity: number;
    min_stock: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    category_id: number;
    sku: string;
    barcode?: string | null;
    name: string;
    unit: string;
    cost_price: string | number;
    sell_price: string | number;
    image_url?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    category?: Category;
    inventory?: ProductInventory;
}

export interface ProductStock {
    product_id: number;
    name: string;
    current_stock: number;
    min_stock: number;
}

export interface ProductPayload {
    category_id: number | string;
    sku: string;
    barcode?: string | null;
    name: string;
    unit?: string;
    cost_price?: number | string;
    sell_price: number | string;
    image_url?: string | null;
    is_active?: boolean;
    quantity?: number;
    initial_stock?: number;
    min_stock?: number;
}

export interface ProductQueryParams {
    category_id?: number | string;
    search?: string;
    barcode?: string;
    is_active?: boolean | string;
}

export type ProductStockStatusFilter =
    | 'all'
    | 'active'
    | 'low_stock'
    | 'out_of_stock'
    | 'inactive';
