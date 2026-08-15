import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import { getCategoriesApi } from '@/services/category.service';
import {
    adjustStockApi,
    getInventoriesApi,
    getStockMovementsApi,
    updateMinStockApi,
} from '@/services/inventory.service';
import type {
    Category,
    InventoryFilterStatus,
    InventoryItem,
    StockAdjustmentPayload,
    StockMovement,
} from '@/types';

export function useInventory() {
    const inventories = ref<InventoryItem[]>([]);
    const categories = ref<Category[]>([]);
    const stockMovements = ref<StockMovement[]>([]);
    const selectedInventory = ref<InventoryItem | null>(null);

    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const isMovementsLoading = ref(false);
    const isCategoriesLoading = ref(false);

    const searchQuery = ref('');
    const selectedCategoryId = ref<number | string | 'all'>('all');
    const statusFilter = ref<InventoryFilterStatus>('all');
    const sortBy = ref<'name' | 'quantity' | 'min_stock' | 'valuation'>('quantity');
    const sortDirection = ref<'asc' | 'desc'>('asc');

    const errors = ref<Record<string, string[]>>({});

    const filteredInventories = computed(() => {
        let list = [...inventories.value];

        // Filter by Category
        if (selectedCategoryId.value !== 'all' && selectedCategoryId.value !== '') {
            const catId = Number(selectedCategoryId.value);
            list = list.filter((item) => item.product?.category_id === catId);
        }

        // Filter by Stock Status
        if (statusFilter.value === 'safe') {
            list = list.filter((item) => item.quantity > item.min_stock);
        } else if (statusFilter.value === 'low_stock') {
            list = list.filter((item) => item.quantity > 0 && item.quantity <= item.min_stock);
        } else if (statusFilter.value === 'out_of_stock') {
            list = list.filter((item) => item.quantity <= 0);
        }

        // Filter by Search Query (Name, SKU, Barcode)
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter((item) => {
                const name = (item.product?.name || '').toLowerCase();
                const sku = (item.product?.sku || '').toLowerCase();
                const barcode = (item.product?.barcode || '').toLowerCase();
                const catName = (item.product?.category?.name || '').toLowerCase();
                return (
                    name.includes(q) ||
                    sku.includes(q) ||
                    barcode.includes(q) ||
                    catName.includes(q)
                );
            });
        }

        // Sorting
        list.sort((a, b) => {
            let valA: string | number = 0;
            let valB: string | number = 0;

            if (sortBy.value === 'name') {
                valA = (a.product?.name || '').toLowerCase();
                valB = (b.product?.name || '').toLowerCase();
            } else if (sortBy.value === 'quantity') {
                valA = a.quantity;
                valB = b.quantity;
            } else if (sortBy.value === 'min_stock') {
                valA = a.min_stock;
                valB = b.min_stock;
            } else if (sortBy.value === 'valuation') {
                valA = (parseFloat(String(a.product?.sell_price)) || 0) * a.quantity;
                valB = (parseFloat(String(b.product?.sell_price)) || 0) * b.quantity;
            }

            if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    });

    const totalItems = computed(() => inventories.value.length);

    const safeStockCount = computed(
        () => inventories.value.filter((i) => i.quantity > i.min_stock).length
    );

    const lowStockCount = computed(
        () => inventories.value.filter((i) => i.quantity > 0 && i.quantity <= i.min_stock).length
    );

    const outOfStockCount = computed(
        () => inventories.value.filter((i) => i.quantity <= 0).length
    );

    const totalStockUnits = computed(() =>
        inventories.value.reduce((acc, curr) => acc + (curr.quantity || 0), 0)
    );

    const totalInventoryCostValuation = computed(() =>
        inventories.value.reduce((acc, curr) => {
            const cost = parseFloat(String(curr.product?.cost_price)) || 0;
            return acc + cost * (curr.quantity || 0);
        }, 0)
    );

    const totalInventorySellValuation = computed(() =>
        inventories.value.reduce((acc, curr) => {
            const sell = parseFloat(String(curr.product?.sell_price)) || 0;
            return acc + sell * (curr.quantity || 0);
        }, 0)
    );

    function clearErrors() {
        errors.value = {};
    }

    function setSelectedInventory(item: InventoryItem | null) {
        selectedInventory.value = item;
    }

    function resetFilters() {
        searchQuery.value = '';
        selectedCategoryId.value = 'all';
        statusFilter.value = 'all';
        sortBy.value = 'quantity';
        sortDirection.value = 'asc';
    }

    async function fetchCategories() {
        isCategoriesLoading.value = true;
        try {
            const response = await getCategoriesApi();
            if (response.success) {
                categories.value = response.data;
            }
        } catch {
            // Silently fail or handled globally
        } finally {
            isCategoriesLoading.value = false;
        }
    }

    async function fetchInventories() {
        isLoading.value = true;
        try {
            const response = await getInventoriesApi();
            if (response.success) {
                inventories.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat data inventori');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        'Terjadi kesalahan saat memuat data inventori'
                );
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchStockMovements(params?: {
        product_id?: number | string;
        type?: string;
    }) {
        isMovementsLoading.value = true;
        try {
            const response = await getStockMovementsApi(params);
            if (response.success) {
                stockMovements.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat riwayat mutasi stok');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message || 'Gagal mengambil riwayat mutasi stok'
                );
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            isMovementsLoading.value = false;
        }
    }

    async function adjustStock(payload: StockAdjustmentPayload): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await adjustStockApi(payload);
            if (response.success) {
                toast.success(response.message || 'Stok berhasil disesuaikan');
                await fetchInventories();
                return true;
            } else {
                toast.error(response.message || 'Gagal menyesuaikan stok');
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
                toast.error('Terjadi kesalahan saat menyesuaikan stok');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function updateMinStock(
        id: number | string,
        min_stock: number
    ): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await updateMinStockApi(id, { min_stock });
            if (response.success) {
                toast.success(response.message || 'Batas minimum stok berhasil diupdate');
                await fetchInventories();
                return true;
            } else {
                toast.error(response.message || 'Gagal mengupdate batas stok');
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
                toast.error('Terjadi kesalahan saat mengupdate batas stok');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        inventories,
        categories,
        stockMovements,
        selectedInventory,
        isLoading,
        isSubmitting,
        isMovementsLoading,
        isCategoriesLoading,
        searchQuery,
        selectedCategoryId,
        statusFilter,
        sortBy,
        sortDirection,
        errors,
        filteredInventories,
        totalItems,
        safeStockCount,
        lowStockCount,
        outOfStockCount,
        totalStockUnits,
        totalInventoryCostValuation,
        totalInventorySellValuation,
        clearErrors,
        setSelectedInventory,
        resetFilters,
        fetchCategories,
        fetchInventories,
        fetchStockMovements,
        adjustStock,
        updateMinStock,
    };
}
