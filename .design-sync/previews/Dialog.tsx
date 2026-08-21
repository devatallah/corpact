import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from 'teamat-ui';

export const EditProfile = () => (
    <Dialog open>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Sara Ahmed" />
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="sara@teamat.app" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
