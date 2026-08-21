<?php

namespace App\Services\Company;

use Illuminate\Validation\ValidationException;
use ZipArchive;

/**
 * Parses the uploaded employee file — CSV or Excel (.xlsx) — into uniform
 * associative rows (H §5: الاسم، بريد العمل، رقم الجوال، الإدارة، الرقم
 * الوظيفي الاختياري). Implemented natively (fgetcsv / ZipArchive+SimpleXML)
 * so onboarding carries no spreadsheet dependency.
 *
 * Header row is matched by Arabic/English aliases; a first row that is
 * clearly data (contains an email) falls back to the spec's column order.
 */
class EmployeeImportFileReader
{
    /** Hard cap so a hostile file cannot exhaust memory. */
    public const MAX_ROWS = 5000;

    private const HEADER_ALIASES = [
        'name' => ['name', 'full name', 'employee name', 'الاسم', 'اسم الموظف', 'الاسم الكامل'],
        'email' => ['email', 'work email', 'e-mail', 'البريد', 'البريد الإلكتروني', 'البريد الالكتروني', 'بريد العمل', 'الايميل', 'الإيميل'],
        'phone' => ['phone', 'mobile', 'phone number', 'mobile number', 'الجوال', 'رقم الجوال', 'الهاتف', 'رقم الهاتف'],
        'department' => ['department', 'الإدارة', 'الادارة', 'القسم'],
        'employee_number' => ['employee number', 'employee no', 'employee_no', 'employee id', 'الرقم الوظيفي', 'رقم الموظف'],
    ];

    private const POSITIONAL_ORDER = ['name', 'email', 'phone', 'department', 'employee_number'];

    /**
     * @return list<array{row_number: int, name: ?string, email: ?string, phone: ?string, department: ?string, employee_number: ?string}>
     *
     * @throws ValidationException when the file cannot be parsed
     */
    public function read(string $path, string $originalName): array
    {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        $grid = match ($extension) {
            'csv', 'txt' => $this->readCsv($path),
            'xlsx' => $this->readXlsx($path),
            default => throw ValidationException::withMessages([
                'file' => ['صيغة الملف غير مدعومة — المقبول CSV أو Excel (xlsx).'],
            ]),
        };

        // Keep only rows with content, remembering their 1-based position in
        // the original file so the error report points at the real line.
        $nonEmpty = [];

        foreach ($grid as $index => $cells) {
            foreach ($cells as $cell) {
                if (trim((string) $cell) !== '') {
                    $nonEmpty[] = ['file_row' => $index + 1, 'cells' => $cells];

                    break;
                }
            }
        }

        if ($nonEmpty === []) {
            throw ValidationException::withMessages(['file' => ['الملف فارغ.']]);
        }

        if (count($nonEmpty) > self::MAX_ROWS + 1) {
            throw ValidationException::withMessages([
                'file' => ['الملف يتجاوز الحد الأقصى ('.number_format(self::MAX_ROWS).' سطر). قسّمه على أكثر من ملف.'],
            ]);
        }

        [$columnMap, $dataStartsAt] = $this->mapColumns($nonEmpty[0]['cells']);

        $rows = [];

        foreach (array_slice($nonEmpty, $dataStartsAt) as $entry) {
            $row = ['row_number' => $entry['file_row']];

            foreach (self::POSITIONAL_ORDER as $field) {
                $columnIndex = $columnMap[$field] ?? null;
                $value = $columnIndex !== null ? trim((string) ($entry['cells'][$columnIndex] ?? '')) : '';
                $row[$field] = $value === '' ? null : $value;
            }

            $rows[] = $row;
        }

        return $rows;
    }

    /**
     * Decide whether the first row is a header and which column carries which
     * field. Returns [field => column index, index of first data row].
     *
     * @param  list<string>  $firstRow
     * @return array{0: array<string, int>, 1: int}
     */
    private function mapColumns(array $firstRow): array
    {
        $map = [];

        foreach ($firstRow as $index => $cell) {
            $normalized = mb_strtolower(trim((string) $cell));
            $normalized = str_replace(['أ', 'إ', 'آ'], 'ا', $normalized);

            foreach (self::HEADER_ALIASES as $field => $aliases) {
                if (isset($map[$field])) {
                    continue;
                }

                $normalizedAliases = array_map(
                    fn (string $alias) => str_replace(['أ', 'إ', 'آ'], 'ا', mb_strtolower($alias)),
                    $aliases,
                );

                if (in_array($normalized, $normalizedAliases, true)) {
                    $map[$field] = $index;
                }
            }
        }

        // A recognizable header needs at least name + phone columns.
        if (isset($map['name'], $map['phone'])) {
            return [$map, 1];
        }

        // No header row — fall back to the spec's column order, treating the
        // first row as data.
        $positional = [];
        foreach (self::POSITIONAL_ORDER as $index => $field) {
            $positional[$field] = $index;
        }

        return [$positional, 0];
    }

    /**
     * @return list<list<string>>
     */
    private function readCsv(string $path): array
    {
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw ValidationException::withMessages(['file' => ['تعذر قراءة الملف.']]);
        }

        // Strip UTF-8 BOM (Excel exports) and normalize newlines.
        $contents = preg_replace('/^\xEF\xBB\xBF/', '', $contents) ?? $contents;
        $contents = str_replace(["\r\n", "\r"], "\n", $contents);

        // Excel in Arabic locales commonly exports semicolon-separated CSV.
        $firstLine = strtok($contents, "\n") ?: '';
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $rows = [];

        foreach (explode("\n", $contents) as $line) {
            if (trim($line) === '') {
                $rows[] = [];

                continue;
            }

            $rows[] = array_map(fn ($cell) => (string) $cell, str_getcsv($line, $delimiter));
        }

        // Trailing blank lines are noise, but internal ones keep row numbers aligned.
        while ($rows !== [] && $rows[array_key_last($rows)] === []) {
            array_pop($rows);
        }

        return $rows;
    }

    /**
     * Minimal .xlsx reader: the workbook is a zip; cell values live in the
     * first worksheet's XML with strings usually interned in sharedStrings.
     *
     * @return list<list<string>>
     */
    private function readXlsx(string $path): array
    {
        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw ValidationException::withMessages(['file' => ['ملف Excel تالف أو غير صالح.']]);
        }

        try {
            $sheetXml = $this->firstWorksheetXml($zip);
            $sharedStrings = $this->sharedStrings($zip);

            return $this->parseSheet($sheetXml, $sharedStrings);
        } finally {
            $zip->close();
        }
    }

    private function firstWorksheetXml(ZipArchive $zip): string
    {
        $workbook = $zip->getFromName('xl/workbook.xml');
        $rels = $zip->getFromName('xl/_rels/workbook.xml.rels');

        if ($workbook !== false && $rels !== false) {
            $workbookXml = @simplexml_load_string($workbook);
            $relsXml = @simplexml_load_string($rels);

            if ($workbookXml !== false && $relsXml !== false && isset($workbookXml->sheets->sheet[0])) {
                $sheet = $workbookXml->sheets->sheet[0];
                $relationshipId = (string) $sheet->attributes('http://schemas.openxmlformats.org/officeDocument/2006/relationships')['id'];

                foreach ($relsXml->Relationship as $relationship) {
                    if ((string) $relationship['Id'] === $relationshipId) {
                        $target = ltrim((string) $relationship['Target'], '/');
                        $target = str_starts_with($target, 'xl/') ? $target : 'xl/'.$target;
                        $contents = $zip->getFromName($target);

                        if ($contents !== false) {
                            return $contents;
                        }
                    }
                }
            }
        }

        $fallback = $zip->getFromName('xl/worksheets/sheet1.xml');

        if ($fallback === false) {
            throw ValidationException::withMessages(['file' => ['تعذر العثور على ورقة البيانات داخل ملف Excel.']]);
        }

        return $fallback;
    }

    /**
     * @return list<string>
     */
    private function sharedStrings(ZipArchive $zip): array
    {
        $contents = $zip->getFromName('xl/sharedStrings.xml');

        if ($contents === false) {
            return [];
        }

        $xml = @simplexml_load_string($contents);

        if ($xml === false) {
            return [];
        }

        $strings = [];

        foreach ($xml->si as $item) {
            if (isset($item->t)) {
                $strings[] = (string) $item->t;

                continue;
            }

            // Rich-text runs: concatenate every <t> descendant.
            $text = '';
            foreach ($item->r as $run) {
                $text .= (string) $run->t;
            }
            $strings[] = $text;
        }

        return $strings;
    }

    /**
     * @param  list<string>  $sharedStrings
     * @return list<list<string>>
     */
    private function parseSheet(string $sheetXml, array $sharedStrings): array
    {
        $xml = @simplexml_load_string($sheetXml);

        if ($xml === false || ! isset($xml->sheetData)) {
            throw ValidationException::withMessages(['file' => ['ملف Excel تالف أو غير صالح.']]);
        }

        $rows = [];

        foreach ($xml->sheetData->row as $rowNode) {
            $rowIndex = (int) $rowNode['r'];

            if ($rowIndex < 1) {
                $rowIndex = count($rows) + 1;
            }

            $cells = [];

            foreach ($rowNode->c as $cellNode) {
                $reference = (string) $cellNode['r'];
                $columnIndex = $this->columnIndex($reference, count($cells));
                $cells[$columnIndex] = $this->cellValue($cellNode, $sharedStrings);
            }

            // Pad skipped rows/columns so positions stay faithful to the sheet.
            while (count($rows) < $rowIndex - 1) {
                $rows[] = [];
            }

            $dense = [];
            $max = $cells === [] ? -1 : max(array_keys($cells));
            for ($i = 0; $i <= $max; $i++) {
                $dense[] = $cells[$i] ?? '';
            }

            $rows[] = $dense;
        }

        return $rows;
    }

    private function cellValue(\SimpleXMLElement $cell, array $sharedStrings): string
    {
        $type = (string) $cell['t'];

        if ($type === 's') {
            return $sharedStrings[(int) $cell->v] ?? '';
        }

        if ($type === 'inlineStr') {
            return isset($cell->is->t) ? (string) $cell->is->t : '';
        }

        $value = isset($cell->v) ? (string) $cell->v : '';

        // Phones typed as numbers can surface in scientific notation.
        if ($value !== '' && preg_match('/^-?\d+(\.\d+)?E[+-]?\d+$/i', $value)) {
            $value = sprintf('%.0F', (float) $value);
        }

        // 501234567.0 → 501234567 (Excel float storage of integers).
        if ($value !== '' && preg_match('/^\d+\.0+$/', $value)) {
            $value = (string) (int) (float) $value;
        }

        return $value;
    }

    /**
     * "B7" → 1. Falls back to the running position when the reference is absent.
     */
    private function columnIndex(string $reference, int $fallback): int
    {
        if (! preg_match('/^([A-Z]+)\d+$/', $reference, $matches)) {
            return $fallback;
        }

        $letters = $matches[1];
        $index = 0;

        foreach (str_split($letters) as $letter) {
            $index = $index * 26 + (ord($letter) - ord('A') + 1);
        }

        return $index - 1;
    }
}
