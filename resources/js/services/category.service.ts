import api from '@/lib/axios';
import type { ApiResponse, Category, CategoryPayload } from '@/types';

export async function getCategoriesApi(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/kategori');
    return response.data;
}

export async function getCategoryDetailApi(id: number | string): Promise<ApiResponse<Category>> {
    const response = await api.get<ApiResponse<Category>>(`/kategori/${id}`);
    return response.data;
}

export async function createCategoryApi(payload: CategoryPayload): Promise<ApiResponse<Category>> {
    const response = await api.post<ApiResponse<Category>>('/kategori', payload);
    return response.data;
}

export async function updateCategoryApi(
    id: number | string,
    payload: CategoryPayload
): Promise<ApiResponse<Category>> {
    const response = await api.put<ApiResponse<Category>>(`/kategori/${id}`, payload);
    return response.data;
}

export async function deleteCategoryApi(id: number | string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/kategori/${id}`);
    return response.data;
}
