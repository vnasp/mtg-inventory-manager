'use client';
import { useState } from 'react';
import CardSearch from './CardSearch';
import CardInventory from './CardInventory';
import Settings from './Settings';
import Users from './Users';
import BackofficeMenu from './BackofficeMenu';

export default function BackofficeContent() {
  const [activeSection, setActiveSection] = useState<
    'users' | 'cards-add' | 'cards-inventory' | 'cards-settings'
  >('users');

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="border-r border-slate-200 bg-white p-6">
        <BackofficeMenu
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        {activeSection === 'users' && <Users />}
        {activeSection === 'cards-add' && <CardSearch />}
        {activeSection === 'cards-inventory' && <CardInventory />}
        {activeSection === 'cards-settings' && <Settings />}
      </main>
    </div>
  );
}
