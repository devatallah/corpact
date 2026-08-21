import { PlaceholderPattern } from 'teamat-ui';

// The app-source pattern path has no stroke of its own — callers give the SVG
// a stroke via className. The bundle CSS ships no stroke-* utilities, so a
// scoped <style> supplies the same muted stroke the starter-kit usage applies.
export const DashboardPlaceholder = () => (
    <div style={{ width: 420 }}>
        <style>{`
            svg.ds-ph-demo { position: absolute; inset: 0; width: 100%; height: 100%; }
            svg.ds-ph-demo path { stroke: rgba(23, 23, 23, 0.2); }
        `}</style>
        <div
            style={{
                position: 'relative',
                height: 160,
                overflow: 'hidden',
                borderRadius: 12,
                border: '1px solid var(--border)',
            }}
        >
            <PlaceholderPattern className="ds-ph-demo" />
        </div>
    </div>
);
