import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import {
    createUserApi,
    deleteUserApi,
    getRolesApi,
    getUsersApi,
    updateUserApi,
} from '@/services/user.service';
import type {
    CreateUserPayload,
    RoleItem,
    UpdateUserPayload,
    UserAccount,
} from '@/types';

export function useUserManagement() {
    const users = ref<UserAccount[]>([]);
    const roles = ref<RoleItem[]>([]);
    const isLoading = ref<boolean>(false);
    const isActionLoading = ref<boolean>(false);

    const searchQuery = ref<string>('');
    const selectedRoleFilter = ref<string>('all');

    const isFormModalOpen = ref<boolean>(false);
    const isDetailModalOpen = ref<boolean>(false);
    const selectedUser = ref<UserAccount | null>(null);
    const editingUser = ref<UserAccount | null>(null);

    const filteredUsers = computed(() => {
        let list = [...users.value];

        if (selectedRoleFilter.value !== 'all') {
            list = list.filter((u) =>
                u.roles?.some((r) => r.name.toLowerCase() === selectedRoleFilter.value.toLowerCase())
            );
        }

        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.roles?.some((r) => r.name.toLowerCase().includes(q))
            );
        }

        return list;
    });

    const userStats = computed(() => {
        const total = users.value.length;
        const kasirCount = users.value.filter((u) =>
            u.roles?.some((r) => r.name === 'kasir')
        ).length;
        const adminOwnerCount = users.value.filter((u) =>
            u.roles?.some((r) => r.name === 'owner' || r.name === 'admin')
        ).length;
        const activeCount = users.value.filter((u) => u.is_active).length;

        return {
            total,
            kasirCount,
            adminOwnerCount,
            activeCount,
        };
    });

    async function fetchUsers() {
        isLoading.value = true;
        try {
            const response = await getUsersApi();
            if (response.success) {
                users.value = response.data;
            } else {
                toast.error(response.message || 'Gagal memuat data pengguna');
            }
        } catch {
            toast.error('Terjadi kesalahan saat memuat data pengguna');
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchRoles() {
        try {
            const response = await getRolesApi();
            if (response.success) {
                roles.value = response.data;
            }
        } catch {
            // Silently handle
        }
    }

    function openCreateModal() {
        editingUser.value = null;
        isFormModalOpen.value = true;
    }

    function openEditModal(user: UserAccount) {
        editingUser.value = user;
        isFormModalOpen.value = true;
    }

    function openDetailModal(user: UserAccount) {
        selectedUser.value = user;
        isDetailModalOpen.value = true;
    }

    async function saveUser(payload: CreateUserPayload | UpdateUserPayload): Promise<boolean> {
        isActionLoading.value = true;
        try {
            if (editingUser.value) {
                const response = await updateUserApi(editingUser.value.id, payload as UpdateUserPayload);
                if (response.success) {
                    toast.success('Data pengguna berhasil diperbarui');
                    isFormModalOpen.value = false;
                    await fetchUsers();
                    return true;
                } else {
                    toast.error(response.message || 'Gagal memperbarui pengguna');
                    return false;
                }
            } else {
                const response = await createUserApi(payload as CreateUserPayload);
                if (response.success) {
                    toast.success('Pengguna baru berhasil dibuat');
                    isFormModalOpen.value = false;
                    await fetchUsers();
                    return true;
                } else {
                    toast.error(response.message || 'Gagal membuat pengguna');
                    return false;
                }
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Terjadi kesalahan saat menyimpan data pengguna');
            }
            return false;
        } finally {
            isActionLoading.value = false;
        }
    }

    async function toggleUserStatus(user: UserAccount) {
        const newStatus = !user.is_active;
        try {
            const response = await updateUserApi(user.id, { is_active: newStatus });
            if (response.success) {
                toast.success(`Pengguna ${user.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
                await fetchUsers();
            }
        } catch {
            toast.error('Gagal mengubah status pengguna');
        }
    }

    async function deactivateUser(user: UserAccount) {
        if (!confirm(`Nonaktifkan akun pengguna ${user.name}? Pengguna tidak akan dapat login lagi.`)) {
            return;
        }

        isActionLoading.value = true;
        try {
            const response = await deleteUserApi(user.id);
            if (response.success) {
                toast.success(`Pengguna ${user.name} berhasil dinonaktifkan`);
                await fetchUsers();
            }
        } catch {
            toast.error('Gagal menonaktifkan pengguna');
        } finally {
            isActionLoading.value = false;
        }
    }

    return {
        users,
        roles,
        isLoading,
        isActionLoading,
        searchQuery,
        selectedRoleFilter,
        isFormModalOpen,
        isDetailModalOpen,
        selectedUser,
        editingUser,
        filteredUsers,
        userStats,
        fetchUsers,
        fetchRoles,
        openCreateModal,
        openEditModal,
        openDetailModal,
        saveUser,
        toggleUserStatus,
        deactivateUser,
    };
}
