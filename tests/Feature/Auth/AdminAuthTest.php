<?php

use App\Models\User;

test('admin login page renders', function () {
    $this->get(route('admin.login'))->assertOk();
});

test('admin can login with valid credentials', function () {
    $admin = User::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.dash'));

    $this->assertAuthenticatedAs($admin, 'admin');
});

test('admin cannot login with wrong password', function () {
    $admin = User::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), [
        'email' => $admin->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('admin');
});

test('admin cannot login with non-existent email', function () {
    $this->post(route('admin.login'), [
        'email' => 'nonexistent@example.com',
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('admin');
});

test('admin login validates required fields', function () {
    $this->post(route('admin.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('admin login validates email format', function () {
    $this->post(route('admin.login'), [
        'email' => 'not-an-email',
        'password' => 'password',
    ])->assertSessionHasErrors('email');
});

test('admin can logout', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.logout'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest('admin');
});

test('admin dashboard requires authentication', function () {
    $this->get(route('admin.dash'))->assertRedirect();
});
