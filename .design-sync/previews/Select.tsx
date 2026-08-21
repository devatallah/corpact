import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from 'teamat-ui';

// cardMode=single (480x460): only this first export renders on the card.
// Rendered OPEN so the popover content is visible in the static capture.
export const OpenWithSelection = () => (
    <div style={{ padding: '8px 4px 300px' }}>
        <Select defaultValue="padel" open>
            <SelectTrigger style={{ width: 240 }} aria-label="Activity type">
                <SelectValue placeholder="Choose an activity" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Sports</SelectLabel>
                    <SelectItem value="padel">Padel</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="bowling">Bowling</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Wellness</SelectLabel>
                    <SelectItem value="yoga">Yoga class</SelectItem>
                    <SelectItem value="gym">Gym session</SelectItem>
                    <SelectItem value="spa" disabled>
                        Spa day (unavailable)
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
);
