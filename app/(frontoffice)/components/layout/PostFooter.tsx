import Link from 'next/link';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

export default function PostFooter() {
  return (
    <div className="bg-slate-900 py-2 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-2 text-xs md:flex-row">
          <div className="flex items-center gap-2">
            <span>
              © {new Date().getFullYear()} VuduGaming SpA - Todos los derechos
              reservados
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Creado con ♥ por</span>
            <Link
              href="https://www.valentinamunoz.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label="Visita el sitio web de Valentina Muñoz"
            >
              Vnasp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
