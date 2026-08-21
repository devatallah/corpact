import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'teamat-ui';

export const Basic = () => (
    <TooltipProvider>
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: 160,
                paddingBottom: 24,
            }}
        >
            <Tooltip open>
                <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>Add this activity to favorites</TooltipContent>
            </Tooltip>
        </div>
    </TooltipProvider>
);
