<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MasterData\KategoriController;
use App\Http\Controllers\Api\MasterData\ProdukController;
use App\Http\Controllers\Api\MasterData\InventorisController;
use App\Http\Controllers\Api\MasterData\DiscountController;
use App\Http\Controllers\Api\Kasir\TransaksiController;
use App\Http\Controllers\Api\Kasir\ShiftController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\MasterData\UserController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/kategori', [KategoriController::class, 'index']);
Route::post('/kategori', [KategoriController::class, 'store']);
Route::get('/kategori/{id}', [KategoriController::class, 'show']);
Route::put('/kategori/{id}', [KategoriController::class, 'update']);
Route::delete('/kategori/{id}', [KategoriController::class, 'destroy']);

Route::get('/produk', [ProdukController::class, 'index']);
Route::post('/produk', [ProdukController::class, 'store']);
Route::get('/produk/{id}', [ProdukController::class, 'show']);
Route::put('/produk/{id}', [ProdukController::class, 'update']);
Route::delete('/produk/{id}', [ProdukController::class, 'destroy']);
Route::get('/produk/{id}/stok', [ProdukController::class, 'cekStok']);

Route::post('/inventories/adjust', [InventorisController::class, 'adjust']);
Route::get('/inventories/low-stock', [InventorisController::class, 'lowStock']);
Route::get('/inventories/movements', [InventorisController::class, 'movements']);
Route::get('/inventories', [InventorisController::class, 'index']);
Route::put('/inventories/{id}', [InventorisController::class, 'update']);

Route::get('/discounts', [DiscountController::class, 'index']);
Route::post('/discounts', [DiscountController::class, 'store']);
Route::get('/discounts/{id}', [DiscountController::class, 'show']);
Route::put('/discounts/{id}', [DiscountController::class, 'update']);
Route::delete('/discounts/{id}', [DiscountController::class, 'destroy']);

Route::post('/transactions', [TransaksiController::class, 'store']);
Route::get('/transactions', [TransaksiController::class, 'index']);
Route::get('/transactions/{id}', [TransaksiController::class, 'show']);
Route::post('/transactions/{id}/void', [TransaksiController::class, 'voidTransaction']);
Route::post('/transactions/{id}/refund', [TransaksiController::class, 'refundTransaction']);
Route::post('/transactions/{id}/payments', [TransaksiController::class, 'addPayment']);
Route::get('/transactions/{id}/receipt', [TransaksiController::class, 'receipt']);

Route::get('/shifts', [ShiftController::class, 'index']);
Route::get('/shifts/current', [ShiftController::class, 'current']);
Route::post('/shifts/open', [ShiftController::class, 'open']);
Route::post('/shifts/{id}/close', [ShiftController::class, 'close']);
Route::get('/shifts/{id}', [ShiftController::class, 'show']);
Route::get('/shifts/{id}/report', [ShiftController::class, 'report']);


Route::get('/dashboard-summary', [DashboardController::class, 'dashboardSummary']);
Route::get('/sales', [DashboardController::class, 'salesReport']);
Route::get('/best-seller', [DashboardController::class, 'bestSeller']);
Route::get('/inventory', [DashboardController::class, 'inventoryReport']);
Route::get('/cashier-performance', [DashboardController::class, 'cashierPerformance']);
Route::get('/export', [DashboardController::class, 'exportReport']);

Route::get('/roles', [UserController::class, 'roles']);
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);