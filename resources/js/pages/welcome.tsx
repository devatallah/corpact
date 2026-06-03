import { Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
    const portals = [
        { label: 'الشركة', desc: 'إدارة الموظفين والمجتمعات والميزانية', href: '/company/login', tag: 'COMPANY', color: '#3B5BDB' },
        { label: 'الأعمال', desc: 'إدارة المرافق والحجوزات والتسويات', href: '/business/login', tag: 'BUSINESS', color: '#C8410A' },
        { label: 'الموظف', desc: 'استكشاف المجتمعات والانضمام للفعاليات', href: '/employee/login', tag: 'EMPLOYEE', color: '#009E82' },
    ];

    return (
        <>
            <Head title="Teamat">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6" dir="rtl">
                <div className="w-full max-w-lg space-y-10 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <AppLogoIcon className="size-12 fill-current" />
                        <h1 className="text-3xl font-bold">Teamat</h1>
                        <p className="text-muted-foreground">منصة إدارة الأنشطة الرياضية للشركات</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {portals.map((p) => (
                            <Link
                                key={p.tag}
                                href={p.href}
                                className="group rounded-xl border bg-card p-5 text-start transition-all hover:shadow-md"
                                style={{ borderTopWidth: 3, borderTopColor: p.color }}
                            >
                                <span className="text-xs font-bold tracking-wider" style={{ color: p.color }}>
                                    {p.tag}
                                </span>
                                <h3 className="mt-1 text-base font-semibold">{p.label}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
