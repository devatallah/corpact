import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from 'teamat-ui';

export const FullComposition = () => (
    <Card style={{ width: 400 }}>
        <CardHeader>
            <CardTitle>Venue details</CardTitle>
            <CardDescription>
                Update the name and capacity for this court.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Name</span>
                    <span style={{ fontWeight: 500 }}>Padel Court 1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Capacity</span>
                    <span style={{ fontWeight: 500 }}>4 players</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Hourly rate</span>
                    <span style={{ fontWeight: 500 }}>120 SAR</span>
                </div>
            </div>
        </CardContent>
        <CardFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
        </CardFooter>
    </Card>
);

export const HeaderAndContent = () => (
    <Card style={{ width: 400 }}>
        <CardHeader>
            <CardTitle>Upcoming bookings</CardTitle>
            <CardDescription>You have 3 bookings this week.</CardDescription>
        </CardHeader>
        <CardContent>
            <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
                <div>
                    <div style={{ fontWeight: 500 }}>Tennis Court 2</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                        Tomorrow, 6:00 PM – 7:00 PM
                    </div>
                </div>
                <div>
                    <div style={{ fontWeight: 500 }}>Padel Court 1</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                        Thursday, 8:00 PM – 9:30 PM
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);
