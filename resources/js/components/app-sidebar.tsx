import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { mainNavItems, footerNavItems } from '@/data/nav';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { url = '' } = usePage().props as any;
    const isThemePage = String(url).includes('/admin/lookups') || String(url).includes('/admin/products');

    const lookupsGradient = 'linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(20,184,166,1) 100%)';

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            style={isThemePage ? { background: lookupsGradient, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' } : undefined}
            className={isThemePage ? 'text-white' : undefined}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
