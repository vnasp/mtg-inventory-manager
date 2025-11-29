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
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <TextInput
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-gray-300 bg-gray-50 pl-10 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        aria-label="Buscar cartas"
      />

      {loading && (
        <span className="absolute inset-y-0 right-3 flex items-center">
          <Spinner aria-label="Loading" size="sm" color="purple" />
        </span>
      )}
    </div>
  );
}
