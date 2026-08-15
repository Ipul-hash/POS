export function formatRupiah(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return 'Rp 0';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue);
}

export function formatDateTime(dateStr?: string | null): string {
    if (!dateStr) {
        return '-';
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return dateStr;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function formatDate(dateStr?: string | null): string {
    if (!dateStr) {
        return '-';
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return dateStr;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

