import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import {
    getBestSellerApi,
    getCashierPerformanceApi,
    getDashboardSummaryApi,
    getExportReportApi,
    getInventoryReportApi,
    getSalesReportApi,
} from '@/services/dashboard.service';
import type {
    BestSellerItem,
    CashierPerformanceItem,
    DashboardPeriodFilter,
    DashboardSummaryData,
    InventoryReportData,
    SalesReportData,
} from '@/types';

export function useDashboard() {
    const periodFilter = ref<DashboardPeriodFilter>('today');
    const customStartDate = ref<string>('');
    const customEndDate = ref<string>('');

    const summary = ref<DashboardSummaryData | null>(null);
    const salesReport = ref<SalesReportData | null>(null);
    const bestSellers = ref<BestSellerItem[]>([]);
    const inventoryReport = ref<InventoryReportData | null>(null);
    const cashierPerformance = ref<CashierPerformanceItem[]>([]);

    const isLoading = ref<boolean>(false);
    const isRefreshing = ref<boolean>(false);

    const grossProfitMargin = computed(() => {
        if (!summary.value || summary.value.total_revenue <= 0) return 0;
        return Math.round((summary.value.gross_profit / summary.value.total_revenue) * 100);
    });

    const timeSeriesData = computed(() => {
        return salesReport.value?.time_series || [];
    });

    const paymentDistributionData = computed(() => {
        return salesReport.value?.payment_distribution || [];
    });

    async function fetchDashboardData(isSilent = false) {
        if (!isSilent) isLoading.value = true;
        else isRefreshing.value = true;

        try {
            const params = {
                period: periodFilter.value,
                start_date: customStartDate.value || undefined,
                end_date: customEndDate.value || undefined,
            };

            const [
                summaryRes,
                salesRes,
                bestSellerRes,
                inventoryRes,
                cashierRes,
            ] = await Promise.allSettled([
                getDashboardSummaryApi(params),
                getSalesReportApi(params),
                getBestSellerApi({ ...params, limit: 5 }),
                getInventoryReportApi(),
                getCashierPerformanceApi(params),
            ]);

            if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
                summary.value = summaryRes.value.data;
            }
            if (salesRes.status === 'fulfilled' && salesRes.value.success) {
                salesReport.value = salesRes.value.data;
            }
            if (bestSellerRes.status === 'fulfilled' && bestSellerRes.value.success) {
                bestSellers.value = bestSellerRes.value.data;
            }
            if (inventoryRes.status === 'fulfilled' && inventoryRes.value.success) {
                inventoryReport.value = inventoryRes.value.data;
            }
            if (cashierRes.status === 'fulfilled' && cashierRes.value.success) {
                cashierPerformance.value = cashierRes.value.data;
            }
        } catch {
            toast.error('Gagal memuat ringkasan data dashboard');
        } finally {
            isLoading.value = false;
            isRefreshing.value = false;
        }
    }

    function setPeriod(newPeriod: DashboardPeriodFilter) {
        periodFilter.value = newPeriod;
        customStartDate.value = '';
        customEndDate.value = '';
        fetchDashboardData();
    }

    async function handleExport() {
        try {
            const params = {
                period: periodFilter.value,
                start_date: customStartDate.value || undefined,
                end_date: customEndDate.value || undefined,
            };

            const response = await getExportReportApi(params);
            if (response.success && response.data) {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response.data, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `laporan-pos-${periodFilter.value}-${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                toast.success('Laporan penjualan berhasil diekspor');
            }
        } catch {
            toast.error('Gagal mengekspor laporan');
        }
    }

    return {
        periodFilter,
        customStartDate,
        customEndDate,
        summary,
        salesReport,
        bestSellers,
        inventoryReport,
        cashierPerformance,
        isLoading,
        isRefreshing,
        grossProfitMargin,
        timeSeriesData,
        paymentDistributionData,
        fetchDashboardData,
        setPeriod,
        handleExport,
    };
}
