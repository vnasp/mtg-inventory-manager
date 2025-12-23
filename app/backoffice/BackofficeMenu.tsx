import { Button, Card } from 'flowbite-react';
import { useState } from 'react';
import {
  HiChevronDown,
  HiChevronRight,
  HiUsers,
  HiSparkles,
  HiCog,
} from 'react-icons/hi';
import { SiPokemon } from 'react-icons/si';

type Props = {
  activeSection:
    | 'users'
    | 'mtg-add'
    | 'mtg-inventory'
    | 'mtg-settings'
    | 'pokemon-add'
    | 'pokemon-inventory'
    | 'pokemon-settings'
    | 'global-settings';
  setActiveSection: (
    section:
      | 'users'
      | 'mtg-add'
      | 'mtg-inventory'
      | 'mtg-settings'
      | 'pokemon-add'
      | 'pokemon-inventory'
      | 'pokemon-settings'
      | 'global-settings'
  ) => void;
};

function BackofficeMenu({ activeSection, setActiveSection }: Props) {
  const [mtgExpanded, setMtgExpanded] = useState(true);
  const [pokemonExpanded, setPokemonExpanded] = useState(false);

  return (
    <aside className="w-64 shrink-0">
      <nav className="space-y-1">
        {/* Usuarios */}
        <button
          onClick={() => setActiveSection('users')}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
            activeSection === 'users'
              ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <HiUsers className="h-5 w-5" />
          Usuarios
        </button>

        {/* Cartas Magic */}
        <div className="space-y-1">
          <button
            onClick={() => setMtgExpanded(!mtgExpanded)}
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
          >
            <span className="flex items-center gap-3">
              <HiSparkles className="h-5 w-5" />
              Magic: The Gathering
            </span>
            {mtgExpanded ? (
              <HiChevronDown className="h-4 w-4" />
            ) : (
              <HiChevronRight className="h-4 w-4" />
            )}
          </button>

          {mtgExpanded && (
            <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-4">
              <button
                onClick={() => setActiveSection('mtg-add')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'mtg-add'
                    ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Agregar
              </button>
              <button
                onClick={() => setActiveSection('mtg-inventory')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'mtg-inventory'
                    ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Inventario
              </button>
              <button
                onClick={() => setActiveSection('mtg-settings')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'mtg-settings'
                    ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Configuración
              </button>
            </div>
          )}
        </div>

        {/* Cartas Pokemon */}
        <div className="space-y-1">
          <button
            onClick={() => setPokemonExpanded(!pokemonExpanded)}
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
          >
            <span className="flex items-center gap-3">
              <SiPokemon className="h-5 w-5" />
              Pokémon TCG
            </span>
            {pokemonExpanded ? (
              <HiChevronDown className="h-4 w-4" />
            ) : (
              <HiChevronRight className="h-4 w-4" />
            )}
          </button>

          {pokemonExpanded && (
            <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-4">
              <button
                onClick={() => setActiveSection('pokemon-add')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'pokemon-add'
                    ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Agregar
              </button>
              <button
                onClick={() => setActiveSection('pokemon-inventory')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'pokemon-inventory'
                    ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Inventario
              </button>
              <button
                onClick={() => setActiveSection('pokemon-settings')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'pokemon-settings'
                    ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Configuración
              </button>
            </div>
          )}
        </div>

        {/* Configuración Global */}
        <button
          onClick={() => setActiveSection('global-settings')}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
            activeSection === 'global-settings'
              ? 'bg-bo-primary hover:bg-bo-primary-hover text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <HiCog className="h-5 w-5" />
          Configuración Global
        </button>
      </nav>
    </aside>
  );
}

export default BackofficeMenu;
