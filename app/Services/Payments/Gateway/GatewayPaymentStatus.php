<?php

namespace App\Services\Payments\Gateway;

enum GatewayPaymentStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';
    case Unknown = 'unknown';
}
