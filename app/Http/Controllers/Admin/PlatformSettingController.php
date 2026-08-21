<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\PlatformSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * H §16 «الإعدادات: … العتبات والمهل» / G (أدمن تيمات §4): «العتبات والمهل على
 * مستوى المنصة، ومنها مهلة قائمة الانتظار (لا تُضبط من القالب)».
 *
 * A7 left those values in `config/events.php` pending this screen.
 */
class PlatformSettingController extends Controller
{
    public function __construct(private PlatformSettingsService $settings) {}

    public function index(): Response
    {
        $values = $this->settings->values();

        $fields = [];

        foreach (PlatformSettingsService::schema() as $key => $definition) {
            $fields[] = [
                'key' => $key,
                'label' => $definition['label'],
                'unit' => $definition['unit'],
                'min' => $definition['min'],
                'max' => $definition['max'],
                'group' => $definition['group'],
                'hint' => $definition['hint'],
                'value' => $values[$key],
                'default' => (int) config($definition['config']),
                'config_key' => $definition['config'],
            ];
        }

        return Inertia::render('admin/settings/platform', [
            'fields' => $fields,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $rules = [];
        $messages = [];

        foreach (PlatformSettingsService::schema() as $key => $definition) {
            $rules['values.'.$key] = ['required', 'integer', 'min:'.$definition['min'], 'max:'.$definition['max']];
            $messages['values.'.$key.'.required'] = "«{$definition['label']}» مطلوب.";
            $messages['values.'.$key.'.min'] = "«{$definition['label']}» لا يقل عن {$definition['min']} {$definition['unit']}.";
            $messages['values.'.$key.'.max'] = "«{$definition['label']}» لا يزيد عن {$definition['max']} {$definition['unit']}.";
        }

        $data = $request->validate($rules, $messages);

        $this->settings->update($data['values']);

        return back()->with('success', 'حُفظت عتبات المنصة وسُجِّلت في سجل التدقيق.');
    }
}
