<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/composables/useCurrentUrl';
import type { NavGroup, NavItem } from '@/types';

const props = defineProps<{
    items?: NavItem[];
    groups?: NavGroup[];
}>();

const { isCurrentUrl } = useCurrentUrl();

const resolvedGroups = computed<NavGroup[]>(() => {
    if (props.groups && props.groups.length > 0) {
        return props.groups;
    }
    if (props.items && props.items.length > 0) {
        return [
            {
                title: 'Menu Navigasi',
                items: props.items,
            },
        ];
    }
    return [];
});
</script>

<template>
    <div class="flex flex-col gap-1">
        <SidebarGroup
            v-for="group in resolvedGroups"
            :key="group.title"
            class="px-2 py-1.5"
        >
            <SidebarGroupLabel class="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 mb-1">
                {{ group.title }}
            </SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem v-for="item in group.items" :key="item.title">
                    <SidebarMenuButton
                        as-child
                        :is-active="isCurrentUrl(item.href)"
                        :tooltip="item.title"
                    >
                        <Link :href="item.href">
                            <component :is="item.icon" />
                            <span>{{ item.title }}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    </div>
</template>
