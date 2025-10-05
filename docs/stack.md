## Stack Tecnológica Completa

### Frontend Framework & Build Tool
- **Vite** (5.4.19) - Build tool e dev server ultra-rápido
- **React** (18.3.1) - Biblioteca principal para UI
- **TypeScript** (5.8.3) - Linguagem principal com tipagem estática
- **React Router DOM** (6.30.1) - Roteamento SPA

### UI Framework & Design System
- **shadcn/ui** - Sistema de componentes baseado em Radix UI
- **Radix UI** - Biblioteca de componentes primitivos acessíveis
  - @radix-ui/react-accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.
- **Tailwind CSS** (3.4.17) - Framework CSS utility-first
- **tailwindcss-animate** (1.0.7) - Animações CSS
- **@tailwindcss/typography** (0.5.19) - Tipografia otimizada
- **next-themes** (0.3.0) - Sistema de temas dark/light
- **Lucide React** (0.462.0) - Ícones SVG

### Backend & Database
- **Supabase** (2.58.0) - Backend-as-a-Service completo
  - PostgreSQL database
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Authentication & authorization
  - Edge functions
- **Supabase CLI** para gerenciamento de migrações

### Estado & Data Fetching
- **TanStack Query** (5.83.0) - Gerenciamento de estado servidor
  - Cache inteligente
  - Background updates
  - Optimistic updates
  - Error handling
- **React Context API** - Estado global da aplicação (auth, language)

### Forms & Validation
- **React Hook Form** (7.61.1) - Gerenciamento de formulários
- **@hookform/resolvers** (3.10.0) - Resolvers para validação
- **Zod** (3.25.76) - Schema validation TypeScript-first

### UI Components Especializados
- **embla-carousel-react** (8.6.0) - Carrosséis
- **react-day-picker** (8.10.1) - Seletor de datas
- **recharts** (2.15.4) - Gráficos e visualizações
- **cmdk** (1.1.1) - Command palette
- **sonner** (1.7.4) - Toast notifications
- **vaul** (0.9.9) - Drawer/modal components
- **input-otp** (1.4.2) - Input de OTP

### Utilities & Helpers
- **clsx** (2.1.1) - Conditional CSS classes
- **tailwind-merge** (2.6.0) - Merge Tailwind classes
- **class-variance-authority** (0.7.1) - Variant-based styling
- **date-fns** (3.6.0) - Manipulação de datas

### Development & Quality
- **ESLint** (9.32.0) - Linting
- **@typescript-eslint** (8.38.0) - TypeScript ESLint rules

---

## Arquitetura do Projeto

### Estrutura de Pastas
```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── admin/           # Componentes administrativos
│   └── *.tsx            # Componentes específicos da aplicação
├── contexts/            # React Contexts
│   ├── AuthContext.tsx  # Contexto de autenticação
│   └── LanguageContext.tsx # Contexto de idioma
├── hooks/               # Custom hooks
│   ├── use-mobile.tsx   # Hook para detecção mobile
│   └── use-toast.ts     # Hook para toasts
├── integrations/        # Integrações externas
│   └── supabase/       # Configuração Supabase
├── lib/                 # Utilitários
│   └── utils.ts        # Funções helper
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Homepage
│   └── *.tsx          # Outras páginas
└── assets/            # Assets estáticos
```

### Padrões Arquiteturais

#### 1. **Supabase-First Architecture**
- **Integração direta** com Supabase para todas as operações de dados
- **Row Level Security (RLS)** implementada no banco
- **Tipagem automática** com types gerados do schema
- **Real-time subscriptions** quando necessário

#### 2. **Component-Based Design System**
- **shadcn/ui** como base para componentes
- **Composition over inheritance** - componentes reutilizáveis
- **Variantes controladas** com class-variance-authority
- **Acessibilidade** garantida via Radix UI

#### 3. **Server State Management**
- **TanStack Query** para cache e synchronização
- **Query invalidation** estratégica
- **Background refetching** automático
- **Optimistic updates** para UX responsiva

#### 4. **Multilingual Architecture**
- **Context-based** language switching
- **Database-level** bilingual content (pt/en fields)
- **SEO-friendly** language handling
- **Browser detection** para idioma padrão

---

## Estratégias de UI/UX

### Design System
- **shadcn/ui** como base design system
- **Tailwind CSS** para styling utility-first
- **Design tokens** via CSS variables
- **Dark/Light mode** support
- **Responsive design** mobile-first

### Animações & Interações
- **Smooth transitions** com Tailwind
- **Hover effects** sutis
- **Loading states** informativos
- **Micro-interactions** para feedback
- **Staggered animations** para listas

### Acessibilidade
- **Componentes acessíveis** via Radix UI
- **Keyboard navigation** completa
- **Screen reader** friendly
- **Color contrast** adequado
- **Focus management** otimizado

---

## Padrões de Desenvolvimento

### React Patterns
- **Custom hooks** para lógica reutilizável
- **Compound components** para flexibilidade
- **Render props** quando necessário
- **Context + useReducer** para estado complexo
- **Error boundaries** para robustez

### TypeScript Patterns
- **Strict mode** habilitado
- **Interface segregation** para props
- **Generic types** para reusabilidade
- **Discriminated unions** para estados
- **Type guards** para validação

### Data Fetching Patterns
- **Query keys** organizados por feature
- **Mutation callbacks** para side effects
- **Optimistic updates** para responsividade
- **Error handling** consistente
- **Cache invalidation** estratégica

---

## Deployment & DevOps

### Build Process
- **Vite** para build otimizado
- **TypeScript compilation** com type checking
- **Asset optimization** automático
- **Code splitting** dinâmico
- **Tree shaking** para bundle size

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GA_ID=your-google-analytics-id
```

### Supabase Configuration
- **Local development** com Supabase CLI
- **Migration management** versionado
- **Environment separation** (dev/prod)
- **Database backups** automáticos