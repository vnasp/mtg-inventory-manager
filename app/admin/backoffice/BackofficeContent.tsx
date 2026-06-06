'use client';
import { useState } from 'react';
import CardSearch from './CardSearch';
import CardInventory from './CardInventory';
import Settings from './Settings';
import Users from './Users';
import BackofficeMenu from './BackofficeMenu';

type Section = 'users' | 'mtg-add' | 'mtg-inventory' | 'mtg-settings';

export default function BackofficeContent() {
  const [activeSection, setActiveSection] = useState<Section>('users');

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="overflow-y-auto border-r border-slate-200 bg-white p-6">
        <BackofficeMenu
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeSection === 'users' && <Users />}
        {activeSection === 'mtg-add' && <CardSearch />}
        {activeSection === 'mtg-inventory' && <CardInventory />}
        {activeSection === 'mtg-settings' && <Settings />}
      </main>
    </div>
  );
}
