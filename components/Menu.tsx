'use client';

import { useState } from 'react';
import { HiOutlineCalendar, HiOutlineRectangleStack } from 'react-icons/hi2';
import { HiOutlineCube, HiOutlineSparkles } from 'react-icons/hi';
import { HiMenu, HiX } from 'react-icons/hi';

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: 'Catálogo de Cartas',
      icon: HiOutlineSparkles,
      href: '#',
      active: true,
    },
    {
      label: 'Sobres Sellados',
      icon: HiOutlineRectangleStack,
      href: 'https://www.vudugaming.cl/tcg/magic-the-gathering',
      active: false,
    },
    {
      label: 'Juegos de Mesa',
      icon: HiOutlineCube,
      href: 'https://www.vudugaming.cl/',
      active: false,
    },
    {
      label: 'Eventos',
      icon: HiOutlineCalendar,
      href: 'https://www.vudugaming.cl/eventos',
      active: false,
    },
  ];

  return (
    <>
      {/* Menú Desktop */}
      <nav className="hidden items-center justify-center gap-6 md:flex">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          if (item.active) {
            return (
              <span
                key={index}
                className="flex items-center gap-2 rounded-b-lg border-t-0 border-b-2 border-purple-600 px-4 py-2 text-sm font-semibold text-purple-600"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </span>
            );
          }
          return (
            <a
              key={index}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Botón Hamburguesa Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700 md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
      </button>

      {/* Menú Mobile - Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 z-40 border-b border-gray-200 bg-white shadow-lg md:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              if (item.active) {
                return (
                  <span
                    key={index}
                    className="flex items-center gap-3 border-l-4 border-purple-600 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-600"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </span>
                );
              }
              return (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
