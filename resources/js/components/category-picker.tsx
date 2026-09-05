/**
 * شجرة الأنشطة كمجموعة أزرار، مجمّعة تحت كل أب.
 *
 * تُستعمل في إنشاء المزوّد وتعديله معاً — الشجرة نفسها ودلالة الاختيار نفسها.
 * كانت شاشة الإنشاء تستوردها من شاشة التعديل، فصارت الثانية تبعيةً للأولى.
 */
export function CategoryPicker({
    categories,
    selected,
    onChange,
    error,
}: {
    categories: { id: number; name: string; children?: { id: number; name: string }[] }[];
    selected: number[];
    onChange: (ids: number[]) => void;
    error?: string;
}) {
    function toggle(id: number) {
        onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
    }

    return (
        <div className="space-y-4">
            {categories.map((parent) => (
                <div key={parent.id} className="space-y-2">
                    <span className="text-[11px] font-extrabold text-ink/50 uppercase tracking-wider block">{parent.name}</span>
                    <div className="flex flex-wrap gap-2">
                        {[parent, ...(parent.children ?? [])].map((category) => {
                            const active = selected.includes(category.id);

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => toggle(category.id)}
                                    aria-pressed={active}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer ${
                                        active ? 'bg-ink text-lime border-ink' : 'bg-surface text-ink/70 border-ink/15 hover:border-ink/30'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {error && <p className="text-[11px] font-bold text-danger">{error}</p>}
            {selected.length === 0 && !error && (
                <p className="text-[11px] text-ink/55">اختر نشاطاً واحداً على الأقل — بدونه لا يظهر المرفق في محرك الاقتراحات.</p>
            )}
        </div>
    );
}
