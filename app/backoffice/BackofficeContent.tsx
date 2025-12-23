'use client';
import { useState } from 'react';
import CardSearch from './CardSearch';
import CardInventory from './CardInventory';
import Settings from './Settings';
import PokemonSettings from './PokemonSettings';
import GlobalSettings from './GlobalSettings';
import Users from './Users';
import BackofficeMenu from './BackofficeMenu';

export default function BackofficeContent() {
  const [activeSection, setActiveSection] = useState<
    | 'users'
    | 'mtg-add'
    | 'mtg-inventory'
    | 'mtg-settings'
    | 'pokemon-add'
    | 'pokemon-inventory'
    | 'pokemon-settings'
    | 'global-settings'
  >('users');

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
        {activeSection === 'pokemon-add' && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-slate-600">
              Funcionalidad de agregar cartas Pokémon próximamente...
            </p>
          </div>
        )}
        {activeSection === 'pokemon-inventory' && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-slate-600">
              Inventario de cartas Pokémon próximamente...
            </p>
          </div>
        )}
        {activeSection === 'pokemon-settings' && <PokemonSettings />}
        {activeSection === 'global-settings' && <GlobalSettings />}
      </main>
    </div>
  );
}
