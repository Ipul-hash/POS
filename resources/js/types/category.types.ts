import type { Product } from './product.types';

export interface Category {
    id: number;
    name: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
    products?: Product[];
    products_count?: number;
}



export interface CategoryPayload {
    name: string;
    description?: string | null;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
    errors?: Record<string, string[]>;
}
