/**
 * Print a single card/section as PDF by opening a new window with just that content.
 */
export function printCard(element: HTMLElement | null, title?: string) {
    if (!element) return;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${title ?? 'تقرير'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Tahoma, Arial, sans-serif; direction: rtl; padding: 24px; background: #fff; color: #111827; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #F9FAFB; padding: 10px 14px; text-align: right; font-weight: 600; font-size: 12px; color: #6B7280; border-bottom: 1px solid #E5E7EB; }
  td { padding: 12px 14px; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
  .no-print { display: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>${element.innerHTML}</body>
</html>`);

    win.document.close();
    setTimeout(() => {
        win.print();
        win.close();
    }, 300);
}
