import api from '@/lib/axios';
import type {
    ApiResponse,
    InventoryItem,
    MinStockPayload,
    StockAdjustmentPayload,
    StockMovement,
} from '@/types';

export async function getInventoriesApi(params?: {
    low_stock?: boolean;
}): Promise<ApiResponse<InventoryItem[]>> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventories', {
        params,
    });
    return response.data;
}

export async function getLowStockInventoriesApi(): Promise<ApiResponse<InventoryItem[]>> {
    const response = await api.get<ApiResponse<InventoryItem[]>>('/inventories/low-stock');
    return response.data;
}

export async function adjustStockApi(
    payload: StockAdjustmentPayload
): Promise<ApiResponse<InventoryItem>> {
    const response = await api.post<ApiResponse<InventoryItem>>('/inventories/adjust', payload);
    return response.data;
}

export async function updateMinStockApi(
    id: number | string,
    payload: MinStockPayload
): Promise<ApiResponse<InventoryItem>> {
    const response = await api.put<ApiResponse<InventoryItem>>(`/inventories/${id}`, payload);
    return response.data;
}

export async function getStockMovementsApi(params?: {
    product_id?: number | string;
    type?: string;
}): Promise<ApiResponse<StockMovement[]>> {
    const response = await api.get<ApiResponse<StockMovement[]>>('/inventories/movements', {
        params,
    });
    return response.data;
}
