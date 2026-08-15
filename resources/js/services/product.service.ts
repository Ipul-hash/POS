import api from '@/lib/axios';
import type {
    ApiResponse,
    Product,
    ProductPayload,
    ProductQueryParams,
    ProductStock,
} from '@/types';

export async function getProductsApi(
    params?: ProductQueryParams
): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>('/produk', {
        params,
    });
    return response.data;
}

export async function getProductDetailApi(
    id: number | string
): Promise<ApiResponse<Product>> {
    const response = await api.get<ApiResponse<Product>>(`/produk/${id}`);
    return response.data;
}

export async function createProductApi(
    payload: ProductPayload
): Promise<ApiResponse<Product>> {
    const response = await api.post<ApiResponse<Product>>('/produk', payload);
    return response.data;
}

export async function updateProductApi(
    id: number | string,
    payload: Partial<ProductPayload>
): Promise<ApiResponse<Product>> {
    const response = await api.put<ApiResponse<Product>>(`/produk/${id}`, payload);
    return response.data;
}

export async function deleteProductApi(
    id: number | string
): Promise<ApiResponse<Product | null>> {
    const response = await api.delete<ApiResponse<Product | null>>(`/produk/${id}`);
    return response.data;
}

export async function getProductStockApi(
    id: number | string
): Promise<ApiResponse<ProductStock>> {
    const response = await api.get<ApiResponse<ProductStock>>(`/produk/${id}/stok`);
    return response.data;
}
