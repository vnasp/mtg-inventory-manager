'use client';

import { TextInput, Spinner } from 'flowbite-react';
import React, { useEffect, useState } from 'react';

type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
  loading?: boolean;
};

export default function SearchBar({
  onSearch,
  placeholder = 'Buscar...',
  loading = false,
}: Props) {
  const [value, setValue] = useState('');
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    onSearch(debounced.trim());
  }, [debounced, onSearch]);

  return (
    <div className="relative w-full">
      <TextInput
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="text-textDark w-full rounded-lg border bg-white text-sm placeholder:text-stone-400"
        aria-label="Buscar cartas"
      />

      {loading && (
        <span className="absolute inset-y-0 right-3 flex items-center">
          <Spinner aria-label="Loading" size="sm" />
        </span>
      )}
    </div>
  );
}
