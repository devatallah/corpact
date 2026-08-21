import {
    Button,
    Input,
    Label,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from 'teamat-ui';

export const FilterPanel = () => (
    <Sheet open>
        <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader>
                <SheetTitle>Filter activities</SheetTitle>
                <SheetDescription>
                    Narrow down the list, then apply your filters.
                </SheetDescription>
            </SheetHeader>
            <div style={{ display: 'grid', gap: 16, padding: '0 16px' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                    <Label htmlFor="sheet-city">City</Label>
                    <Input id="sheet-city" defaultValue="Riyadh" />
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                    <Label htmlFor="sheet-size">Team size</Label>
                    <Input id="sheet-size" type="number" defaultValue={12} />
                </div>
            </div>
            <SheetFooter>
                <Button>Apply filters</Button>
                <Button variant="outline">Reset</Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
);
