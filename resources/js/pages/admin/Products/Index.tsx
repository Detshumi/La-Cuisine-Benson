import React, { useState } from 'react';
import { usePage, useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ImageUploader from '@/components/ImageUploader';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const breadcrumbs = [
    { title: 'Meals', href: '/admin/products' },
];

interface ProductFormData {
    name_en: string;
    name_fr?: string;
    description_en?: string;
    description_fr?: string;
    thumbnail?: string;
    options: string[];
    categories: string[];
}

export default function Index() {
    const { props } = usePage();
    const { products = [], categories = [] } = props as any;

    const productForm = useForm<ProductFormData>({ name_en: '', name_fr: '', description_en: '', description_fr: '', thumbnail: '', options: [], categories: [] });
    const [alert, setAlert] = useState(null as any);

    function submitProduct(e:any) {
        e.preventDefault();
        productForm.post('/admin/products', {
            onSuccess: () => {
                setAlert({ variant: 'default', message: 'Product added' });
                productForm.reset();
                setTimeout(() => setAlert(null), 3000);
            },
            onError: (errors:any) => {
                setAlert({ variant: 'destructive', message: Object.values(errors).flat().join(' ') });
                setTimeout(() => setAlert(null), 5000);
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meals" />
            <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-teal-400">
                <div className="mx-auto w-full max-w-4xl flex justify-center pt-8">
                    <div className="grid place-items-start grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-24 w-full">
                        <Card className="relative w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Meals</CardTitle>
                                <CardDescription>Manage meals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="product-form" onSubmit={submitProduct} className="space-y-3">
                                    <div>
                                        <Label>Name (EN)</Label>
                                        <Input value={productForm.data.name_en} onChange={(e:any)=> productForm.setData('name_en', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Name (FR)</Label>
                                        <Input value={productForm.data.name_fr} onChange={(e:any)=> productForm.setData('name_fr', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Description (EN)</Label>
                                        <Input value={productForm.data.description_en} onChange={(e:any)=> productForm.setData('description_en', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Description (FR)</Label>
                                        <Input value={productForm.data.description_fr} onChange={(e:any)=> productForm.setData('description_fr', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Thumbnail</Label>
                                        <ImageUploader value={productForm.data.thumbnail} onChange={(url)=> productForm.setData('thumbnail', url)} />
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <select className="w-full rounded border p-2" value={productForm.data.categories[0] || ''} onChange={(e:any)=> {
                                            const val = e.target.value;
                                            productForm.setData('categories', val ? [val] : []);
                                            // clear options when category changes
                                            productForm.setData('options', []);
                                        }}>
                                            <option value="">-- select a category --</option>
                                            {categories.map((cat:any)=> (
                                                <option key={cat.id} value={String(cat.id)}>{cat.name_en} {cat.name_fr ? ` — ${cat.name_fr}` : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Options (for selected category — hold Ctrl / Cmd to multi-select)</Label>
                                        {(() => {
                                            const selectedCatId = productForm.data.categories[0];
                                            const selectedCategory = categories.find((c:any) => String(c.id) === String(selectedCatId));
                                            const opts = selectedCategory?.options || [];
                                            return (
                                                <select multiple className="w-full rounded border p-2" value={productForm.data.options} onChange={(e:any)=> {
                                                    const vals = Array.from(e.target.selectedOptions).map((o:any)=> o.value);
                                                    productForm.setData('options', vals);
                                                }}>
                                                    {opts.length === 0 ? (
                                                        <option disabled value="">No options for selected category</option>
                                                    ) : (
                                                        opts.map((opt:any)=> (
                                                            <option key={opt.id} value={String(opt.id)}>{opt.name_en} {opt.name_fr ? ` — ${opt.name_fr}` : ''}</option>
                                                        ))
                                                    )}
                                                </select>
                                            );
                                        })()}
                                    </div>
                                </form>

                                <div className="mt-4 flex justify-end">
                                    <Button form="product-form" type="submit" className="bg-emerald-400 text-white hover:bg-emerald-500">Add Meal</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative w-full max-w-sm">
                            <CardHeader>
                                <CardTitle>Meals</CardTitle>
                                <CardDescription>Existing meals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {products.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No products</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {products.map((p:any) => (
                                            <li key={p.id} className="flex items-center justify-between border px-3 py-2 rounded">
                                                <div>
                                                    <div className="font-medium">{p.name_en} — ${p.price}</div>
                                                    <div className="text-sm text-muted-foreground">{p.name_fr}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
