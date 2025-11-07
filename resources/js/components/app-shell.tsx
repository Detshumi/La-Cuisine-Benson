import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const { url = '' } = usePage<any>() as any;
    const isThemePage = String(url).includes('/admin/lookups') || String(url).includes('/admin/products');

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    // When rendering the sidebar variant we attach a data-theme attribute to the provider wrapper
    // so both sidebar and content can pick up the theme for smooth transitions.
    return (
        <div data-theme={isThemePage ? 'lookups' : undefined}>
            <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>
        </div>
    );
}
