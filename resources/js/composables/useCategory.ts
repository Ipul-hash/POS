import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import {
    createCategoryApi,
    deleteCategoryApi,
    getCategoriesApi,
    getCategoryDetailApi,
    updateCategoryApi,
} from '@/services/category.service';
import type { Category, CategoryPayload } from '@/types';

export function useCategory() {
    const categories = ref<Category[]>([]);
    const selectedCategory = ref<Category | null>(null);
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const searchQuery = ref('');
    const errors = ref<Record<string, string[]>>({});

    const filteredCategories = computed(() => {
        if (!searchQuery.value.trim()) {
            return categories.value;
        }

        const query = searchQuery.value.toLowerCase().trim();
        return categories.value.filter((category) => {
            const matchName = category.name.toLowerCase().includes(query);
            const matchDescription = (category.description || '').toLowerCase().includes(query);
            return matchName || matchDescription;
        });
    });

    const totalCategories = computed(() => categories.value.length);

    const totalCategoriesWithProducts = computed(
        () => categories.value.filter((c) => (c.products?.length ?? 0) > 0).length
    );

    const totalProductsCount = computed(() =>
        categories.value.reduce((acc, curr) => acc + (curr.products?.length ?? 0), 0)
    );

    function clearErrors() {
        errors.value = {};
    }

    function setSelectedCategory(category: Category | null) {
        selectedCategory.value = category;
    }

    async function fetchCategories() {
        isLoading.value = true;
        try {
            const response = await getCategoriesApi();
            if (response.success) {
                categories.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat data kategori');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Terjadi kesalahan saat memuat kategori');
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchCategoryDetail(id: number | string) {
        isLoading.value = true;
        try {
            const response = await getCategoryDetailApi(id);
            if (response.success) {
                selectedCategory.value = response.data;
                return response.data;
            } else {
                toast.error(response.message || 'Detail kategori tidak ditemukan');
                return null;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal mengambil detail kategori');
            } else {
                toast.error('Terjadi kesalahan yang tidak terduga');
            }
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function createCategory(payload: CategoryPayload): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await createCategoryApi(payload);
            if (response.success) {
                toast.success(response.message || 'Kategori berhasil ditambahkan');
                await fetchCategories();
                return true;
            } else {
                toast.error(response.message || 'Gagal menambahkan kategori');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                }
                toast.error(error.response?.data?.message || 'Validasi gagal atau terjadi kesalahan server');
            } else {
                toast.error('Terjadi kesalahan saat menyimpan data');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function updateCategory(id: number | string, payload: CategoryPayload): Promise<boolean> {
        clearErrors();
        isSubmitting.value = true;
        try {
            const response = await updateCategoryApi(id, payload);
            if (response.success) {
                toast.success(response.message || 'Kategori berhasil diperbarui');
                await fetchCategories();
                return true;
            } else {
                toast.error(response.message || 'Gagal memperbarui kategori');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.errors) {
                    errors.value = error.response.data.errors;
                }
                toast.error(error.response?.data?.message || 'Validasi gagal atau terjadi kesalahan server');
            } else {
                toast.error('Terjadi kesalahan saat memperbarui data');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function deleteCategory(id: number | string): Promise<boolean> {
        isSubmitting.value = true;
        try {
            const response = await deleteCategoryApi(id);
            if (response.success) {
                toast.success(response.message || 'Kategori berhasil dihapus');
                categories.value = categories.value.filter((c) => c.id !== Number(id));
                if (selectedCategory.value?.id === Number(id)) {
                    selectedCategory.value = null;
                }
                return true;
            } else {
                toast.error(response.message || 'Gagal menghapus kategori');
                return false;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal menghapus kategori');
            } else {
                toast.error('Terjadi kesalahan saat menghapus data');
            }
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    return {
        categories,
        filteredCategories,
        selectedCategory,
        isLoading,
        isSubmitting,
        searchQuery,
        errors,
        totalCategories,
        totalCategoriesWithProducts,
        totalProductsCount,
        clearErrors,
        setSelectedCategory,
        fetchCategories,
        fetchCategoryDetail,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}
