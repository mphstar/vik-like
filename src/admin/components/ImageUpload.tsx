import { useRef } from 'react';

type Props = {
  value?: string;
  onChange: (dataUrl?: string) => void;
  accept?: string;
  className?: string;
  previewClassName?: string;
  allowReplace?: boolean;
  allowRemove?: boolean;
  variant?: 'default' | 'tile';
};

export default function ImageUpload({ value, onChange, accept = 'image/*', className = '', previewClassName = 'h-28', allowReplace = true, allowRemove = true, variant = 'default' }: Props){
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pick = () => inputRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : undefined;
      onChange(result);
    };
    reader.readAsDataURL(file);
    // reset value so picking same file again re-triggers
    e.target.value = '';
  };

  if (variant === 'tile') {
    return (
      <div className={`relative overflow-hidden rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 ${className}`}>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} />
        {value ? (
          <div className="group relative">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img src={value} alt="preview" className="h-full w-full object-cover" />
            </div>
            {(allowReplace || allowRemove) && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {allowReplace && (
                  <button type="button" onClick={pick} className="pointer-events-auto rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/70">Ganti</button>
                )}
                {allowRemove && (
                  <button type="button" onClick={()=>onChange(undefined)} className="pointer-events-auto rounded-md bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-600">Hapus</button>
                )}
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={pick} className="flex aspect-[4/3] w-full items-center justify-center gap-2 text-sm text-neutral-500">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-neutral-300 dark:border-neutral-700">+
            </span>
            Upload
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent ${className}`}>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} />
      {value ? (
        <div className="p-2 flex items-center gap-3">
          <img src={value} alt="preview" className={`rounded-md object-cover ring-1 ring-inset ring-neutral-200/60 dark:ring-neutral-800/60 ${previewClassName}`} />
          <div className="ml-auto flex gap-2">
            {allowReplace && (
              <button type="button" onClick={pick} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Ganti</button>
            )}
            {allowRemove && (
              <button type="button" onClick={()=>onChange(undefined)} className="rounded-md border border-red-300 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50 dark:border-red-700/60 dark:hover:bg-red-900/30">Hapus</button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3">
          <button type="button" onClick={pick} className="w-full rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-6 text-sm text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800">Pilih Gambar</button>
        </div>
      )}
    </div>
  );
}
