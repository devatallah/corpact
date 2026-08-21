<?php

namespace App\Support\Files;

/**
 * H §19: «فحص **نوع MIME الفعلي لا الامتداد**، ورفض أي ملف تنفيذي».
 *
 * `UploadedFile::getMimeType()` already asks finfo rather than the browser,
 * but it is permissive (an unknown blob becomes `application/octet-stream`)
 * and it says nothing about executables. This reads the magic bytes itself:
 * a file is accepted only when its header matches a format we actually
 * allow, and refused outright when its header matches an executable
 * container — whatever the extension or the declared Content-Type says.
 */
class MimeSniffer
{
    /**
     * Signatures of executable / script containers. A match is a hard reject.
     *
     * @var array<string, string> label => magic prefix (binary)
     */
    private const EXECUTABLE_SIGNATURES = [
        'ELF' => "\x7FELF",                 // Linux/BSD binary
        'PE/DOS' => 'MZ',                   // Windows .exe/.dll
        'Mach-O 32' => "\xFE\xED\xFA\xCE",
        'Mach-O 64' => "\xFE\xED\xFA\xCF",
        'Mach-O 32 LE' => "\xCE\xFA\xED\xFE",
        'Mach-O 64 LE' => "\xCF\xFA\xED\xFE",
        'Mach-O universal' => "\xCA\xFE\xBA\xBE",
        'Java class' => "\xCA\xFE\xBA\xBE",
        'Shebang' => '#!',                  // shell/perl/python script
        'PHP' => '<?php',
        'PHP short' => '<?=',
        'WASM' => "\x00asm",
    ];

    /**
     * Magic-byte signatures of the formats the upload matrix allows.
     *
     * @var array<string, list<array{0: int, 1: string}>> mime => [[offset, prefix], …]
     */
    private const ALLOWED_SIGNATURES = [
        'image/jpeg' => [[0, "\xFF\xD8\xFF"]],
        'image/png' => [[0, "\x89PNG\r\n\x1A\n"]],
        'image/webp' => [[0, 'RIFF'], [8, 'WEBP']],
        'application/pdf' => [[0, '%PDF-']],
    ];

    /**
     * The real type of the file at `$path`, or null when it matches none of
     * the formats the platform accepts.
     */
    public static function detect(string $path): ?string
    {
        $header = self::header($path);

        if ($header === '') {
            return null;
        }

        foreach (self::ALLOWED_SIGNATURES as $mime => $parts) {
            $matches = true;

            foreach ($parts as [$offset, $prefix]) {
                if (substr($header, $offset, strlen($prefix)) !== $prefix) {
                    $matches = false;
                    break;
                }
            }

            if ($matches) {
                return $mime;
            }
        }

        return null;
    }

    /**
     * The executable container detected in the file, or null.
     */
    public static function executableKind(string $path): ?string
    {
        $header = self::header($path);

        if ($header === '') {
            return null;
        }

        foreach (self::EXECUTABLE_SIGNATURES as $label => $signature) {
            if (str_starts_with($header, $signature)) {
                return $label;
            }
        }

        // A PHP tag anywhere in the first block is enough — polyglot files
        // (a valid GIF that is also a PHP script) are the classic bypass.
        if (str_contains($header, '<?php') || str_contains($header, '<?=')) {
            return 'PHP (polyglot)';
        }

        return null;
    }

    public static function isExecutable(string $path): bool
    {
        return self::executableKind($path) !== null;
    }

    private static function header(string $path): string
    {
        if (! is_file($path) || ! is_readable($path)) {
            return '';
        }

        $handle = fopen($path, 'rb');

        if ($handle === false) {
            return '';
        }

        $header = (string) fread($handle, 4096);
        fclose($handle);

        return $header;
    }
}
