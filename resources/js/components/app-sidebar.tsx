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
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Sun, Monitor, Moon } from 'lucide-react';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';

export function AppSidebar() {
    const { url = '' } = usePage().props as any;
    const isThemePage = String(url).includes('/admin/lookups') || String(url).includes('/admin/products');
    const { appearance, updateAppearance } = useAppearance();

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
                    {/* Inline theme toggle below the logo */}
                    <SidebarMenuItem>
                        <div className="mt-2 flex items-center px-2">
                            <ToggleGroup
                                className="w-full"
                                type="single"
                                value={appearance}
                                onValueChange={(v: Appearance) => updateAppearance(v)}
                                aria-label="Theme"
                            >
                                <ToggleGroupItem value="light" aria-label="Light">
                                    <Sun className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="system" aria-label="System">
                                    <Monitor className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="dark" aria-label="Dark">
                                    <Moon className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
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
