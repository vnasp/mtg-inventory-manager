import { Button, Card } from 'flowbite-react';
import { useState } from 'react';

type Props = {
  activeSection: 'add' | 'inventory' | 'settings';
  setActiveSection: (section: 'add' | 'inventory' | 'settings') => void;
};

function BackofficeMenu({ activeSection, setActiveSection }: Props) {
  return (
    <aside>
      <Card className="space-y-4">
        <Button
          color="menu"
          size="lg"
          onClick={() => setActiveSection('add')}
          className={
            activeSection === 'add' ? 'bg-secondary text-white shadow-md' : ''
          }
        >
          Agregar Carta
        </Button>
        <Button
          color="menu"
          size="lg"
          onClick={() => setActiveSection('inventory')}
          className={
            activeSection === 'inventory'
              ? 'bg-secondary text-white shadow-md'
              : ''
          }
        >
          Inventario
        </Button>
        <Button
          color="menu"
          size="lg"
          onClick={() => setActiveSection('settings')}
          className={
            activeSection === 'settings'
              ? 'bg-secondary text-white shadow-md'
              : ''
          }
        >
          Configuración
        </Button>
      </Card>
    </aside>
  );
}

export default BackofficeMenu;
