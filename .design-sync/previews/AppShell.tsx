import {
    AppShell,
    AppContent,
    AppSidebarHeader,
    AppLogo,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarRail,
} from 'teamat-ui';
import {
    LayoutGrid,
    Building2,
    Users,
    CalendarDays,
    Settings,
    LogOut,
} from 'lucide-react';

// AppShell's default 'sidebar' variant wraps everything in SidebarProvider —
// composed here exactly like the starter-kit sidebar layout:
// AppShell > Sidebar + AppContent(SidebarInset) > AppSidebarHeader + page.
export const SidebarVariant = () => (
    <AppShell variant="sidebar">
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <AppLogo />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Building2 />
                                <span>Companies</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Users />
                                <span>Employees</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <CalendarDays />
                                <span>Events</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Settings />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
        <AppContent variant="sidebar">
            <AppSidebarHeader
                breadcrumbs={[
                    { title: 'Platform', href: '#' },
                    { title: 'Dashboard', href: '#' },
                ]}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, flex: 1 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    {['Companies', 'Employees', 'Bookings'].map((label, i) => (
                        <div
                            key={label}
                            style={{
                                flex: 1,
                                border: '1px solid #e4e4e7',
                                borderRadius: 12,
                                padding: 16,
                            }}
                        >
                            <div style={{ fontSize: 12, color: '#71717a' }}>{label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                                {[48, '1,284', 37][i]}
                            </div>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        flex: 1,
                        minHeight: 200,
                        border: '1px dashed #d4d4d8',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a1a1aa',
                        fontSize: 13,
                    }}
                >
                    Page content
                </div>
            </div>
        </AppContent>
    </AppShell>
);

// The 'header' variant is a plain full-height column — the app puts a top
// header bar above AppContent(variant="header") instead of a sidebar.
export const HeaderVariant = () => (
    <AppShell variant="header">
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                height: 64,
                flexShrink: 0,
                padding: '0 32px',
                borderBottom: '1px solid #e4e4e7',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <AppLogo />
            </div>
            <nav style={{ display: 'flex', gap: 20, fontSize: 14, color: '#3f3f46' }}>
                <span style={{ fontWeight: 600, color: '#09090b' }}>Dashboard</span>
                <span>Companies</span>
                <span>Events</span>
                <span>Reports</span>
            </nav>
        </header>
        <AppContent variant="header" style={{ padding: 24, minHeight: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>
                Overview of platform activity
            </p>
            <div
                style={{
                    flex: 1,
                    minHeight: 200,
                    border: '1px dashed #d4d4d8',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a1a1aa',
                    fontSize: 13,
                }}
            >
                Page content
            </div>
        </AppContent>
    </AppShell>
);
