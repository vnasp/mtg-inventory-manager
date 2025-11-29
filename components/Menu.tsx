import { HiOutlineCalendar, HiOutlineRectangleStack } from 'react-icons/hi2';
import { HiOutlineCube, HiOutlineSparkles } from 'react-icons/hi';

export default function Menu() {
  return (
    <div className="mt-2 flex items-center justify-center gap-6 pt-2">
      <span className="flex items-center gap-2 rounded-b-lg border-t-0 border-b-2 border-purple-600 px-4 py-2 text-sm font-semibold text-purple-600">
        <HiOutlineSparkles className="h-5 w-5" />
        <span>Catálogo de Cartas</span>
      </span>

      <a
        href="https://www.vudugaming.cl/tcg/magic-the-gathering"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700"
      >
        <HiOutlineRectangleStack className="h-5 w-5" />
        <span>Sobres Sellados</span>
      </a>
      <a
        href="https://www.vudugaming.cl/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700"
      >
        <HiOutlineCube className="h-5 w-5" />
        <span>Juegos de Mesa</span>
      </a>
      <a
        href="https://www.vudugaming.cl/eventos"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700"
      >
        <HiOutlineCalendar className="h-5 w-5" />
        <span>Eventos</span>
      </a>
    </div>
  );
}
