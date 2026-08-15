<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Shift;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function dashboardSummary(Request $request)
    {
        $period = $request->query('period', 'today');
        [$startDate, $endDate] = $this->resolveDateRange($period, $request->query('start_date'), $request->query('end_date'));

        $currentQuery = Transaction::where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = (float) $currentQuery->sum('grand_total');
        $totalTransactions = $currentQuery->count();
        $totalDiscount = (float) $currentQuery->sum('discount_total');
        $totalTax = (float) $currentQuery->sum('tax_total');

        // Items sold and gross profit in period
        $paidTxIds = (clone $currentQuery)->pluck('id');
        $items = TransactionItem::with('product')
            ->whereIn('transaction_id', $paidTxIds)
            ->get();

        $totalItemsSold = $items->sum('quantity');
        $totalHpp = 0;
        foreach ($items as $item) {
            $cost = $item->product ? (float) $item->product->cost_price : 0;
            $totalHpp += $cost * $item->quantity;
        }
        $grossProfit = max(0, $totalRevenue - $totalHpp);

        // Previous period comparison for growth percentage
        $prevRange = $this->resolvePreviousDateRange($period, $startDate, $endDate);
        $prevRevenue = (float) Transaction::where('status', 'paid')
            ->whereBetween('created_at', [$prevRange[0], $prevRange[1]])
            ->sum('grand_total');

        $revenueGrowth = $prevRevenue > 0
            ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1)
            : ($totalRevenue > 0 ? 100 : 0);

        // Active Shifts & Low Stock Count
        $activeShiftsCount = Shift::whereNull('closed_at')->count();
        $lowStockCount = Inventory::whereColumn('quantity', '<=', 'min_stock')->count();
        $totalActiveProducts = Product::where('is_active', true)->count();

        $averageOrderValue = $totalTransactions > 0 ? round($totalRevenue / $totalTransactions) : 0;

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan dashboard berhasil didapatkan',
            'data' => [
                'period' => $period,
                'start_date' => $startDate->toDateTimeString(),
                'end_date' => $endDate->toDateTimeString(),
                'total_revenue' => $totalRevenue,
                'gross_profit' => $grossProfit,
                'total_transactions' => $totalTransactions,
                'total_items_sold' => $totalItemsSold,
                'average_order_value' => $averageOrderValue,
                'total_discount' => $totalDiscount,
                'total_tax' => $totalTax,
                'revenue_growth_percentage' => $revenueGrowth,
                'active_shifts_count' => $activeShiftsCount,
                'low_stock_products_count' => $lowStockCount,
                'total_active_products' => $totalActiveProducts,
            ],
        ], 200);
    }

    public function salesReport(Request $request)
    {
        $period = $request->query('period', 'week');
        [$startDate, $endDate] = $this->resolveDateRange($period, $request->query('start_date'), $request->query('end_date'));

        $transactions = Transaction::with('payments')
            ->where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get();

        // Group time-series daily
        $timeSeries = [];
        $current = clone $startDate;
        while ($current <= $endDate) {
            $dateStr = $current->toDateString();
            $dayLabel = $current->translatedFormat('d M');
            $timeSeries[$dateStr] = [
                'date' => $dateStr,
                'label' => $dayLabel,
                'day_name' => $current->translatedFormat('D'),
                'revenue' => 0.0,
                'transactions_count' => 0,
            ];
            $current->addDay();
        }

        $paymentDistribution = [
            'cash' => ['method' => 'cash', 'label' => 'Tunai (Cash)', 'amount' => 0.0, 'count' => 0, 'percentage' => 0],
            'qris' => ['method' => 'qris', 'label' => 'QRIS', 'amount' => 0.0, 'count' => 0, 'percentage' => 0],
            'debit' => ['method' => 'debit', 'label' => 'Kartu Debit', 'amount' => 0.0, 'count' => 0, 'percentage' => 0],
            'credit' => ['method' => 'credit', 'label' => 'Kartu Kredit', 'amount' => 0.0, 'count' => 0, 'percentage' => 0],
            'ewallet' => ['method' => 'ewallet', 'label' => 'E-Wallet', 'amount' => 0.0, 'count' => 0, 'percentage' => 0],
        ];

        $totalAllPayments = 0;

        foreach ($transactions as $tx) {
            $txDate = Carbon::parse($tx->created_at)->toDateString();
            if (isset($timeSeries[$txDate])) {
                $timeSeries[$txDate]['revenue'] += (float) $tx->grand_total;
                $timeSeries[$txDate]['transactions_count'] += 1;
            }

            foreach ($tx->payments as $payment) {
                $m = $payment->method;
                $amt = (float) $payment->amount;
                if (isset($paymentDistribution[$m])) {
                    $paymentDistribution[$m]['amount'] += $amt;
                    $paymentDistribution[$m]['count'] += 1;
                    $totalAllPayments += $amt;
                }
            }
        }

        // Calculate percentages
        foreach ($paymentDistribution as $key => $val) {
            $paymentDistribution[$key]['percentage'] = $totalAllPayments > 0
                ? round(($val['amount'] / $totalAllPayments) * 100, 1)
                : 0;
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan penjualan berhasil didapatkan',
            'data' => [
                'period' => $period,
                'time_series' => array_values($timeSeries),
                'payment_distribution' => array_values($paymentDistribution),
                'total_revenue' => (float) $transactions->sum('grand_total'),
                'total_transactions' => $transactions->count(),
            ],
        ], 200);
    }

    public function bestSeller(Request $request)
    {
        $limit = (int) $request->query('limit', 5);
        $period = $request->query('period', 'month');
        [$startDate, $endDate] = $this->resolveDateRange($period, $request->query('start_date'), $request->query('end_date'));

        $paidTxIds = Transaction::where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->pluck('id');

        $bestSellers = TransactionItem::select(
                'product_id',
                DB::raw('SUM(quantity) as total_qty_sold'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->whereIn('transaction_id', $paidTxIds)
            ->groupBy('product_id')
            ->orderBy('total_qty_sold', 'desc')
            ->limit($limit)
            ->with(['product.category', 'product.inventory'])
            ->get()
            ->map(function ($item) {
                $prod = $item->product;
                return [
                    'product_id' => $item->product_id,
                    'name' => $prod ? $prod->name : 'Produk Tidak Dikenal',
                    'sku' => $prod ? $prod->sku : '-',
                    'category' => $prod && $prod->category ? $prod->category->name : 'Menu',
                    'sell_price' => $prod ? (float) $prod->sell_price : 0,
                    'image_url' => $prod ? $prod->image_url : null,
                    'current_stock' => $prod && $prod->inventory ? $prod->inventory->quantity : 0,
                    'total_qty_sold' => (int) $item->total_qty_sold,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk terlaris berhasil didapatkan',
            'data' => $bestSellers,
        ], 200);
    }

    public function inventoryReport(Request $request)
    {
        $inventories = Inventory::with('product.category')->get();

        $totalStockUnits = $inventories->sum('quantity');
        $totalAssetValue = 0;
        $totalPotentialRevenue = 0;

        $lowStockList = [];

        foreach ($inventories as $inv) {
            $prod = $inv->product;
            if (!$prod) continue;

            $cost = (float) $prod->cost_price;
            $price = (float) $prod->sell_price;
            $qty = (int) $inv->quantity;
            $minStock = (int) $inv->min_stock;

            $totalAssetValue += $cost * $qty;
            $totalPotentialRevenue += $price * $qty;

            if ($qty <= $minStock) {
                $percentage = $minStock > 0 ? min(100, round(($qty / $minStock) * 100)) : 0;
                $lowStockList[] = [
                    'id' => $inv->id,
                    'product_id' => $prod->id,
                    'name' => $prod->name,
                    'sku' => $prod->sku,
                    'category' => $prod->category ? $prod->category->name : 'Kategori',
                    'quantity' => $qty,
                    'min_stock' => $minStock,
                    'percentage' => $percentage,
                    'status' => $qty <= 0 ? 'out_of_stock' : 'low_stock',
                ];
            }
        }

        // Sort low stock by quantity ascending (out of stock first)
        usort($lowStockList, fn($a, $b) => $a['quantity'] <=> $b['quantity']);

        return response()->json([
            'success' => true,
            'message' => 'Laporan inventori stok berhasil didapatkan',
            'data' => [
                'total_products_count' => Product::where('is_active', true)->count(),
                'total_stock_units' => $totalStockUnits,
                'total_asset_value' => $totalAssetValue,
                'total_potential_revenue' => $totalPotentialRevenue,
                'low_stock_count' => count($lowStockList),
                'low_stock_items' => array_slice($lowStockList, 0, 8),
            ],
        ], 200);
    }

    public function cashierPerformance(Request $request)
    {
        $period = $request->query('period', 'month');
        [$startDate, $endDate] = $this->resolveDateRange($period, $request->query('start_date'), $request->query('end_date'));

        $cashiers = User::with(['shifts' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('opened_at', [$startDate, $endDate]);
        }, 'shifts.transactions' => function ($q) {
            $q->where('status', 'paid');
        }])->get();

        $performanceList = [];

        foreach ($cashiers as $cashier) {
            $shifts = $cashier->shifts;
            if ($shifts->count() === 0) continue;

            $totalShifts = $shifts->count();
            $totalSales = 0;
            $totalTransactions = 0;
            $totalVariance = 0;

            foreach ($shifts as $shift) {
                $paidTx = $shift->transactions;
                $totalSales += (float) $paidTx->sum('grand_total');
                $totalTransactions += $paidTx->count();

                if ($shift->closing_balance !== null) {
                    $totalCash = 0;
                    foreach ($paidTx as $tx) {
                        $totalCash += (float) $tx->payments->where('method', 'cash')->sum('amount');
                    }
                    $expected = (float) $shift->opening_balance + $totalCash;
                    $totalVariance += ((float) $shift->closing_balance - $expected);
                }
            }

            $performanceList[] = [
                'cashier_id' => $cashier->id,
                'name' => $cashier->name,
                'email' => $cashier->email,
                'total_shifts' => $totalShifts,
                'total_revenue' => $totalSales,
                'total_transactions' => $totalTransactions,
                'average_per_shift' => $totalShifts > 0 ? round($totalSales / $totalShifts) : 0,
                'cash_variance' => $totalVariance,
            ];
        }

        // Sort by revenue desc
        usort($performanceList, fn($a, $b) => $b['total_revenue'] <=> $a['total_revenue']);

        return response()->json([
            'success' => true,
            'message' => 'Laporan kinerja kasir berhasil didapatkan',
            'data' => $performanceList,
        ], 200);
    }

    public function exportReport(Request $request)
    {
        $period = $request->query('period', 'month');
        [$startDate, $endDate] = $this->resolveDateRange($period, $request->query('start_date'), $request->query('end_date'));

        $transactions = Transaction::with(['cashier', 'customer', 'payments', 'items.product'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data ekspor laporan berhasil di-generate',
            'data' => [
                'generated_at' => now()->toDateTimeString(),
                'period' => $period,
                'start_date' => $startDate->toDateTimeString(),
                'end_date' => $endDate->toDateTimeString(),
                'total_records' => $transactions->count(),
                'transactions' => $transactions,
            ],
        ], 200);
    }

    private function resolveDateRange(string $period, ?string $start = null, ?string $end = null): array
    {
        $now = Carbon::now();

        if ($start && $end) {
            return [
                Carbon::parse($start)->startOfDay(),
                Carbon::parse($end)->endOfDay(),
            ];
        }

        switch ($period) {
            case 'today':
                return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
            case 'week':
                return [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()];
            case 'month':
                return [$now->copy()->startOfMonth()->startOfDay(), $now->copy()->endOfDay()];
            case 'all':
            default:
                return [$now->copy()->subYears(2)->startOfDay(), $now->copy()->endOfDay()];
        }
    }

    private function resolvePreviousDateRange(string $period, Carbon $startDate, Carbon $endDate): array
    {
        $diffDays = $startDate->diffInDays($endDate) + 1;
        return [
            $startDate->copy()->subDays($diffDays)->startOfDay(),
            $startDate->copy()->subSecond(),
        ];
    }
}
