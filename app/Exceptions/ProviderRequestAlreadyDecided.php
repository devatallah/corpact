<?php

namespace App\Exceptions;

use App\Models\EventProviderRequest;
use RuntimeException;

/**
 * A9 — أول رد يثبّت الحالة (H §11): تُرمى داخل معاملة القرار عند محاولة
 * الرد على طلب سبق البت فيه، وتُحوَّل خارج المعاملة إلى رسالة
 * «تم اتخاذ القرار مسبقاً» مع تسجيل المحاولة (التسجيل خارج المعاملة حتى
 * لا يبتلعه التراجع).
 */
class ProviderRequestAlreadyDecided extends RuntimeException
{
    public function __construct(public readonly EventProviderRequest $request) {}
}
