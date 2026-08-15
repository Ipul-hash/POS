<script setup lang="ts">
import type { Component } from 'vue';
import { TrendingUp, TrendingDown, Minus } from '@lucide/vue';

const props = defineProps<{
    title: string;
    value: string;
    subtitle?: string;
    icon: Component;
    trendPercentage?: number | null;
    trendLabel?: string;
    variant?: 'indigo' | 'emerald' | 'amber' | 'violet' | 'neutral';
}>();

const variantStyles = {
    indigo: {
        bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
        border: 'border-indigo-100 dark:border-indigo-900/40',
        iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
        textAccent: 'text-indigo-600 dark:text-indigo-400',
    },
    emerald: {
        bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
        border: 'border-emerald-100 dark:border-emerald-900/40',
        iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        textAccent: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
        bg: 'bg-amber-50/70 dark:bg-amber-950/30',
        border: 'border-amber-100 dark:border-amber-900/40',
        iconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
        textAccent: 'text-amber-700 dark:text-amber-400',
    },
    violet: {
        bg: 'bg-violet-50/70 dark:bg-violet-950/30',
        border: 'border-violet-100 dark:border-violet-900/40',
        iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
        textAccent: 'text-violet-600 dark:text-violet-400',
    },
    neutral: {
        bg: 'bg-neutral-50/70 dark:bg-neutral-900/50',
        border: 'border-neutral-200/80 dark:border-neutral-800',
        iconBg: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        textAccent: 'text-neutral-700 dark:text-neutral-300',
    },
};

const currentStyle = variantStyles[props.variant || 'neutral'];
</script>

<template>
    <div
        class="relative overflow-hidden rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-md"
        :class="[currentStyle.bg, currentStyle.border]"
    >
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {{ title }}
            </span>
            <div class="flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105" :class="currentStyle.iconBg">
                <component :is="icon" class="size-4.5" />
            </div>
        </div>

        <div class="mt-3 flex items-baseline gap-2">
            <h3 class="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                {{ value }}
            </h3>
        </div>

        <div class="mt-3 flex items-center justify-between text-xs">
            <div v-if="trendPercentage !== undefined && trendPercentage !== null" class="flex items-center gap-1 font-mono font-semibold">
                <span
                    class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px]"
                    :class="
                        trendPercentage > 0
                            ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : trendPercentage < 0
                            ? 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    "
                >
                    <TrendingUp v-if="trendPercentage > 0" class="size-3" />
                    <TrendingDown v-else-if="trendPercentage < 0" class="size-3" />
                    <Minus v-else class="size-3" />
                    {{ trendPercentage > 0 ? `+${trendPercentage}%` : `${trendPercentage}%` }}
                </span>
                <span class="text-[11px] text-neutral-400 font-normal">
                    {{ trendLabel || 'vs lalu' }}
                </span>
            </div>

            <div v-else-if="subtitle" class="text-[11px] text-neutral-500 dark:text-neutral-400">
                {{ subtitle }}
            </div>
        </div>
    </div>
</template>
