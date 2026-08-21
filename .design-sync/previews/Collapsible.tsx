import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from 'teamat-ui';
import { ChevronsUpDown } from 'lucide-react';
import type { CSSProperties } from 'react';

const rowStyle: CSSProperties = {
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    backgroundColor: 'var(--card)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

export const OpenByDefault = () => (
    <Collapsible defaultOpen style={{ width: 320 }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 12,
                marginBottom: 8,
            }}
        >
            <span style={{ fontSize: 14, fontWeight: 600 }}>Starred venues (3)</span>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle list">
                    <ChevronsUpDown />
                </Button>
            </CollapsibleTrigger>
        </div>
        <div style={rowStyle}>Padel Court 1 — Riyadh</div>
        <CollapsibleContent>
            <div style={{ ...rowStyle, marginTop: 8 }}>Tennis Court 2 — Jeddah</div>
            <div style={{ ...rowStyle, marginTop: 8 }}>Basketball Hall — Dammam</div>
        </CollapsibleContent>
    </Collapsible>
);

export const Collapsed = () => (
    <Collapsible style={{ width: 320 }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 12,
                marginBottom: 8,
            }}
        >
            <span style={{ fontSize: 14, fontWeight: 600 }}>Starred venues (3)</span>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle list">
                    <ChevronsUpDown />
                </Button>
            </CollapsibleTrigger>
        </div>
        <div style={rowStyle}>Padel Court 1 — Riyadh</div>
        <CollapsibleContent>
            <div style={{ ...rowStyle, marginTop: 8 }}>Tennis Court 2 — Jeddah</div>
            <div style={{ ...rowStyle, marginTop: 8 }}>Basketball Hall — Dammam</div>
        </CollapsibleContent>
    </Collapsible>
);
