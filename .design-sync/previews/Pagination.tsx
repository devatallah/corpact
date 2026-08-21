import { Pagination } from 'teamat-ui';

// Laravel-paginator-shaped links, as passed from index pages
// (e.g. admin/businesses: <Pagination links={businesses.links} />).
// .fbtn styling comes from the enclosing portal class.

const midPageLinks = [
    { url: '/admin/businesses?page=1', label: '&laquo; Previous', active: false },
    { url: '/admin/businesses?page=1', label: '1', active: false },
    { url: '/admin/businesses?page=2', label: '2', active: true },
    { url: '/admin/businesses?page=3', label: '3', active: false },
    { url: '/admin/businesses?page=4', label: '4', active: false },
    { url: '/admin/businesses?page=5', label: '5', active: false },
    { url: '/admin/businesses?page=3', label: 'Next &raquo;', active: false },
];

const firstPageLinks = [
    { url: null, label: '&laquo; Previous', active: false },
    { url: '/activities?page=1', label: '1', active: true },
    { url: '/activities?page=2', label: '2', active: false },
    { url: '/activities?page=3', label: '3', active: false },
    { url: '/activities?page=2', label: 'Next &raquo;', active: false },
];

export const AdminPortal = () => (
    <div
        className="portal-admin"
        dir="rtl"
        style={{ minHeight: 0, padding: 20, display: 'block' }}
    >
        <Pagination links={midPageLinks} />
    </div>
);

export const CompanyPortalFirstPage = () => (
    <div
        className="portal-company"
        dir="rtl"
        style={{ minHeight: 0, padding: 20, display: 'block' }}
    >
        <Pagination links={firstPageLinks} />
    </div>
);
