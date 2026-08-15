import api from '@/lib/axios';
import type {
    ApiResponse,
    CloseShiftPayload,
    OpenShiftPayload,
    ReceiptData,
    Shift,
    ShiftDetailResponse,
    Transaction,
    TransactionPayload,
} from '@/types';

export async function createTransactionApi(
    payload: TransactionPayload
): Promise<ApiResponse<Transaction>> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', payload);
    return response.data;
}

export async function getTransactionsApi(params?: {
    start_date?: string;
    end_date?: string;
    cashier_id?: number | string;
    status?: string;
}): Promise<ApiResponse<Transaction[]>> {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions', {
        params,
    });
    return response.data;
}

export async function getTransactionDetailApi(
    id: number | string
): Promise<ApiResponse<Transaction>> {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data;
}

export async function getReceiptApi(
    id: number | string
): Promise<ApiResponse<ReceiptData>> {
    const response = await api.get<ApiResponse<ReceiptData>>(`/transactions/${id}/receipt`);
    return response.data;
}

export async function voidTransactionApi(
    id: number | string
): Promise<ApiResponse<Transaction>> {
    const response = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/void`);
    return response.data;
}

export async function refundTransactionApi(
    id: number | string
): Promise<ApiResponse<Transaction>> {
    const response = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/refund`);
    return response.data;
}

export async function getCurrentShiftApi(): Promise<ApiResponse<ShiftDetailResponse | null>> {
    const response = await api.get<ApiResponse<ShiftDetailResponse | null>>('/shifts/current');
    return response.data;
}

export async function getShiftsApi(params?: {
    cashier_id?: number | string;
    status?: 'open' | 'closed' | '';
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<Shift[]>> {
    const response = await api.get<ApiResponse<Shift[]>>('/shifts', {
        params,
    });
    return response.data;
}

export async function openShiftApi(
    payload: OpenShiftPayload
): Promise<ApiResponse<Shift>> {
    const response = await api.post<ApiResponse<Shift>>('/shifts/open', payload);
    return response.data;
}

export async function closeShiftApi(
    id: number | string,
    payload: CloseShiftPayload
): Promise<ApiResponse<ShiftDetailResponse>> {
    const response = await api.post<ApiResponse<ShiftDetailResponse>>(`/shifts/${id}/close`, payload);
    return response.data;
}

export async function getShiftDetailApi(
    id: number | string
): Promise<ApiResponse<ShiftDetailResponse>> {
    const response = await api.get<ApiResponse<ShiftDetailResponse>>(`/shifts/${id}`);
    return response.data;
}

export async function getShiftReportApi(
    id: number | string
): Promise<ApiResponse<ShiftDetailResponse>> {
    const response = await api.get<ApiResponse<ShiftDetailResponse>>(`/shifts/${id}/report`);
    return response.data;
}
