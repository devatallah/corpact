<?php

namespace Tests\Support;

/**
 * القناة الأولى في سلسلة الاختبار (تمثّل واتساب).
 */
class PrimaryFakeChannel extends FakeMessageChannel
{
    public function name(): string
    {
        return 'primary';
    }
}
