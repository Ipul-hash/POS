import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import {
    createDiscountApi,
    deleteDiscountApi,
    getDiscountDetailApi,
    getDiscountsApi,
    updateDiscountApi,
} from '@/services/discount.service';
import type {
    Discount,
    DiscountPayload,
    DiscountStatusFilter,
} from '@/types';

export type RealDiscountStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

export function getDiscountRealStatus(discount: Discount): RealDiscountStatus {
    if (!discount.is_active) return 'inactive';

    const now = new Date();
    // Normalize today to start of day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = new Date(discount.start_date);
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    const end = new Date(discount.end_date);
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'expired';
    return 'active';
}

export function useDiscount() {
    const discounts = ref<Discount[]>([]);
    const selectedDiscount = ref<Discount | null>(null);

    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const isDetailLoading = ref(false);

    const searchQuery = ref('');
    const selectedType = ref<'all' | 'percentage' | 'fixed'>('all');
    const selectedAppliesTo = ref<'all' | 'product' | 'transaction'>('all');
    const statusFilter = ref<DiscountStatusFilter>('all');
    const sortBy = ref<'name' | 'value' | 'start_date' | 'end_date' | 'id'>('id');
    const sortDirection = ref<'asc' | 'desc'>('desc');

    const errors = ref<Record<string, string[]>>({});

    const filteredDiscounts = computed(() => {
        let list = [...discounts.value];

        // Filter by Type (% vs Rp)
        if (selectedType.value !== 'all') {
            list = list.filter((d) => d.type === selectedType.value);
        }

        // Filter by Scope (product vs transaction)
        if (selectedAppliesTo.value !== 'all') {
            list = list.filter((d) => d.applies_to === selectedAppliesTo.value);
        }

        // Filter by Status Tab
        if (statusFilter.value === 'active') {
            list = list.filter((d) => getDiscountRealStatus(d) === 'active');
        } else if (statusFilter.value === 'product') {
            list = list.filter((d) => d.applies_to === 'product');
        } else if (statusFilter.value === 'transaction') {
            list = list.filter((d) => d.applies_to === 'transaction');
        } else if (statusFilter.value === 'scheduled') {
            list = list.filter((d) => getDiscountRealStatus(d) === 'scheduled');
        } else if (statusFilter.value === 'expired') {
            list = list.filter((d) => getDiscountRealStatus(d) === 'expired');
        } else if (statusFilter.value === 'inactive') {
            list = list.filter((d) => !d.is_active);
        }

        // Search Query (name)
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter((d) => d.name.toLowerCase().includes(q));
        }

        // Sorting
        list.sort((a, b) => {
            let valA: string | number = 0;
            let valB: string | number = 0;

            if (sortBy.value === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (sortBy.value === 'value') {
                valA = parseFloat(String(a.value)) || 0;
                valB = parseFloat(String(b.value)) || 0;
            } else if (sortBy.value === 'start_date') {
                valA = new Date(a.start_date).getTime();
                valB = new Date(b.start_date).getTime();
            } else if (sortBy.value === 'end_date') {
                valA = new Date(a.end_date).getTime();
                valB = new Date(b.end_date).getTime();
            } else if (sortBy.value === 'id') {
                valA = a.id;
                valB = b.id;
            }

            if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    });

    const totalDiscounts = computed(() => discounts.value.length);

    const activeDiscountsCount = computed(
        () => discounts.value.filter((d) => getDiscountRealStatus(d) === 'active').length
    );

    const productDiscountsCount = computed(
        () => discounts.value.filter((d) => d.applies_to === 'product').length
    );

    const transactionDiscountsCount = computed(
        () => discounts.value.filter((d) => d.applies_to === 'transaction').length
    );

    const expiredDiscountsCount = computed(
        () => discounts.value.filter((d) => getDiscountRealStatus(d) === 'expired').length
    );

    function clearErrors() {
        errors.value = {};
    }

    function setSelectedDiscount(item: Discount | null) {
        selectedDiscount.value = item;
    }

    function resetFilters() {
        searchQuery.value = '';
        selectedType.value = 'all';
        selectedAppliesTo.value = 'all';
        statusFilter.value = 'all';
        sortBy.value = 'id';
        sortDirection.value = 'desc';
    }

    function calculateDiscountAmount(discount: Discount | null, baseAmount: number): number {
        if (!discount || baseAmount <= 0) return 0;
        const val = parseFloat(String(discount.value)) || 0;
        if (discount.type === 'percentage') {
            return (baseAmount * val) / 100;
        } else {
            return Math.min(baseAmount, val);
        }
    }

    async function fetchDiscounts() {
        isLoading.value = true;
        try {
            const response = await getDiscountsApi();
            if (response.success) {
                discounts.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat daftar diskon');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || 'Terjadi kesalahan saat memuat diskon'
                );
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchDiscountDetail(id: number | string): Promise<Discount | null> {
        isDetailLoading.value = true;
        try {
            const response = await getDiscountDetailApi(id);
            if (response.success) {
                selectedDiscount.value = response.data;
                return response.data;
            } else {
                toast.error(response.message || 'Gagal mengambil detail diskon');
                return null;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || 'Gagal memuat detail diskon'
                );
            }
            return null;
        } finally {
            isDetailLoading.value = false;
        }
    }

    async function createDiscount(payload: DiscountPayload): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await createDiscountApi(payload);
            if (response.success) {
                toast.success(response.message || 'Diskon berhasil ditambahkan');
                await fetchDiscounts();
                return true;
            } else {
                toast.error(response.message || 'Gagal menambahkan diskon');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                }
                toast.error(
                    error.response?.data?.message ||
                        'Validasi gagal atau terjadi kesalahan server'
                );
            } else {
                toast.error('Terjadi kesalahan saat menambahkan diskon');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function updateDiscount(
        id: number | string,
        payload: Partial<DiscountPayload>
    ): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await updateDiscountApi(id, payload);
            if (response.success) {
                toast.success(response.message || 'Diskon berhasil diperbarui');
                await fetchDiscounts();
                return true;
            } else {
                toast.error(response.message || 'Gagal memperbarui diskon');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                }
                toast.error(
                    error.response?.data?.message ||
                        'Validasi gagal atau terjadi kesalahan server'
                );
            } else {
                toast.error('Terjadi kesalahan saat memperbarui diskon');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function toggleDiscountStatus(discount: Discount): Promise<boolean> {
        const newStatus = !discount.is_active;
        try {
            const response = await updateDiscountApi(discount.id, {
                is_active: newStatus,
            });
            if (response.success) {
                toast.success(
                    newStatus
                        ? `Diskon "${discount.name}" diaktifkan`
                        : `Diskon "${discount.name}" dinonaktifkan`
                );
                await fetchDiscounts();
                return true;
            } else {
                toast.error(response.message || 'Gagal mengubah status diskon');
                return false;
            }
        } catch {
            toast.error('Terjadi kesalahan saat mengubah status diskon');
            return false;
        }
    }

    async function deleteDiscount(id: number | string): Promise<boolean> {
        isSubmitting.value = true;
        try {
            const response = await deleteDiscountApi(id);
            if (response.success) {
                toast.success(response.message || 'Diskon berhasil dinonaktifkan');
                await fetchDiscounts();
                return true;
            } else {
                toast.error(response.message || 'Gagal menonaktifkan diskon');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        'Terjadi kesalahan saat menghapus diskon'
                );
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        discounts,
        selectedDiscount,
        isLoading,
        isSubmitting,
        isDetailLoading,
        searchQuery,
        selectedType,
        selectedAppliesTo,
        statusFilter,
        sortBy,
        sortDirection,
        errors,
        filteredDiscounts,
        totalDiscounts,
        activeDiscountsCount,
        productDiscountsCount,
        transactionDiscountsCount,
        expiredDiscountsCount,
        clearErrors,
        setSelectedDiscount,
        resetFilters,
        calculateDiscountAmount,
        fetchDiscounts,
        fetchDiscountDetail,
        createDiscount,
        updateDiscount,
        toggleDiscountStatus,
        deleteDiscount,
    };
}
