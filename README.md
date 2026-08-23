# Handly - Platform de Gestión de Necesidades Comunitarias con IA

> Una plataforma moderna que conecta necesidades comunitarias con donantes, potenciada con inteligencia artificial para simplificar el proceso de recolección y gestión de recursos.

## 🎯 Visión

Handly resuelve el problema real de las organizaciones comunitarias: **gestionar de manera eficiente las necesidades de las comunidades y conectarlas con donantes dispuestos a ayudar**. En lugar de procesos manuales complejos y lentos, ofrecemos una plataforma inteligente que:

- Automatiza la documentación de necesidades usando IA
- Facilita la conexión entre organizaciones y donantes
- Proporciona seguimiento y reportes en tiempo real
- Acelera el proceso de recaudación de fondos para causas específicas

## ✨ Características Principales

### 🤖 Asistente IA Inteligente
- **Generación automática de necesidades** basada en descripciones en lenguaje natural
- Categorización y validación automática de items
- Sugerencias inteligentes basadas en contexto
- Chat interactivo para refinamiento de necesidades

### 💼 Gestión de Organización
- Sistema multi-usuario con roles y permisos
- Invitación de miembros del equipo
- Gestión de perfiles de organización
- Autenticación segura con OAuth

### 🎁 Sistema de Necesidades
- Crear y gestionar catálogos de necesidades
- Organización por campañas
- Filtros avanzados y búsqueda
- Vistas personalizables (tabla, grid, mapa)
- Importancia y urgencia configurables

### 💰 Gestión de Donaciones
- Pledges (promesas de donación)
- Donaciones directas
- Verificación de donantes
- Recibos automáticos
- Integración con sistemas de pago

### 📊 Análisis y Reportes
- Dashboard en tiempo real
- Tracking de progreso de campañas
- Métricas de urgencia
- Exportación de datos

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 14+** - Framework React con SSR/SSG
- **React 18** - UI moderna con Hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes accesibles

### Backend
- **Next.js API Routes** - Backend serverless
- **Server Actions** - Operaciones seguras del lado del servidor
- **TypeScript** - Type-safe backend

### Base de Datos & Auth
- **Supabase** - PostgreSQL administrado
- **Supabase Auth** - Autenticación robusta
- **Supabase RLS** - Seguridad a nivel de fila

### IA & Automation
- **Anthropic Claude API** - Procesamiento de lenguaje natural
- **Prompt Engineering** - Optimización de instrucciones
- **Tool Use** - Acciones automatizadas con IA

### DevOps & CI/CD
- **GitHub Actions** - Automatización de tests y deploy
- **Dependabot** - Gestión de dependencias
- **Docker** - Containerización (opcional)

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Variables de entorno configuradas

### Instalación

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd handly

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# 4. Preparar base de datos
npm run db:setup
npm run db:seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic Claude
ANTHROPIC_API_KEY=

# OAuth (opcional)
GITHUB_ID=
GITHUB_SECRET=

# Webhooks
MAKE_WEBHOOK_URL=
```

## 📁 Estructura del Proyecto

```
handly/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── auth/                     # Rutas de autenticación
│   ├── campaign/                 # Página de campaña pública
│   ├── dashboard/                # Dashboard privado
│   ├── login/                    # Página de login
│   ├── needs/                    # Página de necesidades pública
│   ├── onboarding/               # Flujo de onboarding
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de inicio
│
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── stitch/              # Componentes de marca
│   │   └── ui/                  # Componentes base (shadcn/ui)
│   │
│   ├── features/                # Módulos de funcionalidad
│   │   ├── auth/                # Autenticación
│   │   ├── campaign/            # Lógica de campañas
│   │   ├── intake/              # Recepción de datos (pledges, donaciones)
│   │   ├── members/             # Gestión de miembros
│   │   ├── needs/               # Gestión de necesidades
│   │   │   ├── ai/             # Integración con IA
│   │   │   ├── components/      # Componentes de necesidades
│   │   │   ├── hooks/          # Hooks personalizados
│   │   │   └── lib/            # Utilidades y queries
│   │   ├── dashboard/           # Componentes del dashboard
│   │   ├── pledges/            # Gestión de pledges
│   │   ├── onboarding/         # Flujo de onboarding
│   │   └── campaigns/          # Acciones de campañas
│   │
│   ├── lib/                      # Utilidades y helpers
│   │   ├── services/            # Servicios externos (webhooks, etc)
│   │   ├── supabase/            # Clientes Supabase
│   │   ├── validations/         # Esquemas Zod
│   │   ├── env.ts               # Validación de variables de entorno
│   │   ├── cn.ts                # Utilidad de clases CSS
│   │   └── organizations.ts     # Lógica de organizaciones
│   │
│   └── styles/                   # Estilos globales
│
├── supabase/                      # Migraciones y configuración
│   ├── migrations/               # Migraciones SQL
│   ├── templates/                # Templates de email
│   ├── seed.sql                  # Datos de prueba
│   └── config.toml              # Configuración Supabase
│
├── openspec/                      # Especificaciones del producto
│   ├── specs/                    # Especificaciones actuales
│   │   ├── design-foundation/   # Guía de diseño
│   │   ├── handly-identity/     # Identidad de marca
│   │   └── platform-boundaries/ # Límites de plataforma
│   └── changes/                  # Historial de cambios
│
├── .claude/                       # Skills personalizados para Claude
│   └── skills/                   # Documentación de patrones del proyecto
│
├── .github/                       # Configuración GitHub
│   ├── workflows/                # CI/CD workflows
│   └── dependabot.yml            # Configuración de Dependabot
│
└── [config files]                # tsconfig, next.config, etc
```

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build para producción
npm run start            # Inicia servidor de producción
npm run lint             # Ejecuta ESLint
npm run type-check       # Verifica tipos TypeScript

# Base de datos
npm run db:setup         # Inicializa Supabase localmente
npm run db:seed          # Llena BD con datos de prueba
npm run db:reset         # Resetea la BD
npm run db:migrate       # Ejecuta migraciones

# AI/Prompts
npm run ai:test          # Prueba prompts de IA
```

### Estructura de Componentes

La mayoría de componentes usan este patrón:

```typescript
// Componente React (Client o Server)
// - TypeScript para type safety
// - Tailwind CSS para estilos
// - shadcn/ui para componentes base
// - Composición sobre herencia

// Ejemplo de Server Component con Actions
export default async function NeedItemForm() {
  const { data, error } = await createNeedItem(formData);
  return <div>{/* JSX */}</div>;
}
```

### Integración con IA

Los prompts y herramientas de IA están centralizados en `src/features/needs/ai/`:

- **prompts.ts** - Definición de prompts
- **provider.ts** - Configuración del proveedor
- **tools.ts** - Herramientas disponibles para el modelo
- **actions.ts** - Acciones ejecutables por IA
- **types.ts** - Tipos TypeScript para IA

## 🔒 Seguridad

- **RLS (Row Level Security)** en Supabase para acceso controlado
- **Server Actions** para operaciones seguras del lado del servidor
- **Validación de esquemas** con Zod en client y server
- **Autenticación OAuth** con opciones multi-proveedor
- **Rate limiting** en API routes
- **CORS** configurado apropiadamente

## 📱 Características de UX

### Responsive Design
- Mobile-first approach
- Desktop, tablet y mobile optimizados
- Touch-friendly interactions

### Accesibilidad
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Semantic HTML

### Temas
- Light/Dark mode
- Customizable color schemes
- System preference detection

## 🧪 Testing

```bash
# Próximamente
npm run test             # Ejecuta tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## 📦 Deployment

La aplicación está optimizada para deployment en:

- **Vercel** - Recomendado para Next.js
- **Netlify** - Con funciones serverless
- **Docker** - Para deployments autohospedados

### Vercel

```bash
npm i -g vercel
vercel
```

## 🤝 Contribución

Bienvenidos contribuyentes! Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Directrices de Código
- Usa TypeScript strict mode
- Sigue la estructura de carpetas
- Escribe componentes pequeños y reutilizables
- Documenta funciones complejas
- Mantén tests actualizados

## 📚 Documentación Adicional

- [DESIGN.md](./DESIGN.md) - Guía de diseño y componentes
- [AGENTS.md](./AGENTS.md) - Documentación de agentes IA
- [openspec/](./openspec/) - Especificaciones del producto

## 🐛 Reporte de Bugs

Encuentras un bug? Por favor:

1. Verifica si ya fue reportado
2. Proporciona pasos para reproducir
3. Incluye screenshots/videos si es posible
4. Especifica tu entorno (OS, navegador, versión Node)

## 📄 Licencia

Este proyecto está bajo licencia [MIT](LICENSE).

## 👥 Equipo

Desarrollado por:
- **Ramiro** - Argentina
- **Junior** - Colombia
- **Daniel** - Colombia

Todos con formación académica en desarrollo y experiencia con IA.

## 🙏 Agradecimientos

- [Anthropic](https://www.anthropic.com/) - Modelo Claude API
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hosting y deployment
- [shadcn/ui](https://ui.shadcn.com/) - Componentes React
- [Next.js](https://nextjs.org/) - Framework React

## 📞 Contacto

Para preguntas o sugerencias, abre un Issue o contacta directamente al equipo.

---

**Status**: En desarrollo activo 🚀

Hecho con ❤️ para [CoderCup](https://coderhouse.com)
