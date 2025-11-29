import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center justify-between gap-3">
            <Image
              src="/assets/img/logo.png"
              width={220}
              height={90}
              alt="VuduGaming Logo"
              className="h-16 w-auto lg:h-20"
              priority
            />
          </div>

          {/* Título y enlace a tienda */}
          <div className="flex flex-col items-end justify-center">
            <h1 className="text-center text-2xl font-bold text-gray-800 lg:text-3xl">
              Catálogo de Cartas
            </h1>

            <div className="text-xs">
              <a
                href="https://www.vudugaming.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 transition-colors hover:text-purple-700"
              >
                <span>Ir a VuduGaming Juegos de Mesa</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
