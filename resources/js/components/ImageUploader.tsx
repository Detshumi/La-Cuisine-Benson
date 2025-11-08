import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Props {
    value?: string;
    onChange?: (url: string) => void;
    accept?: string;
    // optional callback to remove the image on the server (when editing existing entity)
    onRemoveServer?: () => Promise<void>;
}

export default function ImageUploader({ value = '', onChange, accept = 'image/*', onRemoveServer }: Props) {
    const [preview, setPreview] = useState<string>(value);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // helper: downscale image to max 1600px and return a File
    async function downscale(file: File, maxSize = 1600) {
        return new Promise<File>((resolve) => {
            const img = document.createElement('img');
            const url = URL.createObjectURL(file);
            img.onload = () => {
                let { width, height } = img;
                let scale = 1;
                if (width > maxSize || height > maxSize) {
                    scale = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name, { type: blob.type });
                        resolve(newFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.85);
                URL.revokeObjectURL(url);
            };
            img.onerror = () => resolve(file);
            img.src = url;
        });
    }

    async function uploadFile(file: File) {
        setError(null);
        // show immediate client-side preview
        try {
            const localUrl = URL.createObjectURL(file);
            setPreview(localUrl);
            // open preview modal so user sees the image immediately
            setOpen(true);
        } catch (e) {
            // ignore
        }

        setUploading(true);
        setProgress(0);

        const resized = await downscale(file);

        const form = new FormData();
        form.append('image', resized);

        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/admin/uploads/image', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': token },
                body: form,
            });
            if (res.ok) {
                const data = await res.json();
                // server returns url and thumb
                setPreview(data.thumb || data.url);
                if (onChange) onChange(data.url);
            } else {
                const text = await res.text();
                setError('Upload failed: ' + res.status + ' ' + text);
                console.error('Upload failed', res.status, text);
            }
        } catch (err:any) {
            setError('Upload error');
            console.error(err);
        }

        setUploading(false);
        setProgress(100);
    }

    // keep internal preview in sync with controlled `value` prop
    React.useEffect(() => {
        // when parent clears the value ('' or null), remove preview and close modal
        if (!value) {
            setPreview('');
            setOpen(false);
            setError(null);
            setStatusMessage(null);
        } else {
            // update preview when value prop changes to a URL
            setPreview(value);
        }
    }, [value]);

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        console.log('ImageUploader: onDrop', e.dataTransfer.files.length);
        setStatusMessage('File dropped');
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) uploadFile(f);
    }

    function onDragOver(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(true);
    }

    function onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
    }

    function onChoose() {
        console.log('ImageUploader: onChoose');
        setStatusMessage('Opening file chooser');
        inputRef.current?.click();
    }

    return (
        <div>
            {!preview && (
                <>
                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={`border-dashed border-2 p-3 sm:p-4 md:p-6 rounded cursor-pointer flex items-center justify-between ${dragOver ? 'bg-slate-50' : ''}`}
                        onClick={onChoose}
                    >
                        <div>
                            <div className="text-sm font-medium">Drop an image here or click to choose</div>
                            <div className="text-xs text-muted-foreground">Accepted: {accept}</div>
                        </div>
                        <div>
                            <Button type="button">Choose</Button>
                        </div>
                    </div>

                    <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e)=> { const f = e.target.files && e.target.files[0]; if (f) uploadFile(f); }} />
                </>
            )}

            {preview && (
                <div className="mt-3 flex items-center gap-3">
                    <img
                        src={preview}
                        alt="preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded cursor-pointer"
                        onClick={() => setOpen(true)}
                        onError={() => {
                            // image not found on server or broken — clear preview so UI doesn't show stale image
                            setStatusMessage('Image file could not be loaded');
                            setPreview('');
                        }}
                    />
                    <div className="flex-1">
                        <div className="text-sm">Preview</div>
                        {uploading && <div className="text-xs mt-1">Uploading... {progress}%</div>}
                        {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" onClick={() => {
                            // open confirmation dialog before removing
                            setConfirmOpen(true);
                        }}>Remove</Button>
                    </div>
                </div>
            )}
            {statusMessage && <div className="text-xs text-muted-foreground mt-2">{statusMessage}</div>}
            {uploading && <div className="w-full bg-gray-200 h-1 rounded mt-2"><div className="bg-emerald-400 h-1 rounded" style={{ width: `${progress}%` }} /></div>}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Image preview</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {preview ? <img src={preview} className="w-full h-auto" /> : <div>No image</div>}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm removal dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove image?</DialogTitle>
                        <DialogDescription className="text-slate-800 dark:text-slate-100 font-medium">Are you sure you want to remove this image? This will delete the file from the server and clear the form value.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={async () => {
                            // perform server-side removal if callback provided
                            if (onRemoveServer) {
                                try {
                                    await onRemoveServer();
                                    setStatusMessage('Image removed from server');
                                } catch (e) {
                                    setStatusMessage('Failed to remove image from server');
                                }
                            }
                            // clear the preview locally and notify parent to clear the form value
                            setPreview('');
                            setOpen(false);
                            setError(null);
                            setStatusMessage('Image removed');
                            if (onChange) onChange('');
                            setConfirmOpen(false);
                        }}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
