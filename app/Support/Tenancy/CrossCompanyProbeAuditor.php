<?php

namespace App\Support\Tenancy;

use App\Models\Concerns\ScopedToCompany;
use App\Services\ActivityLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

/**
 * H §4 mandatory test: probing an entity id that belongs to another company
 * returns 404 — never 403 — AND leaves an audit trail. The global scope
 * produces the 404; this auditor detects that the id actually exists
 * outside the active context and records the probe.
 */
class CrossCompanyProbeAuditor
{
    public static function record(ModelNotFoundException $exception, Request $request): void
    {
        $context = app(CompanyContext::class);

        if (! $context->active()) {
            return;
        }

        $modelClass = $exception->getModel();

        if ($modelClass === null || ! in_array(ScopedToCompany::class, class_uses_recursive($modelClass), true)) {
            return;
        }

        foreach ($exception->getIds() as $id) {
            /** @var Model|null $foreign */
            $foreign = $modelClass::withoutGlobalScopes()->find($id);

            if ($foreign === null) {
                continue; // Genuinely missing — not a probe.
            }

            ActivityLogService::log(
                $context->id(),
                $foreign,
                'cross_company_probe',
                'محاولة وصول إلى كيان يخص شركة أخرى (أعيد 404).',
                [
                    'model' => class_basename($modelClass),
                    'id' => $id,
                    'path' => $request->path(),
                    'foreign_company_id' => $foreign->getAttribute('company_id'),
                ],
            );
        }
    }
}
