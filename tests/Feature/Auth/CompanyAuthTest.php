<?php

use App\Models\Company;

test('company login page renders', function () {
    $this->get(route('company.login'))->assertOk();
});

test('active company can login', function () {
    $company = Company::factory()->create([
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $this->post(route('company.login'), [
        'email' => $company->email,
        'password' => 'password',
    ])->assertRedirect(route('company.dash'));

    $this->assertAuthenticatedAs($company, 'company');
});

test('inactive company cannot login', function () {
    $company = Company::factory()->pending()->create([
        'password' => bcrypt('password'),
    ]);

    $this->post(route('company.login'), [
        'email' => $company->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('company');
});

test('company cannot login with wrong password', function () {
    $company = Company::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('company.login'), [
        'email' => $company->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('company');
});

test('company login validates required fields', function () {
    $this->post(route('company.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('company can logout', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->post(route('company.logout'))
        ->assertRedirect(route('company.login'));

    $this->assertGuest('company');
});

test('company dashboard requires authentication', function () {
    $this->get(route('company.dash'))->assertRedirect();
});
