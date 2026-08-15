export type DashboardPeriodFilter = 'today' | 'week' | 'month' | 'all';

export interface DashboardSummaryData {
    period: string;
    start_date: string;
    end_date: string;
    total_revenue: number;
    gross_profit: number;
    total_transactions: number;
    total_items_sold: number;
    average_order_value: number;
    total_discount: number;
    total_tax: number;
    revenue_growth_percentage: number;
    active_shifts_count: number;
    low_stock_products_count: number;
    total_active_products: number;
}

export interface SalesTimeSeriesItem {
    date: string;
    label: string;
    day_name: string;
    revenue: number;
    transactions_count: number;
}

export interface PaymentMethodDistribution {
    method: string;
    label: string;
    amount: number;
    count: number;
    percentage: number;
}

export interface SalesReportData {
    period: string;
    time_series: SalesTimeSeriesItem[];
    payment_distribution: PaymentMethodDistribution[];
    total_revenue: number;
    total_transactions: number;
}

export interface BestSellerItem {
    product_id: number;
    name: string;
    sku: string;
    category: string;
    sell_price: number;
    image_url?: string | null;
    current_stock: number;
    total_qty_sold: number;
    total_revenue: number;
}

export interface LowStockItem {
    id: number;
    product_id: number;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    min_stock: number;
    percentage: number;
    status: 'out_of_stock' | 'low_stock';
}

export interface InventoryReportData {
    total_products_count: number;
    total_stock_units: number;
    total_asset_value: number;
    total_potential_revenue: number;
    low_stock_count: number;
    low_stock_items: LowStockItem[];
}

export interface CashierPerformanceItem {
    cashier_id: number;
    name: string;
    email?: string;
    total_shifts: number;
    total_revenue: number;
    total_transactions: number;
    average_per_shift: number;
    cash_variance: number;
}
