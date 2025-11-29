import Image from 'next/image';
import Menu from './Menu';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo a la izquierda */}
          <div>
            <Image
              src="/assets/img/logo.png"
              width={220}
              height={90}
              alt="VuduGaming Logo"
              className="w-auto max-lg:h-16 lg:h-24"
              priority
            />
          </div>

          {/* Menú a la derecha */}
          <Menu />
        </div>
      </div>
    </header>
  );
}
