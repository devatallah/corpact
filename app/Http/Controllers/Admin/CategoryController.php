<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Extract dominant color from an image file.
     */
    private function extractDominantColor(string $path): ?string
    {
        $fullPath = Storage::disk('public')->path($path);

        if (!file_exists($fullPath)) {
            return null;
        }

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        // For SVGs, parse fill/stroke attributes
        if ($ext === 'svg') {
            return $this->extractColorFromSvg($fullPath);
        }

        // For raster images, use GD
        $image = match ($ext) {
            'png' => @imagecreatefrompng($fullPath),
            'jpg', 'jpeg' => @imagecreatefromjpeg($fullPath),
            'gif' => @imagecreatefromgif($fullPath),
            'webp' => @imagecreatefromwebp($fullPath),
            default => null,
        };

        if (!$image) {
            return null;
        }

        $width = imagesx($image);
        $height = imagesy($image);

        // Sample pixels (skip transparent/white/black)
        $colors = [];
        $step = max(1, (int) ($width * $height / 500)); // sample ~500 pixels
        for ($i = 0; $i < $width * $height; $i += $step) {
            $x = $i % $width;
            $y = (int) ($i / $width);
            $rgba = imagecolorat($image, $x, $y);
            $r = ($rgba >> 16) & 0xFF;
            $g = ($rgba >> 8) & 0xFF;
            $b = $rgba & 0xFF;
            $a = ($rgba >> 24) & 0x7F; // 0=opaque, 127=transparent

            // Skip transparent, near-white, near-black pixels
            if ($a > 64) continue;
            if ($r > 240 && $g > 240 && $b > 240) continue;
            if ($r < 15 && $g < 15 && $b < 15) continue;

            // Quantize to reduce color space
            $qr = (int) round($r / 32) * 32;
            $qg = (int) round($g / 32) * 32;
            $qb = (int) round($b / 32) * 32;
            $key = "{$qr},{$qg},{$qb}";
            $colors[$key] = ($colors[$key] ?? ['count' => 0, 'r' => 0, 'g' => 0, 'b' => 0]);
            $colors[$key]['count']++;
            $colors[$key]['r'] += $r;
            $colors[$key]['g'] += $g;
            $colors[$key]['b'] += $b;
        }

        imagedestroy($image);

        if (empty($colors)) {
            return null;
        }

        // Find most frequent color bucket
        usort($colors, fn ($a, $b) => $b['count'] - $a['count']);
        $top = $colors[0];
        $r = (int) round($top['r'] / $top['count']);
        $g = (int) round($top['g'] / $top['count']);
        $b = (int) round($top['b'] / $top['count']);

        return sprintf('#%02X%02X%02X', $r, $g, $b);
    }

    private function extractColorFromSvg(string $path): ?string
    {
        $content = file_get_contents($path);
        if (!$content) {
            return null;
        }

        // Collect fill colors first, then stroke (fill is more representative)
        preg_match_all('/fill\s*=\s*"(#[0-9A-Fa-f]{3,6})"/', $content, $fillMatches);
        preg_match_all('/stroke\s*=\s*"(#[0-9A-Fa-f]{3,6})"/', $content, $strokeMatches);

        $candidates = [];

        // Process fills first (higher priority), then strokes
        foreach (array_merge($fillMatches[1], $strokeMatches[1]) as $hex) {
            $hex = strtoupper($hex);
            if (strlen($hex) === 4) {
                $hex = '#' . $hex[1] . $hex[1] . $hex[2] . $hex[2] . $hex[3] . $hex[3];
            }

            $r = hexdec(substr($hex, 1, 2));
            $g = hexdec(substr($hex, 3, 2));
            $b = hexdec(substr($hex, 5, 2));

            $max = max($r, $g, $b);
            $min = min($r, $g, $b);
            $chroma = $max - $min;

            // Skip backgrounds (very light), near-black, grays, white, black
            if ($max > 230 && $min > 200) continue;
            if ($max < 60) continue;
            if ($chroma < 30) continue; // skip grays including #333

            $saturation = $max > 0 ? $chroma / $max : 0;
            $candidates[] = ['hex' => $hex, 'saturation' => $saturation];
        }

        if (empty($candidates)) {
            return null;
        }

        // Return the first colorful candidate (fills come first, so we prefer the main shape fill)
        return $candidates[0]['hex'];
    }

    public function index(Request $request): Response
    {
        $query = Category::withTrashed()->with('parent')->withCount(['communities', 'venues', 'events']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderByRaw('COALESCE(parent_id, id), parent_id IS NOT NULL, name')->paginate(20)->withQueryString();
        $totalSports = Category::withTrashed()->count();
        $parentCategories = Category::withTrashed()->whereNull('parent_id')->orderBy('name')->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'parentCategories' => $parentCategories,
            'totalSports' => $totalSports,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'name_en' => ['nullable', 'string', 'max:100'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', 'file', 'image', 'max:2048'],
        ], [
            'name.required' => 'اسم الفئة مطلوب.',
            'name.max' => 'اسم الفئة يجب ألا يتجاوز 100 حرف.',
            'icon.image' => 'الأيقونة يجب أن تكون صورة.',
            'icon.max' => 'حجم الأيقونة يجب ألا يتجاوز 2 ميجابايت.',
        ]);

        if ($request->hasFile('icon')) {
            $storedPath = $request->file('icon')->store('categories', 'public');
            $data['icon'] = '/storage/'.$storedPath;
            $data['color'] = $this->extractDominantColor($storedPath) ?? '#009E82';
        } else {
            unset($data['icon']);
        }

        Category::create($data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'تمت إضافة الرياضة بنجاح.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'name_en' => ['nullable', 'string', 'max:100'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', 'file', 'image', 'max:2048'],
        ], [
            'name.required' => 'اسم الفئة مطلوب.',
            'name.max' => 'اسم الفئة يجب ألا يتجاوز 100 حرف.',
            'icon.image' => 'الأيقونة يجب أن تكون صورة.',
            'icon.max' => 'حجم الأيقونة يجب ألا يتجاوز 2 ميجابايت.',
        ]);

        if ($request->hasFile('icon')) {
            // Delete old icon if it's a stored file
            if ($category->icon && str_starts_with($category->icon, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $category->icon));
            }
            $storedPath = $request->file('icon')->store('categories', 'public');
            $data['icon'] = '/storage/'.$storedPath;
            $data['color'] = $this->extractDominantColor($storedPath) ?? '#009E82';
        } else {
            unset($data['icon']);
        }

        $category->update($data);

        return back()->with('success', 'تم تحديث الرياضة بنجاح.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->delete();

        return back()->with('success', 'تم تعطيل الرياضة بنجاح.');
    }

    public function restore(int $id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return back()->with('success', 'تم تفعيل الرياضة بنجاح.');
    }
}
