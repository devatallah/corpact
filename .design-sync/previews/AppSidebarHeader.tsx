import { AppSidebarHeader, SidebarProvider } from 'teamat-ui';

// AppSidebarHeader = the page top bar inside the sidebar layout: a
// SidebarTrigger plus Breadcrumbs. SidebarTrigger needs SidebarProvider
// context; inline minHeight keeps the provider from filling the viewport.
export const WithBreadcrumbs = () => (
    <SidebarProvider style={{ minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <AppSidebarHeader
                breadcrumbs={[
                    { title: 'Platform', href: '#' },
                    { title: 'Companies', href: '#' },
                    { title: 'Ittihad Tech', href: '#' },
                ]}
            />
        </div>
    </SidebarProvider>
);

export const SinglePage = () => (
    <SidebarProvider style={{ minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <AppSidebarHeader breadcrumbs={[{ title: 'Dashboard', href: '#' }]} />
        </div>
    </SidebarProvider>
);
