<script setup lang="ts">
import { onMounted } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    Ban,
    CheckCircle2,
    Eye,
    FolderTree,
    KeyRound,
    Lock,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    UserPlus,
    Users,
    XCircle,
} from '@lucide/vue';
import UserDetailModal from '@/components/master-data/user/UserDetailModal.vue';
import UserFormModal from '@/components/master-data/user/UserFormModal.vue';
import { useUserManagement } from '@/composables/useUserManagement';
import { formatDateTime } from '@/lib/formatters';
import type { BreadcrumbItem } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
            {
                title: 'Master Data',
                href: '/master-data/products',
            },
            {
                title: 'Kelola Pengguna & Kasir',
                href: '/master-data/users',
            },
        ] as BreadcrumbItem[],
    },
});

const {
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
} = useUserManagement();

onMounted(async () => {
    await Promise.all([fetchUsers(), fetchRoles()]);
});

const roleColors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    kasir: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
};
</script>

<template>
    <Head title="Kelola Pengguna & Kasir" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <ShieldCheck class="size-3.5" />
                    <span>Master Data</span>
                    <span class="text-neutral-300 dark:text-neutral-700">&bull;</span>
                    <span class="text-neutral-900 dark:text-neutral-100">Hak Akses & Pengguna</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Kelola Pengguna & Kasir
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Atur akun staf outlet, buat akun kasir baru, dan tentukan hak akses peran (Owner, Admin, Kasir).
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <button
                    type="button"
                    class="inline-flex h-9 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all cursor-pointer"
                    @click="openCreateModal"
                >
                    <UserPlus class="size-4" />
                    <span>Tambah Pengguna Baru</span>
                </button>
            </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Total Pengguna
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ userStats.total }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">akun terdaftar</span>
                </div>
            </div>

            <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Akun Kasir (Cashier)
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100 font-mono">
                        {{ userStats.kasirCount }}
                    </span>
                    <span class="text-[11px] text-emerald-600/80 dark:text-emerald-400 font-medium">staf kasir</span>
                </div>
            </div>

            <div class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-2xs dark:border-blue-900/40 dark:bg-blue-950/20">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Admin & Owner
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100 font-mono">
                        {{ userStats.adminOwnerCount }}
                    </span>
                    <span class="text-[11px] text-blue-600/80 dark:text-blue-400 font-medium">manajemen</span>
                </div>
            </div>

            <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Akun Aktif
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ userStats.activeCount }}
                    </span>
                    <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">bisa login</span>
                </div>
            </div>
        </div>

        <!-- Filter & Users Table Card -->
        <div class="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <!-- Toolbar -->
            <div class="flex flex-col gap-3.5 p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <!-- Search Bar -->
                    <div class="relative w-full sm:w-80">
                        <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                        <input
                            v-model="searchQuery"
                            type="search"
                            placeholder="Cari nama pengguna, email, role..."
                            class="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        />
                    </div>

                    <button
                        type="button"
                        :disabled="isLoading"
                        class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all cursor-pointer"
                        @click="fetchUsers"
                    >
                        <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                        <span>Sinkronkan</span>
                    </button>
                </div>

                <!-- Role Filter Tabs -->
                <div class="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
                        :class="
                            selectedRoleFilter === 'all'
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800'
                        "
                        @click="selectedRoleFilter = 'all'"
                    >
                        Semua Role ({{ users.length }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
                        :class="
                            selectedRoleFilter === 'kasir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                        "
                        @click="selectedRoleFilter = 'kasir'"
                    >
                        Kasir ({{ userStats.kasirCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
                        :class="
                            selectedRoleFilter === 'admin'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-blue-700 hover:bg-blue-50 dark:bg-neutral-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                        "
                        @click="selectedRoleFilter = 'admin'"
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer"
                        :class="
                            selectedRoleFilter === 'owner'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white text-purple-700 hover:bg-purple-50 dark:bg-neutral-950 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60'
                        "
                        @click="selectedRoleFilter = 'owner'"
                    >
                        Owner
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-6 space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            </div>

            <!-- Users Table -->
            <div v-else-if="filteredUsers.length > 0" class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                        <tr>
                            <th class="px-4 py-3">Pengguna</th>
                            <th class="px-4 py-3">Peran / Hak Akses</th>
                            <th class="px-4 py-3">PIN Kasir</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3">Terdaftar</th>
                            <th class="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                        <tr
                            v-for="user in filteredUsers"
                            :key="user.id"
                            class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                        >
                            <!-- User Info & Avatar -->
                            <td class="px-4 py-3.5">
                                <div class="flex items-center gap-3">
                                    <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold text-xs">
                                        {{ user.name.slice(0, 2).toUpperCase() }}
                                    </div>
                                    <div class="min-w-0">
                                        <div class="font-bold text-neutral-900 dark:text-neutral-100">
                                            {{ user.name }}
                                        </div>
                                        <div class="text-[11px] text-neutral-400 font-mono">
                                            {{ user.email }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Role Badge -->
                            <td class="px-4 py-3.5">
                                <div class="flex flex-wrap gap-1">
                                    <span
                                        v-for="role in user.roles"
                                        :key="role.id"
                                        class="rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
                                        :class="roleColors[role.name] || 'bg-neutral-100 text-neutral-700'"
                                    >
                                        {{ role.name }}
                                    </span>
                                </div>
                            </td>

                            <!-- PIN Status -->
                            <td class="px-4 py-3.5 font-mono text-xs">
                                <span v-if="user.pin" class="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Aktif (••••)
                                </span>
                                <span v-else class="text-neutral-400">
                                    -
                                </span>
                            </td>

                            <!-- Status Switch -->
                            <td class="px-4 py-3.5 text-center">
                                <button
                                    type="button"
                                    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer"
                                    :class="
                                        user.is_active
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100'
                                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100'
                                    "
                                    @click="toggleUserStatus(user)"
                                    title="Klik untuk mengubah status aktif"
                                >
                                    <CheckCircle2 v-if="user.is_active" class="size-3" />
                                    <XCircle v-else class="size-3" />
                                    <span>{{ user.is_active ? 'Aktif' : 'Nonaktif' }}</span>
                                </button>
                            </td>

                            <!-- Registered Time -->
                            <td class="px-4 py-3.5 text-[11px] text-neutral-400 font-mono">
                                {{ formatDateTime(user.created_at) }}
                            </td>

                            <!-- Actions -->
                            <td class="px-4 py-3.5 text-right">
                                <div class="inline-flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                                        title="Lihat Detail"
                                        @click="openDetailModal(user)"
                                    >
                                        <Eye class="size-3 text-neutral-400" />
                                        <span class="hidden sm:inline">Detail</span>
                                    </button>

                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
                                        title="Edit Akun"
                                        @click="openEditModal(user)"
                                    >
                                        <Pencil class="size-3 text-neutral-400" />
                                        <span class="hidden sm:inline">Edit</span>
                                    </button>

                                    <button
                                        v-if="user.is_active"
                                        type="button"
                                        class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors shadow-2xs cursor-pointer"
                                        title="Nonaktifkan Pengguna"
                                        @click="deactivateUser(user)"
                                    >
                                        <Ban class="size-3" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                <Users class="size-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                <h4 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    Tidak Ada Data Pengguna
                </h4>
                <p class="text-xs text-neutral-400 mt-0.5">
                    Tidak ada akun pengguna yang sesuai dengan kriteria pencarian atau filter role.
                </p>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <UserFormModal
        v-model:open="isFormModalOpen"
        :user="editingUser"
        :roles="roles"
        :is-processing="isActionLoading"
        @submit="saveUser"
    />

    <UserDetailModal
        v-model:open="isDetailModalOpen"
        :user="selectedUser"
        @edit="openEditModal"
    />
</template>
