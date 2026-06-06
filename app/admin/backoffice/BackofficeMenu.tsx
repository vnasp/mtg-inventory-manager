import { useState } from 'react';
import { HiChevronDown, HiChevronRight, HiUsers, HiSparkles } from 'react-icons/hi';

type Section = 'users' | 'mtg-add' | 'mtg-inventory' | 'mtg-settings';

type Props = {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
};

function BackofficeMenu({ activeSection, setActiveSection }: Props) {
  const [mtgExpanded, setMtgExpanded] = useState(true);

  return (
    <aside className="w-64 shrink-0">
      <nav className="space-y-1">
        {/* Usuarios */}
        <button
          onClick={() => setActiveSection('users')}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
            activeSection === 'users'
              ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md'
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
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Agregar
              </button>
              <button
                onClick={() => setActiveSection('mtg-inventory')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'mtg-inventory'
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Inventario
              </button>
              <button
                onClick={() => setActiveSection('mtg-settings')}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  activeSection === 'mtg-settings'
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Configuración
              </button>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export default BackofficeMenu;
