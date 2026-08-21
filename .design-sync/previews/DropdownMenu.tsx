import {
    Button,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from 'teamat-ui';
import { LogOut, Settings, User } from 'lucide-react';

export const AccountMenu = () => (
    <DropdownMenu open>
        <DropdownMenuTrigger asChild>
            <Button variant="outline">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" style={{ minWidth: 224 }}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    <User />
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings />
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
                Email notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
                Push notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
                <LogOut />
                Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);
