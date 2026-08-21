<?php

use App\Contracts\FinancialAction;
use App\Exceptions\SelfApprovalException;
use App\Models\User;
use App\Support\Authorization\SelfApprovalGuard;
use Illuminate\Auth\Access\AuthorizationException;

// H §3 universal rule, enforced in code: «لا يعتمد أي شخص إجراءً مالياً
// أنشأه بنفسه». A6 (bank top-ups) and A11 (settlements/invoices) call this
// primitive at every approval site.

test('approving your own financial action throws', function () {
    $user = User::factory()->create();

    SelfApprovalGuard::assertNotSelfApproval($user, $user);
})->throws(SelfApprovalException::class);

test('approving by id also throws when actor equals creator', function () {
    SelfApprovalGuard::assertNotSelfApproval(7, 7);
})->throws(SelfApprovalException::class);

test('a different approver passes', function () {
    $creator = User::factory()->create();
    $approver = User::factory()->create();

    SelfApprovalGuard::assertNotSelfApproval($approver, $creator);
    SelfApprovalGuard::assertNotSelfApproval($approver->id, $creator->id);

    expect(true)->toBeTrue();
});

test('the guard understands FinancialAction objects', function () {
    $approver = User::factory()->create();

    $action = new class($approver->id) implements FinancialAction
    {
        public function __construct(private int $creatorId) {}

        public function createdByUserId(): ?int
        {
            return $this->creatorId;
        }
    };

    expect(fn () => SelfApprovalGuard::assertNotSelfApproval($approver, $action))
        ->toThrow(SelfApprovalException::class);

    $other = User::factory()->create();
    SelfApprovalGuard::assertNotSelfApproval($other, $action);
    expect(true)->toBeTrue();
});

test('unattributable actors or creators never trip the guard', function () {
    $user = User::factory()->create();

    SelfApprovalGuard::assertNotSelfApproval(null, $user);
    SelfApprovalGuard::assertNotSelfApproval($user, null);

    expect(true)->toBeTrue();
});

test('the exception renders as 403, not as a silent pass', function () {
    expect(new SelfApprovalException)->toBeInstanceOf(AuthorizationException::class);
});
