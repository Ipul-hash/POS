import api from '@/lib/axios';
import type {
    ApiResponse,
    BestSellerItem,
    CashierPerformanceItem,
    DashboardPeriodFilter,
    DashboardSummaryData,
    InventoryReportData,
    SalesReportData,
} from '@/types';

export async function getDashboardSummaryApi(params?: {
    period?: DashboardPeriodFilter;
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<DashboardSummaryData>> {
    const response = await api.get<ApiResponse<DashboardSummaryData>>('/dashboard-summary', {
        params,
    });
    return response.data;
}

export async function getSalesReportApi(params?: {
    period?: DashboardPeriodFilter;
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<SalesReportData>> {
    const response = await api.get<ApiResponse<SalesReportData>>('/sales', {
        params,
    });
    return response.data;
}

export async function getBestSellerApi(params?: {
    limit?: number;
    period?: DashboardPeriodFilter;
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<BestSellerItem[]>> {
    const response = await api.get<ApiResponse<BestSellerItem[]>>('/best-seller', {
        params,
    });
    return response.data;
}

export async function getInventoryReportApi(): Promise<ApiResponse<InventoryReportData>> {
    const response = await api.get<ApiResponse<InventoryReportData>>('/inventory');
    return response.data;
}

export async function getCashierPerformanceApi(params?: {
    period?: DashboardPeriodFilter;
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<CashierPerformanceItem[]>> {
    const response = await api.get<ApiResponse<CashierPerformanceItem[]>>('/cashier-performance', {
        params,
    });
    return response.data;
}

export async function getExportReportApi(params?: {
    period?: DashboardPeriodFilter;
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<unknown>> {
    const response = await api.get<ApiResponse<unknown>>('/export', {
        params,
    });
    return response.data;
}
