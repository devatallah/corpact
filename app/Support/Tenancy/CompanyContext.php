<?php

namespace App\Support\Tenancy;

/**
 * The active company context of the current request (H §4/عزل بيانات
 * الشركة). Set exclusively from the authenticated session by the
 * `company.context` middleware — never from request input; any
 * `company_id` coming from the client is ignored by design.
 */
class CompanyContext
{
    private ?int $companyId = null;

    public function set(?int $companyId): void
    {
        $this->companyId = $companyId;
    }

    public function clear(): void
    {
        $this->companyId = null;
    }

    public function id(): ?int
    {
        return $this->companyId;
    }

    public function active(): bool
    {
        return $this->companyId !== null;
    }

    /**
     * Run a callback with company scoping suspended (identity plumbing that
     * must see across companies, e.g. account linking).
     *
     * @template TReturn
     *
     * @param  callable(): TReturn  $callback
     * @return TReturn
     */
    public function bypass(callable $callback): mixed
    {
        $previous = $this->companyId;
        $this->companyId = null;

        try {
            return $callback();
        } finally {
            $this->companyId = $previous;
        }
    }
}
