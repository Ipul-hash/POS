<script setup lang="ts">
import { computed } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import {
    BookOpen,
    Boxes,
    Coins,
    FolderGit2,
    FolderTree,
    LayoutGrid,
    Package,
    Percent,
    Receipt,
    ShoppingCart,
    Users,
} from '@lucide/vue';
import AppLogo from '@/components/AppLogo.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavGroup, NavItem } from '@/types';

const page = usePage();

const isCashierOnly = computed(() => {
    const user = page.props.auth?.user;
    if (!user) return false;
    if (user.is_admin) return false;
    if (user.roles?.includes('owner') || user.roles?.includes('admin')) return false;
    return user.is_cashier || user.roles?.includes('kasir');
});

const homeUrl = computed(() => {
    return isCashierOnly.value ? '/pos' : dashboard();
});

const navGroups = computed<NavGroup[]>(() => {
    if (isCashierOnly.value) {
        return [
            {
                title: 'Operasional Kasir',
                items: [
                    {
                        title: 'Kasir POS',
                        href: '/pos',
                        icon: ShoppingCart,
                    },
                    {
                        title: 'Shift Kasir',
                        href: '/pos/shifts',
                        icon: Coins,
                    },
                    {
                        title: 'Riwayat Transaksi',
                        href: '/pos/transactions',
                        icon: Receipt,
                    },
                ],
            },
        ];
    }

    return [
        {
            title: 'Utama',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
        {
            title: 'Operasional Kasir',
            items: [
                {
                    title: 'Kasir POS',
                    href: '/pos',
                    icon: ShoppingCart,
                },
                {
                    title: 'Shift Kasir',
                    href: '/pos/shifts',
                    icon: Coins,
                },
                {
                    title: 'Riwayat Transaksi',
                    href: '/pos/transactions',
                    icon: Receipt,
                },
            ],
        },
        {
            title: 'Master Data & Inventori',
            items: [
                {
                    title: 'Kategori Produk',
                    href: '/master-data/categories',
                    icon: FolderTree,
                },
                {
                    title: 'Master Produk',
                    href: '/master-data/products',
                    icon: Package,
                },
                {
                    title: 'Inventori & Stok',
                    href: '/inventory',
                    icon: Boxes,
                },
                {
                    title: 'Diskon & Promo',
                    href: '/discounts',
                    icon: Percent,
                },
                {
                    title: 'Kelola Pengguna',
                    href: '/master-data/users',
                    icon: Users,
                },
            ],
        },
    ];
});


const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/vue-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#vue',
        icon: BookOpen,
    },
];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="homeUrl">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent class="space-y-1">
            <NavMain :groups="navGroups" />
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
