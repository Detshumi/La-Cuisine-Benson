import React, { useState, useEffect } from 'react';
import { usePage, useForm, Head } from '@inertiajs/react';
import { Folder, FolderMinus, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
// dropdown removed — category will be read-only and chosen from the category card

export default function Lookups() {
    const { props } = usePage();
    const { options = [], categories = [], trans = {}, flash = {}, locale = 'en' } = props as any;

    const breadcrumbs = [ { title: trans?.options ?? 'Lookups', href: '/admin/lookups' } ];

    const optionForm = useForm({ name_en: '', name_fr: '', description_en: '', description_fr: '', thumbnail: '', category_id: '' });
    const categoryForm = useForm({ name_en: '', name_fr: '' });

    // option alerts removed — we no longer show inline option alerts here
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'category' | 'option'; id: number } | null>(null);

    // search state for category dropdown (declared after localCategories to avoid TDZ)

    function submitOption(e: any) {
        e.preventDefault();
        // client-side validation: require all fields
        const missing: Record<string,string> = {};
        if (!optionForm.data.name_en.trim()) missing.name_en = 'Required';
        if (!optionForm.data.name_fr.trim()) missing.name_fr = 'Required';
        if (!optionForm.data.description_en.trim()) missing.description_en = 'Required';
        if (!optionForm.data.description_fr.trim()) missing.description_fr = 'Required';
        if (!optionForm.data.thumbnail.trim()) missing.thumbnail = 'Required';
        if (!optionForm.data.category_id) missing.category_id = 'Required';

        if (Object.keys(missing).length) {
            Object.entries(missing).forEach(([k, v]) => optionForm.setError(k as any, v));
            return;
        }

        optionForm.post('/admin/options', {
            onSuccess: () => {
                optionForm.reset();
                // refresh categories and options
                refreshCategories();
            },
            // onError handled by form errors from the server; no inline alert shown here
        });
    }

    const [categoryAlert, setCategoryAlert] = useState<{ variant: 'default' | 'destructive'; message: string } | null>(null);

    // local copy of categories used in the option form dropdown; we can refresh this via AJAX
    const [localCategories, setLocalCategories] = useState<any[]>(categories);

    // category is chosen from the left category card; display read-only in the form

    // Apply a data-theme attribute to the root element while this page is mounted so
    // the sidebar and content CSS selectors pick up the 'lookups' gradient reliably.
    useEffect(() => {
        const root = document.documentElement;
        const prev = root.getAttribute('data-theme');
        root.setAttribute('data-theme', 'lookups');
        return () => {
            if (prev) root.setAttribute('data-theme', prev);
            else root.removeAttribute('data-theme');
        };
    }, []);

    useEffect(() => {
        // initialize local categories from server-provided prop
        setLocalCategories(categories);
    }, [categories]);

    async function refreshCategories() {
        try {
            const res = await fetch('/admin/categories', { headers: { Accept: 'application/json' } });
            if (res.ok) {
                const data = await res.json();
                setLocalCategories(data);
            }
        } catch (err) {
            // silently ignore
        }
    }

    function submitCategory(e: any) {
        e.preventDefault();
        // client-side validation
        if (!categoryForm.data.name_en.trim()) { categoryForm.setError('name_en', 'Required'); return; }
        if (!categoryForm.data.name_fr.trim()) { categoryForm.setError('name_fr', 'Required'); return; }

        // Check local categories for an existing match (by name_en or name_fr)
        const exists = localCategories.find(c => c.name_en === categoryForm.data.name_en || c.name_fr === categoryForm.data.name_fr);
        // The server store() will update if a match exists, so we can still POST. But avoid creating exact duplicate via quick check.
        if (exists) {
            // set IDs on the form (optional) and still POST so server updates
            // show a notice that we'll update
            setCategoryAlert({ variant: 'default', message: trans.messages?.category_updating ?? 'Category exists — updating.' });
        }

        categoryForm.post('/admin/categories', {
            onSuccess: () => {
                setCategoryAlert({ variant: 'default', message: trans.messages?.category_added ?? 'Category added successfully.' });
                categoryForm.reset();
                // refresh the dropdowns via ajax
                refreshCategories();
                // close modal if open
                setShowCategoryModal(false);
                setTimeout(() => setCategoryAlert(null), 4000);
            },
            onError: (errors: any) => {
                const msg = errors && Object.values(errors).flat().join(' ') || (trans.messages?.category_failed ?? 'Failed to add category.');
                setCategoryAlert({ variant: 'destructive', message: String(msg) });
                setTimeout(() => setCategoryAlert(null), 6000);
            },
        });
    }

    // context menu handlers
    function onContextMenuCategory(e: React.MouseEvent, catId: number) {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'category', id: catId });
    }

    function onContextMenuOption(e: React.MouseEvent, optId: number, categoryId?: number) {
        e.preventDefault();
        // ensure we remember the category for detach endpoint
        if (categoryId) setSelectedCategoryId(categoryId);
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'option', id: optId });
    }

    async function performDelete() {
        if (!contextMenu) return;
        const { type, id } = contextMenu;
        let url = '';
        if (type === 'category') {
            url = `/admin/categories/${id}`;
        } else {
            // For options, delete the option entity from the database
            url = `/admin/options/${id}`;
        }
        try {
            const res = await fetch(url, { method: 'DELETE', credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' } });
            if (res.ok) {
                // refresh categories and close menu
                await refreshCategories();
                setContextMenu(null);
            } else {
                // show error
                setCategoryAlert({ variant: 'destructive', message: trans.messages?.delete_failed ?? 'Failed to delete.' });
                setTimeout(() => setCategoryAlert(null), 4000);
            }
        } catch (err) {
            setCategoryAlert({ variant: 'destructive', message: trans.messages?.delete_failed ?? 'Failed to delete.' });
            setTimeout(() => setCategoryAlert(null), 4000);
        }
    }

    function populateOption(opt: any, categoryId?: number) {
        // populate the option form for quick editing or review
        optionForm.setData({
            name_en: opt.name_en || '',
            name_fr: opt.name_fr || '',
            description_en: opt.description_en || '',
            description_fr: opt.description_fr || '',
            thumbnail: opt.thumbnail || '',
            category_id: String(categoryId || optionForm.data.category_id || ''),
        });
        setSelectedOptionId(opt.id || null);
        // scroll to option form area (optional)
        const el = document.getElementById('option-form');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans?.options ?? 'Lookups'} />

            <div className="mx-auto w-full max-w-8xl pt-6">
                {flash.error && (
                    <Alert variant="destructive" className="mb-3">
                        <AlertTitle>{trans.error ?? 'Error'}</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-teal-400">
                <div className="mx-auto w-full max-w-8xl pt-8 md:pl-6 lg:pl-8">
                    <div className="grid items-start justify-center grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-x-6 w-full">

                        <div className="md:col-span-2 flex justify-center md:ml-6 lg:ml-8 md:sticky md:top-6">
                            <Card className="w-full max-w-sm border-2 border-gray-200 dark:border-gray-700 shadow-md p-3">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="text-black">{trans.categories ?? 'Categories'}</CardTitle>
                                <div>
                                    <Button onClick={() => { setShowCategoryModal(true); categoryForm.reset(); }} className={`bg-emerald-400 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg ml-2`}>
                                        {trans.actions?.add_category ?? 'Add'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {(localCategories || []).map((cat:any) => (
                                        <li key={cat.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <button
                                                    className={`flex items-center gap-3 w-full text-left py-2 px-2 rounded ${selectedCategoryId === cat.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                                                    onClick={async () => {
                                                        const newExpanded = expandedCategoryId === cat.id ? null : cat.id;
                                                        setExpandedCategoryId(newExpanded);
                                                        setSelectedCategoryId(cat.id);
                                                        // set the option form's category select so the form reflects the chosen category
                                                        optionForm.setData('category_id', String(cat.id));
                                                        // refresh categories to ensure options are up-to-date before showing
                                                        await refreshCategories();
                                                    }}
                                                    onContextMenu={(e) => onContextMenuCategory(e as any, cat.id)}
                                                >
                                                    <span className="flex items-center">
                                                        <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                                                        </svg>
                                                    </span>
                                                    <div className="font-medium">{locale === 'fr' ? cat.name_fr || cat.name_en : cat.name_en}</div>
                                                </button>
                                            </div>
                                            {expandedCategoryId === cat.id && (
                                                <ul className="pl-6 mt-2 space-y-1">
                                                    {(cat.options || []).map((opt:any) => (
                                                        <li key={opt.id} className="cursor-pointer hover:bg-slate-100 rounded px-2 py-1" onClick={() => populateOption(opt, cat.id)} onContextMenu={(e) => onContextMenuOption(e as any, opt.id, cat.id)}>
                                                            <div className="flex items-center justify-start gap-3">
                                                                <span className="flex items-center">
                                                                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                                                                </span>
                                                                <div className="text-sm">{locale === 'fr' ? opt.name_fr || opt.name_en : opt.name_en}</div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-8 flex justify-center">
                            <Card className="relative w-full max-w-5xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition">
                                <CardHeader className="flex items-center gap-4">
                                    {/* Title will display the selected category when applicable; no separate read-only label */}
                                    <CardTitle>
                                        {selectedCategoryId ? (
                                            (() => {
                                                const c = localCategories.find((c:any) => String(c.id) === String(selectedCategoryId));
                                                if (!c) return trans.options ?? 'Options';
                                                return locale === 'fr' ? (c.name_fr || c.name_en) : c.name_en;
                                            })()
                                        ) : (
                                            trans.options ?? 'Options'
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form id="option-form" onSubmit={submitOption} className="space-y-3">
                                        <div>
                                            <Label>{trans.fields?.name_en ?? 'Name (EN)'}</Label>
                                            <Input required className="placeholder:text-black" value={optionForm.data.name_en} onChange={(e:any)=> optionForm.setData('name_en', e.target.value)} placeholder={trans.fields?.name_en ?? 'Name (EN)'} />
                                            {optionForm.errors.name_en && <div className="text-sm text-destructive mt-1">{optionForm.errors.name_en}</div>}
                                        </div>

                                        <div>
                                            <Label>{trans.fields?.name_fr ?? 'Name (FR)'}</Label>
                                            <Input required className="placeholder:text-black" value={optionForm.data.name_fr} onChange={(e:any)=> optionForm.setData('name_fr', e.target.value)} placeholder={trans.fields?.name_fr ?? 'Name (FR)'} />
                                        </div>

                                        <div>
                                            <Label>{trans.fields?.description_en ?? 'Description (EN)'}</Label>
                                            <textarea
                                                required
                                                rows={2}
                                                value={optionForm.data.description_en}
                                                onChange={(e:any)=> optionForm.setData('description_en', e.target.value)}
                                                placeholder={trans.fields?.description_en ?? 'Description (EN)'}
                                                className="border-input placeholder:text-black selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label>{trans.fields?.description_fr ?? 'Description (FR)'}</Label>
                                            <textarea
                                                required
                                                rows={2}
                                                value={optionForm.data.description_fr}
                                                onChange={(e:any)=> optionForm.setData('description_fr', e.target.value)}
                                                placeholder={trans.fields?.description_fr ?? 'Description (FR)'}
                                                className="border-input placeholder:text-black selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <Label>{trans.fields?.thumbnail ?? 'Thumbnail URL'}</Label>
                                            <Input required className="placeholder:text-black" value={optionForm.data.thumbnail} onChange={(e:any)=> optionForm.setData('thumbnail', e.target.value)} placeholder={trans.fields?.thumbnail ?? 'Thumbnail URL'} />
                                        </div>
                                    </form>

                                    {/* submit button placed in normal flow so layout remains responsive */}
                                    <div className="mt-4 flex justify-end">
                                        <Button form="option-form" type="submit" className={`bg-emerald-400 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg`}>
                                            {trans.actions?.add_option ?? 'Add Option'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-1" />

                    </div>
                </div>
            </div>

            {/* Category modal trigger and dialog - placed outside grid */}
            <Dialog open={showCategoryModal} onOpenChange={(open) => setShowCategoryModal(open)}>
                <DialogContent className="sm:max-w-2xl min-h-[220px]">
                    <DialogHeader>
                        <DialogTitle>{trans.actions?.add_category ?? 'Add Category'}</DialogTitle>
                        <DialogDescription className="text-black">{trans.categories_description ?? 'Add a category in both languages'}</DialogDescription>
                    </DialogHeader>

                    <form id="category-form" onSubmit={submitCategory} className="space-y-3">
                        <div>
                            <Label>{trans.fields?.name_en ?? 'Name (EN)'}</Label>
                            <Input required className="placeholder:text-black" value={categoryForm.data.name_en} onChange={(e:any)=> categoryForm.setData('name_en', e.target.value)} placeholder={trans.fields?.name_en ?? 'Name (EN)'} />
                            {categoryForm.errors.name_en && <div className="text-sm text-destructive mt-1">{categoryForm.errors.name_en}</div>}
                        </div>

                        <div>
                            <Label>{trans.fields?.name_fr ?? 'Name (FR)'}</Label>
                            <Input required className="placeholder:text-black" value={categoryForm.data.name_fr} onChange={(e:any)=> categoryForm.setData('name_fr', e.target.value)} placeholder={trans.fields?.name_fr ?? 'Name (FR)'} />
                            {categoryForm.errors.name_fr && <div className="text-sm text-destructive mt-1">{categoryForm.errors.name_fr}</div>}
                        </div>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary" onClick={() => { setShowCategoryModal(false); categoryForm.reset(); }}>Cancel</Button>
                            </DialogClose>

                            <Button asChild>
                                <button
                                    type="submit"
                                    className={`bg-emerald-400 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg`}
                                >
                                    {trans.actions?.add_category ?? 'Add Category'}
                                </button>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Custom context menu for right-click delete */}
            {contextMenu && (
                <div
                    style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 60 }}
                    onClick={() => setContextMenu(null)}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="bg-white dark:bg-gray-800 border rounded shadow-md p-1 w-40">
                        <button className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600" onClick={(e) => { e.stopPropagation(); performDelete(); }}>
                            Delete {contextMenu.type === 'category' ? 'Category' : 'Option'}
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

        </AppLayout>
    );
}
