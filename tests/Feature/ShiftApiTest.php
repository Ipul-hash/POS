<?php

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;

test('dapat membuka shift kasir baru dengan modal awal', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson('/api/shifts/open', [
        'opening_balance' => 150000,
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'message' => 'Shift kasir berhasil dibuka',
        ])
        ->assertJsonPath('data.opening_balance', '150000.00');

    expect(Shift::where('cashier_id', $user->id)->whereNull('closed_at')->count())->toBe(1);
});

test('tidak dapat membuka shift baru jika masih ada shift aktif yang belum ditutup', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    Shift::create([
        'cashier_id' => $user->id,
        'opening_balance' => 100000,
        'opened_at' => now(),
    ]);

    $response = $this->postJson('/api/shifts/open', [
        'opening_balance' => 200000,
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'Masih ada shift yang belum ditutup',
        ]);
});

test('dapat mengambil status shift aktif kasir saat ini', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $shift = Shift::create([
        'cashier_id' => $user->id,
        'opening_balance' => 100000,
        'opened_at' => now(),
    ]);

    $response = $this->getJson('/api/shifts/current');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Shift aktif berhasil didapatkan',
        ])
        ->assertJsonPath('data.shift.id', $shift->id);
});

test('dapat menutup shift dan menghitung rekonsiliasi kas', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $shift = Shift::create([
        'cashier_id' => $user->id,
        'opening_balance' => 100000,
        'opened_at' => now(),
    ]);

    // Transaksi penjualan kas tunai Rp 50.000
    $tx = Transaction::create([
        'invoice_number' => 'INV-SHIFT-001',
        'cashier_id' => $user->id,
        'shift_id' => $shift->id,
        'subtotal' => 50000,
        'discount_total' => 0,
        'tax_total' => 0,
        'grand_total' => 50000,
        'status' => 'paid',
    ]);

    Payment::create([
        'transaction_id' => $tx->id,
        'method' => 'cash',
        'amount' => 50000,
    ]);

    // Kasir menutup dengan kas aktual Rp 150.000 (Pas)
    $response = $this->postJson("/api/shifts/{$shift->id}/close", [
        'closing_balance' => 150000,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Shift berhasil ditutup dan laporan penjualan telah digenerate',
        ])
        ->assertJsonPath('data.summary.expected_cash', 150000)
        ->assertJsonPath('data.summary.cash_variance', 0);

    $shift->refresh();
    expect($shift->closed_at)->not->toBeNull();
});

test('dapat mengambil data laporan penutupan shift Z-Report', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $shift = Shift::create([
        'cashier_id' => $user->id,
        'opening_balance' => 100000,
        'closing_balance' => 100000,
        'opened_at' => now()->subHours(8),
        'closed_at' => now(),
    ]);

    $response = $this->getJson("/api/shifts/{$shift->id}/report");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Laporan penutupan shift (Z-Report) berhasil didapatkan',
        ])
        ->assertJsonStructure([
            'data' => [
                'shift',
                'summary' => [
                    'total_sales',
                    'payments_by_method',
                    'opening_balance',
                    'expected_cash',
                    'closing_balance',
                    'cash_variance',
                ],
                'store',
            ],
        ]);
});
