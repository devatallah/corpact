import {
    Sidebar,
    SidebarProvider,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuBadge,
    SidebarFooter,
    SidebarInset,
    SidebarTrigger,
    SidebarRail,
    TooltipProvider,
    AppLogo,
} from 'teamat-ui';
import {
    LayoutGrid,
    Building2,
    Users,
    CalendarDays,
    Wallet,
    Bell,
    Trophy,
    Settings,
    LifeBuoy,
    ChevronsUpDown,
} from 'lucide-react';

// The app frame: shadcn Sidebar composed the way the starter-kit sidebar layout
// does — logo header, grouped menu with active item + badges, user footer, and
// a SidebarInset so the card reads as the real app shell.
// TooltipProvider is required because SidebarMenuButton's `tooltip` prop
// renders a radix Tooltip (this repo's SidebarProvider does not include one).
export const AppFrame = () => (
    <TooltipProvider>
    <SidebarProvider>
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
                            <SidebarMenuButton isActive tooltip="Dashboard">
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Companies">
                                <Building2 />
                                <span>Companies</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>12</SidebarMenuBadge>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Employees">
                                <Users />
                                <span>Employees</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Events">
                                <CalendarDays />
                                <span>Events</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Leagues">
                                <Trophy />
                                <span>Leagues</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Wallet">
                                <Wallet />
                                <span>Wallet</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Notifications">
                                <Bell />
                                <span>Notifications</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>3</SidebarMenuBadge>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Settings">
                                <Settings />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Support">
                                <LifeBuoy />
                                <span>Support</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: '#e4e4e7',
                                    color: '#3f3f46',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    flexShrink: 0,
                                }}
                            >
                                SA
                            </span>
                            <span
                                style={{
                                    display: 'grid',
                                    flex: 1,
                                    textAlign: 'left',
                                    lineHeight: 1.3,
                                }}
                            >
                                <span style={{ fontSize: 13, fontWeight: 600 }}>
                                    Sara Ahmed
                                </span>
                                <span style={{ fontSize: 11, color: '#71717a' }}>
                                    sara@teamat.app
                                </span>
                            </span>
                            <ChevronsUpDown style={{ marginLeft: 'auto' }} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
        <SidebarInset>
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 64,
                    flexShrink: 0,
                    padding: '0 24px',
                    borderBottom: '1px solid #e4e4e7',
                }}
            >
                <SidebarTrigger />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Dashboard</span>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    {['Active companies', 'Employees enrolled', 'Bookings today'].map(
                        (label, i) => (
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
                        ),
                    )}
                </div>
                <div
                    style={{
                        flex: 1,
                        minHeight: 220,
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
        </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
);
