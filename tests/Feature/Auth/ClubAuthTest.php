<?php

use App\Models\Club;

test('club login page renders', function () {
    $this->get(route('club.login'))->assertOk();
});

test('active club can login', function () {
    $club = Club::factory()->create([
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $this->post(route('club.login'), [
        'email' => $club->email,
        'password' => 'password',
    ])->assertRedirect(route('club.dash'));

    $this->assertAuthenticatedAs($club, 'club');
});

test('inactive club cannot login', function () {
    $club = Club::factory()->pending()->create([
        'password' => bcrypt('password'),
    ]);

    $this->post(route('club.login'), [
        'email' => $club->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('club');
});

test('club cannot login with wrong password', function () {
    $club = Club::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('club.login'), [
        'email' => $club->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('club');
});

test('club login validates required fields', function () {
    $this->post(route('club.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('club can logout', function () {
    $club = Club::factory()->create();

    $this->actingAs($club, 'club')
        ->post(route('club.logout'))
        ->assertRedirect(route('club.login'));

    $this->assertGuest('club');
});

test('club dashboard requires authentication', function () {
    $this->get(route('club.dash'))->assertRedirect();
});
