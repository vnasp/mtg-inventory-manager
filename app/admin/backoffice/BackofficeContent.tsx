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
    <div className="flex w-full flex-col gap-6 lg:flex-row">
      <BackofficeMenu
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1">
        {activeSection === 'users' && <Users />}
        {activeSection === 'cards-add' && <CardSearch />}
        {activeSection === 'cards-inventory' && <CardInventory />}
        {activeSection === 'cards-settings' && <Settings />}
      </div>
    </div>
  );
}
