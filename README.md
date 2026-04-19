# Card Catalog - Inventario de Cartas Magic

Plataforma web para gestionar inventario de cartas Magic: The Gathering con frontoffice de catálogo público y backoffice de administración. Permite importar cartas desde CSV (ManaBox), obtener precios de múltiples fuentes (Scryfall, MTGJson, CardKingdom) y hacer match automático para mostrar precios actualizados.

> Nota: Requiere configurar Supabase para funcionar localmente. Los precios se actualizan automáticamente vía GitHub Actions.

## Funcionalidades

- Catálogo público con búsqueda y filtros de cartas
- Modal de detalle de carta con precios e información
- Backoffice con gestión de inventario completa
- Importación masiva de cartas desde CSV (ManaBox export)
- Match automático con Scryfall y MTGJson para identificadores
- Actualización semanal de precios de CardKingdom vía GitHub Actions
- Markup configurable por carta o en bulk
- Panel de configuración global y gestión de usuarios
- Autenticación con Supabase Auth

## Tecnologías

- Next.js 16 (App Router)
- React 19
- TypeScript
- Supabase (Auth, Database)
- Tailwind CSS
- Flowbite React
- PapaParse (CSV parsing)
- Scryfall API / MTGJson API
- GitHub Actions (cron de precios)

## Estructura del Proyecto

```
cardcatalog-nextjs-supabase/
├── app/
│   ├── page.tsx              # Catálogo público
│   ├── login/                # Autenticación
│   ├── admin/
│   │   ├── backoffice/       # Panel de administración
│   │   └── page.tsx          # Login admin
│   └── api/
│       ├── cards/            # CRUD de cartas
│       ├── import-manabox/   # Importación CSV
│       ├── scryfall/         # Integración Scryfall
│       ├── mtgjson/          # Integración MTGJson
│       ├── cardkingdom-prices/ # Precios CardKingdom
│       └── settings/         # Configuración global
├── components/               # UI components
├── scripts/                  # Script de actualización de precios
├── sql/                      # Migraciones SQL
└── .github/workflows/        # GitHub Actions (precio semanal)
```
