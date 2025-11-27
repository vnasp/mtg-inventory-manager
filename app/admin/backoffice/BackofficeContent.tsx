'use client';
import { useState } from 'react';
import CardSearch from './CardSearch';
import CardInventory from './CardInventory';
import Settings from './Settings';
import BackofficeMenu from './BackofficeMenu';

export default function BackofficeContent() {
  const [activeSection, setActiveSection] = useState<
    'add' | 'inventory' | 'settings'
  >('add');

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row">
      <BackofficeMenu
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1">
        {activeSection === 'add' && <CardSearch />}
        {activeSection === 'inventory' && <CardInventory />}
        {activeSection === 'settings' && <Settings />}
      </div>
    </div>
  );
}
