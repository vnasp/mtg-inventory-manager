import { Button, Card } from 'flowbite-react';
import { useState } from 'react';
import {
  HiChevronDown,
  HiChevronRight,
  HiUsers,
  HiSparkles,
} from 'react-icons/hi';

type Props = {
  activeSection: 'users' | 'cards-add' | 'cards-inventory' | 'cards-settings';
  setActiveSection: (
    section: 'users' | 'cards-add' | 'cards-inventory' | 'cards-settings'
  ) => void;
};

function BackofficeMenu({ activeSection, setActiveSection }: Props) {
  const [magicCardsExpanded, setMagicCardsExpanded] = useState(true);

  return (
    <aside className="w-1/5 lg:shrink-0">
      <Card className="space-y-2">
        {/* Usuarios */}
        <Button
          color="menu"
          size="lg"
          onClick={() => setActiveSection('users')}
          className={
            activeSection === 'users' ? 'bg-secondary text-white shadow-md' : ''
          }
        >
          <HiUsers className="mr-2 h-5 w-5" />
          Usuarios
        </Button>

        {/* Cartas Magic */}
        <div className="space-y-1">
          <Button
            color="menu"
            size="lg"
            onClick={() => setMagicCardsExpanded(!magicCardsExpanded)}
            className="w-full justify-between"
          >
            <span className="flex items-center">
              <HiSparkles className="mr-2 h-5 w-5" />
              Cartas Magic
            </span>
            {magicCardsExpanded ? (
              <HiChevronDown className="h-5 w-5" />
            ) : (
              <HiChevronRight className="h-5 w-5" />
            )}
          </Button>

          {magicCardsExpanded && (
            <div className="ml-4 space-y-1 border-l-2 border-stone-300 pl-2">
              <Button
                color="menu"
                size="md"
                onClick={() => setActiveSection('cards-add')}
                className={
                  activeSection === 'cards-add'
                    ? 'bg-secondary text-white shadow-md'
                    : ''
                }
              >
                Agregar
              </Button>
              <Button
                color="menu"
                size="md"
                onClick={() => setActiveSection('cards-inventory')}
                className={
                  activeSection === 'cards-inventory'
                    ? 'bg-secondary text-white shadow-md'
                    : ''
                }
              >
                Inventario
              </Button>
              <Button
                color="menu"
                size="md"
                onClick={() => setActiveSection('cards-settings')}
                className={
                  activeSection === 'cards-settings'
                    ? 'bg-secondary text-white shadow-md'
                    : ''
                }
              >
                Configuración
              </Button>
            </div>
          )}
        </div>
      </Card>
    </aside>
  );
}

export default BackofficeMenu;
