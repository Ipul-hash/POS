import api from '@/lib/axios';
import type {
    ApiResponse,
    CreateUserPayload,
    RoleItem,
    UpdateUserPayload,
    UserAccount,
} from '@/types';

export async function getUsersApi(params?: {
    role?: string;
}): Promise<ApiResponse<UserAccount[]>> {
    const response = await api.get<ApiResponse<UserAccount[]>>('/users', {
        params,
    });
    return response.data;
}

export async function getUserDetailApi(
    id: number | string
): Promise<ApiResponse<UserAccount>> {
    const response = await api.get<ApiResponse<UserAccount>>(`/users/${id}`);
    return response.data;
}

export async function createUserApi(
    payload: CreateUserPayload
): Promise<ApiResponse<UserAccount>> {
    const response = await api.post<ApiResponse<UserAccount>>('/users', payload);
    return response.data;
}

export async function updateUserApi(
    id: number | string,
    payload: UpdateUserPayload
): Promise<ApiResponse<UserAccount>> {
    const response = await api.put<ApiResponse<UserAccount>>(`/users/${id}`, payload);
    return response.data;
}

export async function deleteUserApi(
    id: number | string
): Promise<ApiResponse<UserAccount>> {
    const response = await api.delete<ApiResponse<UserAccount>>(`/users/${id}`);
    return response.data;
}

export async function getRolesApi(): Promise<ApiResponse<RoleItem[]>> {
    const response = await api.get<ApiResponse<RoleItem[]>>('/roles');
    return response.data;
}
