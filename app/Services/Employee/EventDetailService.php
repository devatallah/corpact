<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\Event;
use App\Models\PaymentIntent;
use App\Support\Money;

class EventDetailService
{
    /**
     * تفاصيل الفعالية مع تفصيل المال (A10 — H §12.2):
     *
     * - قبل الإغلاق: الحصة القصوى «بحد أقصى … وتقل كلما انضم زملاؤك» —
     *   سقف ملزم لا يُتجاوز أبداً.
     * - بعد الإغلاق: الحصة النهائية المقفلة + مطالبة الدفع الخاصة بالموظف
     *   (المبلغ، المهلة، رابط الاستئناف) إن وُجدت.
     *
     * @return array{event: Event, payment_breakdown: array<string, mixed>, my_intent: array<string, mixed>|null}
     */
    public function getDetail(Event $event, ?Employee $employee = null): array
    {
        $event->load([
            'community.company',
            'partner',
            'category',
            'creator',
            'participants',
            'waitlistEntries',
            'venues',
            'alternatives',
            'parentEvent',
        ]);

        $totalHalalas = (int) $event->total_amount_halalas;
        $subsidyHalalas = $event->effectiveSubsidyHalalas();
        $remaining = max(0, $totalHalalas - $subsidyHalalas);
        $shareLocked = $event->final_share_halalas !== null;

        $myIntent = null;
        if ($employee !== null) {
            $intent = PaymentIntent::query()
                ->where('event_id', $event->id)
                ->where('employee_id', $employee->id)
                ->first();

            if ($intent !== null) {
                $myIntent = [
                    'id' => $intent->id,
                    'amount' => $intent->amount,
                    'status' => $intent->status,
                    'expires_at' => $intent->expires_at?->toIso8601String(),
                    'paid_at' => $intent->paid_at?->toIso8601String(),
                    'payment_url' => $intent->isPayable() ? $intent->signedPaymentUrl() : null,
                ];
            }
        }

        return [
            'event' => $event,
            'payment_breakdown' => [
                'total_amount' => Money::format($totalHalalas),
                'vat_amount' => Money::format((int) $event->vat_amount_halalas),
                'community_balance' => (string) ($event->community?->balance ?? '0.00'),
                'subsidy' => Money::format($subsidyHalalas),
                'remaining' => Money::format($remaining),
                // H §12.2: السقف الملزم المعروض عند الانضمام
                'max_share' => Money::format((int) $event->max_share_halalas),
                'share_locked' => $shareLocked,
                'final_share' => $shareLocked ? Money::format((int) $event->final_share_halalas) : null,
                'collection_deadline_at' => $event->collection_deadline_at?->toIso8601String(),
                'participants_count' => $event->participants_count,
                'min_participants' => (int) $event->min_participants,
                'capacity' => $event->capacity,
            ],
            'my_intent' => $myIntent,
        ];
    }
}
