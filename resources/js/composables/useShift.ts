import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import {
    closeShiftApi,
    getCurrentShiftApi,
    getShiftDetailApi,
    getShiftReportApi,
    getShiftsApi,
    openShiftApi,
} from '@/services/pos.service';
import type {
    Shift,
    ShiftDetailResponse,
    ShiftSummary,
} from '@/types';

export function useShift() {
    const currentShift = ref<Shift | null>(null);
    const currentShiftSummary = ref<ShiftSummary | null>(null);
    const shiftsHistory = ref<Shift[]>([]);
    const selectedShiftDetail = ref<ShiftDetailResponse | null>(null);

    const isLoading = ref(false);
    const isActionLoading = ref(false);
    const isReportLoading = ref(false);

    const isOpenModalOpen = ref(false);
    const isCloseModalOpen = ref(false);
    const isReportModalOpen = ref(false);

    const isShiftActive = computed(() => {
        return !!currentShift.value && !currentShift.value.closed_at;
    });

    async function fetchCurrentShift(): Promise<Shift | null> {
        try {
            const response = await getCurrentShiftApi();
            if (response.success && response.data) {
                currentShift.value = response.data.shift;
                currentShiftSummary.value = response.data.summary;
                return response.data.shift;
            } else {
                currentShift.value = null;
                currentShiftSummary.value = null;
                return null;
            }
        } catch {
            currentShift.value = null;
            currentShiftSummary.value = null;
            return null;
        }
    }

    async function fetchShiftsHistory(params?: {
        cashier_id?: number | string;
        status?: 'open' | 'closed' | '';
        start_date?: string;
        end_date?: string;
    }) {
        isLoading.value = true;
        try {
            const response = await getShiftsApi(params);
            if (response.success) {
                shiftsHistory.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat histori shift');
            }
        } catch {
            toast.error('Terjadi kesalahan saat memuat histori shift');
        } finally {
            isLoading.value = false;
        }
    }

    async function openShift(openingBalance: number): Promise<boolean> {
        isActionLoading.value = true;
        try {
            const response = await openShiftApi({ opening_balance: openingBalance });
            if (response.success && response.data) {
                toast.success('Shift kasir berhasil dibuka');
                currentShift.value = response.data;
                isOpenModalOpen.value = false;
                await fetchCurrentShift();
                return true;
            } else {
                toast.error(response.message || 'Gagal membuka shift');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || 'Gagal membuka shift kasir'
                );
            } else {
                toast.error('Terjadi kesalahan saat membuka shift');
            }
            return false;
        } finally {
            isActionLoading.value = false;
        }
    }

    async function closeShift(
        shiftId: number,
        closingBalance: number
    ): Promise<ShiftDetailResponse | null> {
        isActionLoading.value = true;
        try {
            const response = await closeShiftApi(shiftId, {
                closing_balance: closingBalance,
            });
            if (response.success && response.data) {
                toast.success('Shift kasir berhasil ditutup dan laporan penjualan telah tergenerate');
                selectedShiftDetail.value = response.data;
                currentShift.value = null;
                currentShiftSummary.value = null;
                isCloseModalOpen.value = false;
                isReportModalOpen.value = true; // Auto open Z-Report modal
                return response.data;
            } else {
                toast.error(response.message || 'Gagal menutup shift');
                return null;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || 'Gagal menutup shift kasir'
                );
            } else {
                toast.error('Terjadi kesalahan saat menutup shift');
            }
            return null;
        } finally {
            isActionLoading.value = false;
        }
    }

    async function fetchShiftReport(shiftId: number | string): Promise<ShiftDetailResponse | null> {
        isReportLoading.value = true;
        try {
            const response = await getShiftReportApi(shiftId);
            if (response.success && response.data) {
                selectedShiftDetail.value = response.data;
                isReportModalOpen.value = true;
                return response.data;
            } else {
                toast.error(response.message || 'Gagal mengambil laporan shift');
                return null;
            }
        } catch {
            toast.error('Gagal memuat data laporan shift');
            return null;
        } finally {
            isReportLoading.value = false;
        }
    }

    async function fetchShiftDetail(shiftId: number | string): Promise<ShiftDetailResponse | null> {
        isLoading.value = true;
        try {
            const response = await getShiftDetailApi(shiftId);
            if (response.success && response.data) {
                selectedShiftDetail.value = response.data;
                return response.data;
            }
            return null;
        } catch {
            toast.error('Gagal mengambil detail data shift');
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        currentShift,
        currentShiftSummary,
        shiftsHistory,
        selectedShiftDetail,
        isLoading,
        isActionLoading,
        isReportLoading,
        isOpenModalOpen,
        isCloseModalOpen,
        isReportModalOpen,
        isShiftActive,
        fetchCurrentShift,
        fetchShiftsHistory,
        openShift,
        closeShift,
        fetchShiftReport,
        fetchShiftDetail,
    };
}
