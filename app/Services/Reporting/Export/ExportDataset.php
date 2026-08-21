<?php

namespace App\Services\Reporting\Export;

/**
 * A13 — مجموعة تصدير جاهزة: أعمدة + صفوف + ترويسة وصفية.
 *
 * الحجب يقع **هنا** لا في كل مُصدِّر: {@see redactFor()} تُسقط الأعمدة
 * الممنوعة على الجمهور **ومفاتيحها من كل صف** — فلا يتسرب جوال في XLSX لأن
 * كاتب الملف قرأ الصف الخام. الطبقة التي تكتب الملف لا ترى إلا المُنقّى.
 */
final class ExportDataset
{
    /**
     * @param  list<ExportColumn>  $columns
     * @param  list<array<string, mixed>>  $rows
     * @param  array<string, string>  $meta  ترويسة الملف: الشركة، الفترة، من صدّر، متى
     */
    public function __construct(
        public readonly string $key,
        public readonly string $title,
        public readonly array $columns,
        public readonly array $rows,
        public readonly array $meta = [],
    ) {}

    /**
     * نسخة منقّاة لجمهور محدد: الأعمدة الممنوعة تختفي من الترويسة ومن الصفوف.
     */
    public function redactFor(ExportAudience $audience): self
    {
        $visible = array_values(array_filter(
            $this->columns,
            fn (ExportColumn $column) => $column->isVisibleTo($audience),
        ));

        if (count($visible) === count($this->columns)) {
            return $this;
        }

        $allowedKeys = array_map(fn (ExportColumn $column) => $column->key, $visible);

        $rows = array_map(
            fn (array $row) => array_intersect_key($row, array_flip($allowedKeys)),
            $this->rows,
        );

        return new self($this->key, $this->title, $visible, array_values($rows), $this->meta);
    }

    public function rowCount(): int
    {
        return count($this->rows);
    }

    /**
     * @return list<string>
     */
    public function columnKeys(): array
    {
        return array_map(fn (ExportColumn $column) => $column->key, $this->columns);
    }

    public function withMeta(string $key, string $value): self
    {
        return new self($this->key, $this->title, $this->columns, $this->rows, [...$this->meta, $key => $value]);
    }
}
