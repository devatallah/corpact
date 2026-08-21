<?php

namespace App\Enums;

/**
 * H §19 «الملفات» — the upload matrix, verbatim:
 *
 * | شعار مجتمع أو مزوّد | jpg · png · webp — حتى 2MB | صاحب النطاق / الجميع داخل النطاق |
 * | إشعار تحويل بنكي   | jpg · png · pdf  — حتى 5MB | مسؤول الحساب / الأدمن المالي فقط |
 * | عقد                | pdf              — حتى 10MB| أدمن تيمات / أدمن تيمات ومسؤول الحساب |
 *
 * Sizes are the spec's megabytes; validation compares the **sniffed** MIME
 * type, never the filename extension.
 */
enum FileCategory: string
{
    case Logo = 'logo';
    case BankReceipt = 'bank_receipt';
    case Contract = 'contract';
    case Avatar = 'avatar';

    public function label(): string
    {
        return match ($this) {
            self::Logo => 'شعار',
            self::BankReceipt => 'إشعار تحويل بنكي',
            self::Contract => 'عقد',
            self::Avatar => 'صورة شخصية',
        };
    }

    /**
     * Accepted **sniffed** MIME types.
     *
     * @return string[]
     */
    public function mimeTypes(): array
    {
        return match ($this) {
            self::Logo => ['image/jpeg', 'image/png', 'image/webp'],
            self::BankReceipt => ['image/jpeg', 'image/png', 'application/pdf'],
            self::Contract => ['application/pdf'],
            self::Avatar => ['image/jpeg', 'image/png', 'image/webp'],
        };
    }

    /** Maximum size in bytes. */
    public function maxBytes(): int
    {
        return match ($this) {
            self::Logo, self::Avatar => 2 * 1024 * 1024,
            self::BankReceipt => 5 * 1024 * 1024,
            self::Contract => 10 * 1024 * 1024,
        };
    }

    public function maxMegabytes(): int
    {
        return (int) ($this->maxBytes() / 1024 / 1024);
    }

    /** Storage directory on the private disk. */
    public function directory(): string
    {
        return match ($this) {
            self::Logo => 'logos',
            self::BankReceipt => 'topup-receipts',
            self::Contract => 'contracts',
            self::Avatar => 'avatars',
        };
    }

    /**
     * H §19: «لا حذف نهائي للعقود والملفات المالية». Categories that answer
     * true are never hard-deleted and never purged by the retention job.
     */
    public function isPermanent(): bool
    {
        return match ($this) {
            self::Contract, self::BankReceipt => true,
            self::Logo, self::Avatar => false,
        };
    }

    /**
     * Human-readable accepted formats, for validation messages and the UI.
     */
    public function formatsLabel(): string
    {
        return match ($this) {
            self::Logo, self::Avatar => 'jpg · png · webp',
            self::BankReceipt => 'jpg · png · pdf',
            self::Contract => 'pdf',
        };
    }
}
