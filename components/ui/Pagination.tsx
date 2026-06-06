'use client';
import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showIcons?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showIcons = false,
  previousLabel = 'Anterior',
  nextLabel = 'Siguiente',
  className = '',
}: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase =
    'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400';

  return (
    <nav
      className={`flex items-center gap-1 ${className}`}
      aria-label="Paginación"
    >
      <button
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        disabled={!canPrev}
        className={`${btnBase} ${canPrev ? 'text-zinc-700 hover:bg-zinc-100' : 'cursor-not-allowed text-zinc-300'}`}
        aria-label={previousLabel}
      >
        {showIcons && <HiChevronLeft className="h-4 w-4" />}
        <span className={showIcons ? 'sr-only' : ''}>{previousLabel}</span>
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-zinc-400 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`${btnBase} min-w-8 ${
              page === currentPage
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => canNext && onPageChange(currentPage + 1)}
        disabled={!canNext}
        className={`${btnBase} ${canNext ? 'text-zinc-700 hover:bg-zinc-100' : 'cursor-not-allowed text-zinc-300'}`}
        aria-label={nextLabel}
      >
        <span className={showIcons ? 'sr-only' : ''}>{nextLabel}</span>
        {showIcons && <HiChevronRight className="h-4 w-4" />}
      </button>
    </nav>
  );
}
