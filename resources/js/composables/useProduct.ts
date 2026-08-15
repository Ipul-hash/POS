import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import { getCategoriesApi } from '@/services/category.service';
import {
    createProductApi,
    deleteProductApi,
    getProductDetailApi,
    getProductsApi,
    getProductStockApi,
    updateProductApi,
} from '@/services/product.service';
import type {
    Category,
    Product,
    ProductPayload,
    ProductStock,
    ProductStockStatusFilter,
} from '@/types';

export function useProduct() {
    const products = ref<Product[]>([]);
    const categories = ref<Category[]>([]);
    const selectedProduct = ref<Product | null>(null);
    const selectedProductStock = ref<ProductStock | null>(null);

    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const isStockLoading = ref(false);
    const isCategoriesLoading = ref(false);

    const searchQuery = ref('');
    const selectedCategoryId = ref<number | string | 'all'>('all');
    const stockStatusFilter = ref<ProductStockStatusFilter>('all');
    const sortBy = ref<'name' | 'sell_price' | 'quantity' | 'created_at'>('created_at');
    const sortDirection = ref<'asc' | 'desc'>('desc');

    const errors = ref<Record<string, string[]>>({});

    const filteredProducts = computed(() => {
        let list = [...products.value];

        // Filter by Category
        if (selectedCategoryId.value !== 'all' && selectedCategoryId.value !== '') {
            const catId = Number(selectedCategoryId.value);
            list = list.filter((p) => p.category_id === catId);
        }

        // Filter by Stock Status
        if (stockStatusFilter.value === 'active') {
            list = list.filter((p) => p.is_active);
        } else if (stockStatusFilter.value === 'inactive') {
            list = list.filter((p) => !p.is_active);
        } else if (stockStatusFilter.value === 'low_stock') {
            list = list.filter((p) => {
                const qty = p.inventory?.quantity ?? 0;
                const min = p.inventory?.min_stock ?? 0;
                return qty > 0 && qty <= min;
            });
        } else if (stockStatusFilter.value === 'out_of_stock') {
            list = list.filter((p) => (p.inventory?.quantity ?? 0) <= 0);
        }

        // Filter by Search Query (Name, SKU, Barcode)
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter((p) => {
                const matchName = p.name.toLowerCase().includes(q);
                const matchSku = p.sku.toLowerCase().includes(q);
                const matchBarcode = (p.barcode || '').toLowerCase().includes(q);
                const matchCategory = (p.category?.name || '').toLowerCase().includes(q);
                return matchName || matchSku || matchBarcode || matchCategory;
            });
        }

        // Sorting
        list.sort((a, b) => {
            let valA: string | number = 0;
            let valB: string | number = 0;

            if (sortBy.value === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (sortBy.value === 'sell_price') {
                valA = parseFloat(String(a.sell_price)) || 0;
                valB = parseFloat(String(b.sell_price)) || 0;
            } else if (sortBy.value === 'quantity') {
                valA = a.inventory?.quantity ?? 0;
                valB = b.inventory?.quantity ?? 0;
            } else if (sortBy.value === 'created_at') {
                valA = new Date(a.created_at || 0).getTime();
                valB = new Date(b.created_at || 0).getTime();
            }

            if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    });

    const totalProducts = computed(() => products.value.length);

    const activeProductsCount = computed(
        () => products.value.filter((p) => p.is_active).length
    );

    const inactiveProductsCount = computed(
        () => products.value.filter((p) => !p.is_active).length
    );

    const lowStockCount = computed(() =>
        products.value.filter((p) => {
            const qty = p.inventory?.quantity ?? 0;
            const min = p.inventory?.min_stock ?? 0;
            return qty > 0 && qty <= min;
        }).length
    );

    const outOfStockCount = computed(() =>
        products.value.filter((p) => (p.inventory?.quantity ?? 0) <= 0).length
    );

    const totalStockUnits = computed(() =>
        products.value.reduce((acc, p) => acc + (p.inventory?.quantity ?? 0), 0)
    );

    const totalInventoryCostValuation = computed(() =>
        products.value.reduce((acc, p) => {
            const cost = parseFloat(String(p.cost_price)) || 0;
            const qty = p.inventory?.quantity ?? 0;
            return acc + cost * qty;
        }, 0)
    );

    const totalInventorySellValuation = computed(() =>
        products.value.reduce((acc, p) => {
            const sell = parseFloat(String(p.sell_price)) || 0;
            const qty = p.inventory?.quantity ?? 0;
            return acc + sell * qty;
        }, 0)
    );

    function clearErrors() {
        errors.value = {};
    }

    function setSelectedProduct(product: Product | null) {
        selectedProduct.value = product;
    }

    function setSelectedProductStock(stock: ProductStock | null) {
        selectedProductStock.value = stock;
    }

    function resetFilters() {
        searchQuery.value = '';
        selectedCategoryId.value = 'all';
        stockStatusFilter.value = 'all';
        sortBy.value = 'created_at';
        sortDirection.value = 'desc';
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

    async function fetchProducts() {
        isLoading.value = true;
        try {
            const response = await getProductsApi();
            if (response.success) {
                products.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat data produk');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Terjadi kesalahan saat memuat data produk');
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchProductDetail(id: number | string): Promise<Product | null> {
        isLoading.value = true;
        try {
            const response = await getProductDetailApi(id);
            if (response.success) {
                selectedProduct.value = response.data;
                return response.data;
            } else {
                toast.error(response.message || 'Detail produk tidak ditemukan');
                return null;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal mengambil detail produk');
            } else {
                toast.error('Terjadi kesalahan saat mengambil detail');
            }
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchProductStock(id: number | string): Promise<ProductStock | null> {
        isStockLoading.value = true;
        try {
            const response = await getProductStockApi(id);
            if (response.success) {
                selectedProductStock.value = response.data;
                return response.data;
            } else {
                toast.error(response.message || 'Gagal mengambil stok produk');
                return null;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal mengambil data stok');
            } else {
                toast.error('Terjadi kesalahan saat memeriksa stok');
            }
            return null;
        } finally {
            isStockLoading.value = false;
        }
    }

    async function createProduct(payload: ProductPayload): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await createProductApi(payload);
            if (response.success) {
                toast.success(response.message || 'Produk berhasil ditambahkan');
                await fetchProducts();
                return true;
            } else {
                toast.error(response.message || 'Gagal menambahkan produk');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                }
                toast.error(error.response?.data?.message || 'Validasi gagal atau kesalahan server');
            } else {
                toast.error('Terjadi kesalahan saat menyimpan produk');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function updateProduct(
        id: number | string,
        payload: Partial<ProductPayload>
    ): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await updateProductApi(id, payload);
            if (response.success) {
                toast.success(response.message || 'Produk berhasil diperbarui');
                await fetchProducts();
                if (selectedProduct.value?.id === Number(id)) {
                    selectedProduct.value = response.data;
                }
                return true;
            } else {
                toast.error(response.message || 'Gagal memperbarui produk');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                }
                toast.error(error.response?.data?.message || 'Validasi gagal atau kesalahan server');
            } else {
                toast.error('Terjadi kesalahan saat memperbarui produk');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function toggleProductStatus(product: Product): Promise<boolean> {
        const newStatus = !product.is_active;
        try {
            const response = await updateProductApi(product.id, {
                is_active: newStatus,
            });
            if (response.success) {
                toast.success(
                    `Status produk diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`
                );
                product.is_active = newStatus;
                return true;
            }
            return false;
        } catch {
            toast.error('Gagal memperbarui status produk');
            return false;
        }
    }

    async function deleteProduct(id: number | string): Promise<boolean> {
        isSubmitting.value = true;
        try {
            const response = await deleteProductApi(id);
            if (response.success) {
                toast.success(response.message || 'Produk berhasil dihapus');
                await fetchProducts();
                if (selectedProduct.value?.id === Number(id)) {
                    selectedProduct.value = null;
                }
                return true;
            } else {
                toast.error(response.message || 'Gagal menghapus produk');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal menghapus produk');
            } else {
                toast.error('Terjadi kesalahan saat menghapus produk');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        products,
        categories,
        selectedProduct,
        selectedProductStock,
        isLoading,
        isSubmitting,
        isStockLoading,
        isCategoriesLoading,
        searchQuery,
        selectedCategoryId,
        stockStatusFilter,
        sortBy,
        sortDirection,
        errors,
        filteredProducts,
        totalProducts,
        activeProductsCount,
        inactiveProductsCount,
        lowStockCount,
        outOfStockCount,
        totalStockUnits,
        totalInventoryCostValuation,
        totalInventorySellValuation,
        clearErrors,
        setSelectedProduct,
        setSelectedProductStock,
        resetFilters,
        fetchCategories,
        fetchProducts,
        fetchProductDetail,
        fetchProductStock,
        createProduct,
        updateProduct,
        toggleProductStatus,
        deleteProduct,
    };
}
