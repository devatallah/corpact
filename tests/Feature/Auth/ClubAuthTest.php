<?php

use App\Models\business;

test('business login page renders', function () {
    $this->get(route('business.login'))->assertOk();
});

test('active business can login', function () {
    $business = business::factory()->create([
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $this->post(route('business.login'), [
        'email' => $business->email,
        'password' => 'password',
    ])->assertRedirect(route('business.dash'));

    $this->assertAuthenticatedAs($business, 'business');
});

test('inactive business cannot login', function () {
    $business = business::factory()->pending()->create([
        'password' => bcrypt('password'),
    ]);

    $this->post(route('business.login'), [
        'email' => $business->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('business');
});

test('business cannot login with wrong password', function () {
    $business = business::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('business.login'), [
        'email' => $business->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('business');
});

test('business login validates required fields', function () {
    $this->post(route('business.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('business can logout', function () {
    $business = business::factory()->create();

    $this->actingAs($business, 'business')
        ->post(route('business.logout'))
        ->assertRedirect(route('business.login'));

    $this->assertGuest('business');
});

test('business dashboard requires authentication', function () {
    $this->get(route('business.dash'))->assertRedirect();
});
