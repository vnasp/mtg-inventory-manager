'use client';

import { useEffect, useRef, useState } from 'react';

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownSizing = 'sm' | 'md' | 'lg';
type DropdownVariant = 'dark' | 'light';

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  sizing?: DropdownSizing;
  variant?: DropdownVariant;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const sizingMap: Record<DropdownSizing, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const variantStyles = {
  dark: {
    trigger: 'border-white/20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm',
    panel: 'border-white/10 bg-zinc-900/95 backdrop-blur-sm',
    option: 'text-white/80 hover:bg-white/10',
    optionActive: 'bg-white/10 font-medium text-amber-300',
    chevron: 'text-white/60',
  },
  light: {
    trigger: 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50',
    panel: 'border-zinc-200 bg-white shadow-lg',
    option: 'text-zinc-700 hover:bg-zinc-50',
    optionActive: 'bg-zinc-100 font-medium text-zinc-900',
    chevron: 'text-zinc-400',
  },
};

export function Dropdown({
  options,
  value,
  onChange,
  sizing = 'md',
  variant = 'dark',
  className = '',
  id,
  disabled,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`} id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizingMap[sizing]} ${styles.trigger}`}
      >
        <span className="truncate">{selected?.label ?? '—'}</span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${styles.chevron} ${open ? 'rotate-180' : ''}`}
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className={`absolute z-50 mt-1 max-h-60 w-full min-w-max overflow-auto rounded-lg border py-1 shadow-xl ${styles.panel}`}>
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${opt.value === value ? styles.optionActive : styles.option}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
