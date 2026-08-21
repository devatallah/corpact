<?php

namespace App\Services\Events;

use RuntimeException;

/**
 * أي انتقال غير مذكور في جدول H §9 ممنوع — يُرمى هذا الاستثناء ولا يُنفَّذ شيء.
 */
class IllegalEventTransition extends RuntimeException
{
    public function __construct(
        public readonly string $from,
        public readonly string $to,
    ) {
        parent::__construct("انتقال غير مشروع في آلة حالات الفعالية: {$from} ← {$to}.");
    }
}
