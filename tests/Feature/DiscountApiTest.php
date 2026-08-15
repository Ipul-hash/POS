<?php

use App\Models\Discount;

test('dapat mengambil daftar seluruh diskon', function () {
    Discount::create([
        'name'       => 'Diskon Member 10%',
        'type'       => 'percentage',
        'value'      => 10.00,
        'applies_to' => 'transaction',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-12-31',
        'is_active'  => true,
    ]);

    Discount::create([
        'name'       => 'Potongan Croissant Rp 3.000',
        'type'       => 'fixed',
        'value'      => 3000.00,
        'applies_to' => 'product',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-08-31',
        'is_active'  => false,
    ]);

    $response = $this->getJson('/api/discounts');

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Daftar diskon berhasil didapatkan',
        ])
        ->assertJsonCount(2, 'data');
});

test('dapat memfilter diskon berdasarkan status aktif', function () {
    Discount::create([
        'name'       => 'Promo Aktif',
        'type'       => 'percentage',
        'value'      => 15.00,
        'applies_to' => 'transaction',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-12-31',
        'is_active'  => true,
    ]);

    Discount::create([
        'name'       => 'Promo Nonaktif',
        'type'       => 'fixed',
        'value'      => 5000.00,
        'applies_to' => 'product',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-08-31',
        'is_active'  => false,
    ]);

    $response = $this->getJson('/api/discounts?is_active=1');

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Daftar diskon berhasil didapatkan',
        ])
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['name' => 'Promo Aktif']);
});

test('dapat membuat diskon baru dengan tipe persentase dan nominal tetap', function () {
    $payload = [
        'name'       => 'Diskon Grand Opening 20%',
        'type'       => 'percentage',
        'value'      => 20.00,
        'applies_to' => 'transaction',
        'start_date' => '2026-08-15',
        'end_date'   => '2026-08-31',
        'is_active'  => true,
    ];

    $response = $this->postJson('/api/discounts', $payload);

    $response->assertCreated()
        ->assertJson([
            'success' => true,
            'message' => 'Diskon berhasil ditambahkan',
        ])
        ->assertJsonPath('data.name', 'Diskon Grand Opening 20%')
        ->assertJsonPath('data.type', 'percentage');

    $this->assertDatabaseHas('discounts', [
        'name' => 'Diskon Grand Opening 20%',
        'type' => 'percentage',
    ]);
});

test('gagal membuat diskon bila end_date sebelum start_date', function () {
    $payload = [
        'name'       => 'Diskon Salah Tanggal',
        'type'       => 'percentage',
        'value'      => 10,
        'applies_to' => 'transaction',
        'start_date' => '2026-08-20',
        'end_date'   => '2026-08-10', // Invalid: end_date < start_date
        'is_active'  => true,
    ];

    $response = $this->postJson('/api/discounts', $payload);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => 'Validasi gagal',
        ]);
});

test('dapat mengambil detail data diskon', function () {
    $discount = Discount::create([
        'name'       => 'Voucher Kopi Rp 5.000',
        'type'       => 'fixed',
        'value'      => 5000.00,
        'applies_to' => 'product',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-08-31',
        'is_active'  => true,
    ]);

    $response = $this->getJson("/api/discounts/{$discount->id}");

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Detail diskon berhasil didapatkan',
        ])
        ->assertJsonPath('data.id', $discount->id)
        ->assertJsonPath('data.name', 'Voucher Kopi Rp 5.000');
});

test('dapat memperbarui data diskon', function () {
    $discount = Discount::create([
        'name'       => 'Diskon Lama 5%',
        'type'       => 'percentage',
        'value'      => 5.00,
        'applies_to' => 'transaction',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-08-31',
        'is_active'  => true,
    ]);

    $response = $this->putJson("/api/discounts/{$discount->id}", [
        'name'  => 'Diskon Baru 12%',
        'value' => 12.00,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Diskon berhasil diupdate',
        ])
        ->assertJsonPath('data.name', 'Diskon Baru 12%');

    $this->assertDatabaseHas('discounts', [
        'id'   => $discount->id,
        'name' => 'Diskon Baru 12%',
    ]);
});

test('dapat menonaktifkan diskon melalui delete endpoint', function () {
    $discount = Discount::create([
        'name'       => 'Diskon Mau Dihapus',
        'type'       => 'fixed',
        'value'      => 2000.00,
        'applies_to' => 'product',
        'start_date' => '2026-08-01',
        'end_date'   => '2026-08-31',
        'is_active'  => true,
    ]);

    $response = $this->deleteJson("/api/discounts/{$discount->id}");

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Diskon berhasil dinonaktifkan',
        ])
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('discounts', [
        'id'        => $discount->id,
        'is_active' => false,
    ]);
});
