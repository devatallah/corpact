import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from 'teamat-ui';

function FeatureLink({
    href,
    title,
    children,
}: {
    href: string;
    title: string;
    children: string;
}) {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a href={href}>
                    <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>
                        {title}
                    </div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: 1.4,
                            color: 'var(--muted-foreground)',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
}

// Canonical cell (cardMode=single): menu bar with the first item open
// via defaultValue on the root so the dropdown renders statically.
export const MenuBarWithOpenItem = () => (
    <div
        style={{
            minHeight: 380,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: 8,
        }}
    >
        <NavigationMenu defaultValue="getting-started">
            <NavigationMenuList>
                <NavigationMenuItem value="getting-started">
                    <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul
                            style={{
                                display: 'grid',
                                gap: 8,
                                width: 400,
                                margin: 0,
                                padding: 4,
                                listStyle: 'none',
                            }}
                        >
                            <FeatureLink href="/docs" title="Introduction">
                                Re-usable components built with Radix UI and Tailwind CSS.
                            </FeatureLink>
                            <FeatureLink href="/docs/installation" title="Installation">
                                How to install dependencies and structure your app.
                            </FeatureLink>
                            <FeatureLink href="/docs/typography" title="Typography">
                                Styles for headings, paragraphs, lists and more.
                            </FeatureLink>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem value="components">
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul
                            style={{
                                display: 'grid',
                                gap: 8,
                                width: 400,
                                margin: 0,
                                padding: 4,
                                listStyle: 'none',
                            }}
                        >
                            <FeatureLink href="/docs/components/alert" title="Alert">
                                Displays a callout for user attention.
                            </FeatureLink>
                            <FeatureLink href="/docs/components/badge" title="Badge">
                                Displays a badge or a component that looks like a badge.
                            </FeatureLink>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        href="/docs"
                        className={navigationMenuTriggerStyle()}
                    >
                        Documentation
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </div>
);
