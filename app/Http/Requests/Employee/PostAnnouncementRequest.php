<?php

namespace App\Http\Requests\Employee;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PostAnnouncementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // H §6: نص ورابط فقط — بلا صور ولا مرفقات.
        return [
            'body' => ['required', 'string', 'max:500'],
            'link_url' => ['nullable', 'string', 'url', 'max:2048'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'نص الإعلان مطلوب.',
            'body.max' => 'نص الإعلان يجب ألا يتجاوز 500 حرف.',
            'link_url.url' => 'الرابط غير صالح.',
        ];
    }
}
