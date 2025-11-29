import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-linear-to-br from-gray-900 to-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Logo y descripción */}
          <div>
            <Image
              src="/assets/img/logo.png"
              width={180}
              height={80}
              alt="VuduGaming Logo"
              className="mb-4 h-16 w-auto"
            />
            <p className="mb-3 text-sm text-gray-400">
              Tienda de cartas coleccionables TCG en Chile. Cartas Magic: The
              Gathering (MTG), Pokémon TCG y más juegos de mesa. Cartas sueltas,
              selladas y accesorios en Santiago.
            </p>
            <a
              href="https://www.vudugaming.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Ir a VuduGaming Juegos de Mesa</span>
            </a>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:vudugaming.cl@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  vudugaming.cl@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+56989127453"
                  className="transition-colors hover:text-white"
                >
                  +56 9 8912 7453
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p>Avenida Providencia 1108, Local 16</p>
                  <p>Galeria Veneto</p>
                  <p>Providencia, Región Metropolitana</p>
                  <p>Chile</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Ubicación - Mapa */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Ubicación</h3>
            <div className="overflow-hidden rounded-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.8406753939834!2d-70.61493262346724!3d-33.42541389633178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf5c53c82b65%3A0x5b1a3b8b0b8b8b8b!2sAv.%20Providencia%201108%2C%20Providencia%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1732894000000!5m2!1ses!2scl"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación VuduGaming"
              ></iframe>
            </div>
            <a
              href="https://maps.app.goo.gl/Vh6ufyt4RgmxpPH1A"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-purple-400 transition-colors hover:text-purple-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Ver en Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-2 text-sm text-gray-500 md:flex-row">
            <p>© {new Date().getFullYear()} VuduGaming SpA</p>
            <p className="text-xs">Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
