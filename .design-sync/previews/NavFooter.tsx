import { NavFooter, SidebarProvider } from 'teamat-ui';
import { BookOpen, LifeBuoy, Settings } from 'lucide-react';

// NavFooter composes Sidebar primitives (SidebarMenuButton calls
// useSidebar), so it must render inside a SidebarProvider.

export const FooterLinks = () => (
    <SidebarProvider style={{ minHeight: 0 }}>
        <div
            dir="rtl"
            className="bg-sidebar"
            style={{
                width: 256,
                borderRadius: 8,
                border: '1px solid var(--sidebar-border)',
                padding: 8,
            }}
        >
            <NavFooter
                items={[
                    { title: 'مركز المساعدة', href: '/help', icon: LifeBuoy },
                    { title: 'الوثائق', href: '/docs', icon: BookOpen },
                    { title: 'الإعدادات', href: '/settings', icon: Settings },
                ]}
            />
        </div>
    </SidebarProvider>
);

export const WithoutIcons = () => (
    <SidebarProvider style={{ minHeight: 0 }}>
        <div
            dir="rtl"
            className="bg-sidebar"
            style={{
                width: 256,
                borderRadius: 8,
                border: '1px solid var(--sidebar-border)',
                padding: 8,
            }}
        >
            <NavFooter
                items={[
                    { title: 'سياسة الخصوصية', href: '/privacy' },
                    { title: 'شروط الاستخدام', href: '/terms' },
                ]}
            />
        </div>
    </SidebarProvider>
);
