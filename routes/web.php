<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->hasRole('kasir') && ! auth()->user()->hasAnyRole(['owner', 'admin'])) {
            return redirect()->route('pos.index');
        }
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    // Shared POS & Shift routes for all roles (Kasir, Admin, Owner)
    Route::inertia('pos', 'Pos/Index')->name('pos.index');
    Route::inertia('pos/shifts', 'Pos/Shifts/Index')->name('pos.shifts.index');
    Route::inertia('pos/transactions', 'Pos/Transactions')->name('pos.transactions');

    // Admin & Owner exclusive routes
    Route::middleware(['role:owner|admin'])->group(function () {
        Route::inertia('dashboard', 'Dashboard')->name('dashboard');
        Route::inertia('master-data/categories', 'MasterData/Categories/Index')->name('master-data.categories.index');
        Route::inertia('master-data/products', 'MasterData/Products/Index')->name('master-data.products.index');
        Route::inertia('inventory', 'Inventory/Index')->name('inventory.index');
        Route::inertia('discounts', 'Discounts/Index')->name('discounts.index');
        Route::inertia('master-data/users', 'MasterData/Users/Index')->name('master-data.users.index');
    });

});

require __DIR__.'/settings.php';
