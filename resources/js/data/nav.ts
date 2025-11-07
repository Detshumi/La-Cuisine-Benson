import { dashboard } from '@/routes';
import { LayoutGrid, Folder, BookOpen, ShoppingCart } from 'lucide-react';

export const mainNavItems = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Lookups',
        href: '/admin/lookups',
        icon: Folder,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: ShoppingCart,
    },
];

export const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export default { mainNavItems, footerNavItems };
