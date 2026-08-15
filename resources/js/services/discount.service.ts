import api from '@/lib/axios';
import type {
    ApiResponse,
    Discount,
    DiscountPayload,
    DiscountQueryParams,
} from '@/types';

export async function getDiscountsApi(
    params?: DiscountQueryParams
): Promise<ApiResponse<Discount[]>> {
    const response = await api.get<ApiResponse<Discount[]>>('/discounts', {
        params,
    });
    return response.data;
}

export async function getDiscountDetailApi(
    id: number | string
): Promise<ApiResponse<Discount>> {
    const response = await api.get<ApiResponse<Discount>>(`/discounts/${id}`);
    return response.data;
}

export async function createDiscountApi(
    payload: DiscountPayload
): Promise<ApiResponse<Discount>> {
    const response = await api.post<ApiResponse<Discount>>('/discounts', payload);
    return response.data;
}

export async function updateDiscountApi(
    id: number | string,
    payload: Partial<DiscountPayload>
): Promise<ApiResponse<Discount>> {
    const response = await api.put<ApiResponse<Discount>>(`/discounts/${id}`, payload);
    return response.data;
}

export async function deleteDiscountApi(
    id: number | string
): Promise<ApiResponse<Discount>> {
    const response = await api.delete<ApiResponse<Discount>>(`/discounts/${id}`);
    return response.data;
}
