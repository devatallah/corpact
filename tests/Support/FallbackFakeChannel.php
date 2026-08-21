<?php

namespace Tests\Support;

/**
 * القناة البديلة في سلسلة الاختبار (تمثّل الرسائل النصية).
 */
class FallbackFakeChannel extends FakeMessageChannel
{
    public function name(): string
    {
        return 'fallback';
    }
}
