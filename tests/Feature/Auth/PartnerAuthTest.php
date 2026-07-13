<?php

use App\Models\partner;

test('partner login page redirects to landing login modal', function () {
    $this->get(route('partner.login'))->assertRedirect('/partners?login=1');
});

test('active partner can login', function () {
    $partner = partner::factory()->create([
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $this->post(route('partner.login'), [
        'email' => $partner->email,
        'password' => 'password',
    ])->assertRedirect(route('partner.dash'));

    $this->assertAuthenticatedAs($partner, 'partner');
});

test('inactive partner cannot login', function () {
    $partner = partner::factory()->pending()->create([
        'password' => bcrypt('password'),
    ]);

    $this->post(route('partner.login'), [
        'email' => $partner->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('partner');
});

test('partner cannot login with wrong password', function () {
    $partner = partner::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('partner.login'), [
        'email' => $partner->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('partner');
});

test('partner login validates required fields', function () {
    $this->post(route('partner.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('partner can logout', function () {
    $partner = partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->post(route('partner.logout'))
        ->assertRedirect(route('partner.login'));

    $this->assertGuest('partner');
});

test('partner dashboard requires authentication', function () {
    $this->get(route('partner.dash'))->assertRedirect();
});
