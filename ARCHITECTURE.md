# EntrevistIA — Arquitectura y Documentación Técnica

> Plataforma web con IA para preparación de entrevistas técnicas, creación y análisis de CV.

---

## Índice

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Arquitectura General](#4-arquitectura-general)
5. [Sistema de Autenticación](#5-sistema-de-autenticación)
6. [Módulo 1 — Entrevistas con IA](#6-módulo-1--entrevistas-con-ia)
7. [Módulo 2 — Creador de CV](#7-módulo-2--creador-de-cv)
8. [Módulo 3 — Analizador de CV (ATS)](#8-módulo-3--analizador-de-cv-ats)
9. [Base de Datos (Firestore)](#9-base-de-datos-firestore)
10. [API Routes y Server Actions](#10-api-routes-y-server-actions)
11. [Servicios de IA](#11-servicios-de-ia)
12. [Variables de Entorno](#12-variables-de-entorno)
13. [Rutas y Navegación](#13-rutas-y-navegación)
14. [Componentes Principales](#14-componentes-principales)
15. [Estilos y Diseño](#15-estilos-y-diseño)
16. [Scripts](#16-scripts)

---

## 1. Descripción del Proyecto

**EntrevistIA** es una aplicación web full-stack orientada a desarrolladores y profesionales de tecnología que buscan prepararse para procesos de selección. Ofrece tres módulos:

| Módulo | Descripción |
|--------|-------------|
| Simulación de Entrevistas | Práctica interactiva con agente de voz real (GPT-4 + Deepgram + ElevenLabs) |
| Creador de CV | Wizard de 4 pasos con preview en tiempo real y plantillas |
| Analizador ATS | Análisis de CV contra ofertas laborales con score y palabras clave |

---

## 2. Stack Tecnológico

### Framework y Lenguaje

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Next.js | 16.2.6 | Framework full-stack (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5 | Tipado estricto |
| Tailwind CSS | 4 | Estilos utilitarios |

### IA y Voz

| Servicio | Proveedor | Uso |
|----------|-----------|-----|
| Orquestación de voz | Vapi AI `@vapi-ai/web 2.5.2` | Coordina llamadas de voz, STT y TTS |
| Modelos de texto | Google Gemini (`@ai-sdk/google 3.0.75`) | Generar preguntas y analizar feedback |
| STT | Deepgram nova-3 | Audio → texto en español |
| TTS | ElevenLabs eleven_multilingual_v2 | Texto → voz realista en español |
| Conversación | OpenAI GPT-4 | Lógica del entrevistador en tiempo real |
| SDK AI | `ai 6.0.185` | `generateObject` / `generateText` |

### Auth y Base de Datos

| Tecnología | Uso |
|------------|-----|
| Firebase Auth | Autenticación cliente (`firebase 12.13.0`) |
| Firebase Admin | Verificación de sesión en servidor (`firebase-admin 13.10.0`) |
| Firestore | Base de datos NoSQL (colecciones: users, interviews, feedback) |

### UI y Formularios

| Librería | Versión | Uso |
|----------|---------|-----|
| framer-motion | 12.40.0 | Animaciones fluidas |
| lucide-react | 1.16.0 | Iconos |
| sonner | 2.0.7 | Notificaciones toast |
| next-themes | 0.4.6 | Gestión de temas |
| radix-ui | 1.4.3 | Componentes base accesibles |
| shadcn | 4.7.0 | Sistema de componentes |
| react-hook-form | 7.76.0 | Manejo de formularios |
| zod | 3.24.2 | Validación de esquemas |
| dayjs | 1.11.20 | Manejo de fechas |

---

## 3. Estructura de Carpetas

```
IA-ENTRENAMIENTOPROFESIONAL/
│
├── app/                            # App Router (Next.js)
│   ├── (auth)/                     # Rutas públicas de autenticación
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── layout.tsx              # Redirige si ya está autenticado
│   │
│   ├── (root)/                     # Rutas protegidas
│   │   ├── dashboard/page.tsx
│   │   ├── cv-creator/page.tsx
│   │   ├── cv-analyzer/page.tsx
│   │   ├── interview/
│   │   │   ├── page.tsx            # Configuración de entrevista
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Simulación en vivo
│   │   │       └── feedback/page.tsx
│   │   └── layout.tsx              # Navbar + verificación de auth
│   │
│   ├── api/
│   │   └── vapi/generate/route.ts  # Webhook para generar entrevistas
│   │
│   ├── layout.tsx                  # Root layout (metadatos, Toaster)
│   ├── page.tsx                    # Landing page
│   └── globals.css
│
├── components/                     # Componentes React reutilizables
│   ├── Agent.tsx                   # Control de llamadas Vapi
│   ├── AuthForm.tsx                # Login / registro unificado
│   ├── CvAnalyzerUpload.tsx        # Análisis ATS completo
│   ├── CvCreatorForm.tsx           # Wizard de creación de CV
│   ├── CvPreview.tsx               # Preview en tiempo real
│   ├── CvTemplateCard.tsx
│   ├── DisplayTechIcons.tsx
│   ├── FormField.tsx
│   ├── InterviewCard.tsx
│   ├── InterviewForm.tsx           # Configuración rápida de entrevista
│   ├── InterviewPage.tsx
│   ├── KeywordsPanel.tsx
│   ├── StartTemplateButton.tsx
│   ├── SuggestionCard.tsx
│   ├── AtsScoreCard.tsx
│   └── ui/                         # Primitivos shadcn
│       ├── button.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── shape-landing-hero.tsx
│       └── sonner.tsx
│
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts          # Server Actions de autenticación
│   │   └── general.action.ts       # Server Actions de entrevistas/feedback
│   ├── utils.ts                    # cn(), getTechLogos(), getRandomInterviewCover()
│   └── vapi.sdk.ts                 # Instancia Vapi inicializada
│
├── firebase/
│   ├── client.ts                   # Firebase Auth + Firestore (cliente)
│   └── admin.ts                    # Firebase Admin SDK (servidor)
│
├── constants/index.ts              # Esquemas Zod, config Vapi, plantillas
├── types/index.d.ts                # Interfaces TypeScript globales
│
├── public/                         # Assets estáticos
│   ├── logo.svg
│   ├── ai-avatar_v3.png
│   ├── Robotv3.png
│   ├── covers/
│   └── pattern.png
│
├── .env.local                      # Variables de entorno (no commitear)
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json
└── package.json
```

---

## 4. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                         │
│                                                                  │
│  Landing → Auth → Dashboard → Interview / CV Creator / Analyzer │
│               │                    │                            │
│        Firebase Auth          Vapi SDK (WebRTC)                 │
└───────────────┼────────────────────┼────────────────────────────┘
                │                    │
┌───────────────▼────────────────────▼────────────────────────────┐
│                      Next.js Server                              │
│                                                                  │
│   Server Components (RSC)   │   Server Actions   │   API Routes │
│   - Protección de rutas     │   - auth.action.ts │   POST /api/ │
│   - Fetch inicial de datos  │   - general.action │   vapi/      │
│                             │                    │   generate   │
└──────────────────────────┬──┴──────────────┬──────┴─────────────┘
                           │                 │
          ┌────────────────▼──┐   ┌──────────▼──────────┐
          │    Firestore DB   │   │    Google Gemini     │
          │                   │   │  (generateObject)    │
          │  /users           │   │  - Preguntas JSON    │
          │  /interviews      │   │  - Feedback análisis │
          │  /feedback        │   └─────────────────────┘
          └───────────────────┘
                                         │
                           ┌─────────────▼──────────────┐
                           │          Vapi AI            │
                           │  - Deepgram (STT)           │
                           │  - ElevenLabs (TTS)         │
                           │  - GPT-4 (conversación)     │
                           │  - Webhook → /api/vapi/     │
                           └────────────────────────────┘
```

### Patrón Cliente / Servidor

- **Server Components** por defecto: carga de datos, protección de rutas, sin JS innecesario
- **`"use client"`** solo en componentes interactivos: `Agent`, `AuthForm`, `CvCreatorForm`, `InterviewForm`
- **Server Actions** para todas las operaciones sensibles con Firestore
- **API Route** solo para el webhook de Vapi (necesita URL pública)

---

## 5. Sistema de Autenticación

### Registro

```
[Sign Up Form] → createUserWithEmailAndPassword(Firebase)
              → signUp(Server Action)
              → Guardar en Firestore users/{uid}
              → setSessionCookie(idToken)
              → redirect("/dashboard")
```

### Login

```
[Sign In Form] → signInWithEmailAndPassword(Firebase)
              → getIdToken()
              → signIn(Server Action) → setSessionCookie(idToken)
              → Cookie HTTP-only (7 días, secure en prod)
              → redirect("/dashboard")
```

### Protección de Rutas

`app/(root)/layout.tsx` ejecuta `isAuthenticated()` en cada request:

```typescript
const isAuth = await isAuthenticated(); // verifica cookie con Firebase Admin
if (!isAuth) redirect("/sign-in");
```

### Server Actions de Auth

```typescript
// lib/actions/auth.action.ts
signUp(params: SignUpParams)       → {success, message}
signIn(params: SignInParams)       → {success, message}
setSessionCookie(idToken: string)  → void
getCurrentUser()                   → Promise<User | null>
isAuthenticated()                  → Promise<boolean>
```

---

## 6. Módulo 1 — Entrevistas con IA

### Flujo A: Generación por Agente de Voz

```
[InterviewPage] → [Agent.tsx] → vapi.start(workflow)
                              ↓ Usuario dice: "React, Junior, 10 preguntas"
                              ↓ Vapi ejecuta webhook
                              ↓ POST /api/vapi/generate
                              ↓ Gemini genera JSON de preguntas
                              ↓ Guarda en Firestore interviews/
                              → redirect("/dashboard")
```

### Flujo B: Simulación de Entrevista

```
[/interview/[id]] → [Agent.tsx] → vapi.start(interviewer config)
                                ↓ IA hace pregunta (TTS)
                                ↓ Usuario responde (STT → Deepgram)
                                ↓ GPT-4 procesa y responde
                                ↓ vapi.on('message') acumula transcripción
                                → call-end
                                ↓ createFeedback(Server Action)
                                ↓ Gemini analiza transcripción → feedbackSchema
                                ↓ Guarda en Firestore feedback/
                                → redirect("/interview/[id]/feedback")
```

### Configuración del Entrevistador Vapi

```typescript
// constants/index.ts
const interviewer = {
  name: "Entrevistador",
  transcriber: { provider: "deepgram", model: "nova-3", language: "es" },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    model: "eleven_multilingual_v2",
    stability: 0.5,
    similarityBoost: 0.75
  },
  model: { provider: "openai", model: "gpt-4" }
}
```

### Schema de Feedback (Zod)

```typescript
const feedbackSchema = z.object({
  totalScore: z.number(),             // 0-100
  categoryScores: z.array(z.object({
    name: z.string(),
    score: z.number(),
    comment: z.string()
  })),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string()
})
```

### Plantillas de Entrevista Predefinidas

| ID | Rol | Nivel | Stack |
|----|-----|-------|-------|
| `template-frontend-junior` | Frontend Developer | Junior | React, TypeScript, CSS3, HTML5 |
| `template-backend-senior` | Backend Developer | Senior | Node.js, Express, PostgreSQL, Redis |
| `template-fullstack-semisenior` | Full Stack Developer | Semi-Senior | Next.js, MongoDB, TypeScript |
| `template-productmanager-senior` | Product Manager | Senior | Behavioral |

---

## 7. Módulo 2 — Creador de CV

### Wizard de 4 Pasos (`CvCreatorForm.tsx`)

| Paso | Campos |
|------|--------|
| 0 — Info Personal | Nombre, email, ubicación, LinkedIn, GitHub, cargo |
| 1 — Experiencia | Empresa, rol, fechas, logros (array dinámico) |
| 2 — Skills y Educación | Tecnologías, idiomas, carrera, institución |
| 3 — Personalización | Color primario, idioma del CV, plantilla |

- `CvPreview.tsx` renderiza el CV en tiempo real mientras el usuario completa el formulario
- `CvTemplateCard.tsx` permite seleccionar entre plantillas: Profesional, Moderno, Creativo, ATS-optimizado

---

## 8. Módulo 3 — Analizador de CV (ATS)

### Flujo (`CvAnalyzerUpload.tsx`)

```
[Upload CV (drag & drop)] + [Pegar/seleccionar oferta laboral]
                          ↓ Análisis en cliente (simulado)
                          ↓ Comparación de keywords
                          ↓ Cálculo de score ATS
[AtsScoreCard]     → Score porcentual con gauge visual
[KeywordsPanel]    → Keywords presentes vs. faltantes
[SuggestionCard]   → Sugerencias accionables para mejorar
```

### Presets de Ofertas Disponibles

- React / Frontend
- Python / Data Science
- DevOps / Cloud
- Product Manager

---

## 9. Base de Datos (Firestore)

### Colección `users`

```typescript
{
  id: string;       // uid de Firebase Auth
  name: string;
  email: string;
}
```

### Colección `interviews`

```typescript
{
  id: string;
  userId: string;
  role: string;
  level: "junior" | "semi-senior" | "senior";
  type: "Technical" | "Behavioral" | "Mixed";
  techstack: string[];
  questions: string[];
  finalized: boolean;
  coverImage: string;
  createdAt: string;  // ISO 8601
}
```

### Colección `feedback`

```typescript
{
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;           // 0-100
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}
```

---

## 10. API Routes y Server Actions

### API Route: `POST /api/vapi/generate`

Webhook que llama Vapi al terminar la conversación de configuración.

**Body recibido:**
```json
{
  "type": "end-of-call-report",
  "message": {
    "call": {
      "assistantOverrides": {
        "variableValues": {
          "role": "React Developer",
          "level": "junior",
          "techstack": "React,TypeScript",
          "amount": "10",
          "userid": "uid123"
        }
      }
    }
  }
}
```

**Proceso:**
1. Extrae `role`, `level`, `techstack`, `amount`, `userid`
2. Llama a Gemini Flash para generar `amount` preguntas en JSON
3. Guarda documento en Firestore `interviews`

**Response:** `{ success: boolean }`

### Server Actions Generales (`general.action.ts`)

```typescript
getInterviewsByUserId(userId: string)              → Interview[]
getLatestInterviews({userId, limit})               → Interview[]
getInterviewById(id: string)                       → Interview | null
createFeedback(params: CreateFeedbackParams)        → {success, feedbackId?}
getFeedbackByInterviewId({interviewId, userId})    → Feedback | null
createInterviewFromTemplate(templateId, userId)    → string | null  // retorna interview ID
```

---

## 11. Servicios de IA

| Servicio | Proveedor | Variable de Entorno |
|----------|-----------|---------------------|
| Vapi (orquestación de voz) | Vapi AI | `NEXT_PUBLIC_VAPI_WEB_TOKEN` |
| Workflow de configuración | Vapi AI | `NEXT_PUBLIC_VAPI_WORKFLOW_ID` |
| Generación de preguntas | Google Gemini | `GEMINI_API_KEY` |
| Análisis de feedback | Google Gemini | `GEMINI_API_KEY` |
| STT | Deepgram nova-3 | Config dentro de Vapi |
| TTS | ElevenLabs | Config dentro de Vapi |
| Conversación en vivo | OpenAI GPT-4 | Config dentro de Vapi |

### Modelo Gemini usado

```typescript
google("gemini-3.1-flash-lite-preview")  // en /api/vapi/generate y createFeedback
```

---

## 12. Variables de Entorno

Crear `.env.local` en la raíz del proyecto:

```env
# Vapi AI
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Google Gemini (servidor)
GEMINI_API_KEY=

# Firebase Admin (servidor — clave privada RSA)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# URL base
NEXT_PUBLIC_BASE_URL=http://localhost:3000/
```

---

## 13. Rutas y Navegación

```
/                       Landing page (sin auth requerida)
/sign-in                Login
/sign-up                Registro

/dashboard              Panel principal (protegida)
/interview              Configuración de nueva entrevista (protegida)
/interview/[id]         Simulación en vivo (protegida)
/interview/[id]/feedback  Resultados y retroalimentación (protegida)
/cv-creator             Creador de CV (protegida)
/cv-analyzer            Analizador ATS (protegida)
```

### Protección

- `app/(root)/layout.tsx` verifica sesión mediante `isAuthenticated()`
- `app/(auth)/layout.tsx` redirige a `/dashboard` si ya hay sesión activa

---

## 14. Componentes Principales

| Componente | `use client` | Descripción |
|------------|:---:|-------------|
| `Agent.tsx` | ✅ | Controlador Vapi: inicia/detiene llamada, maneja eventos, feedback |
| `AuthForm.tsx` | ✅ | Formulario unificado login/registro con React Hook Form + Zod |
| `CvCreatorForm.tsx` | ✅ | Wizard 4 pasos con preview en tiempo real |
| `CvAnalyzerUpload.tsx` | ✅ | Upload + análisis ATS interactivo |
| `InterviewForm.tsx` | ✅ | Formulario de configuración rápida de entrevista |
| `InterviewPage.tsx` | ✅ | Contenedor que elige entre Form o Agent |
| `CvPreview.tsx` | ✅ | Renderiza CV según datos del wizard |
| `InterviewCard.tsx` | — | Tarjeta de entrevista pasada |
| `DisplayTechIcons.tsx` | — | Muestra logos de tecnologías |
| `AtsScoreCard.tsx` | — | Visualización de score ATS con gauge |
| `KeywordsPanel.tsx` | — | Lista keywords presentes vs. faltantes |
| `SuggestionCard.tsx` | — | Sugerencia accionable de mejora |

### Utilidades (`lib/utils.ts`)

```typescript
cn(...inputs)                    // clsx + tailwind-merge
getTechLogos(techArray: string[]) // retorna array de {tech, url} con logos
getRandomInterviewCover()         // retorna URL aleatoria de covers/
```

---

## 15. Estilos y Diseño

### Tema

- **Modo**: Dark mode por defecto (`next-themes`)
- **Paleta**: Indigo (#6366f1), Violeta (#8b5cf6), Fucsia
- **Estética**: Glassmorphism + gradientes premium
- **Tipografía**: Mona Sans (Google Fonts)

### Animaciones CSS personalizadas (`globals.css`)

| Clase | Efecto |
|-------|--------|
| `.animate-speak` | Anillo expansivo cuando la IA está hablando |
| `.animate-fadeIn` | Entrada suave de elementos |
| `.animate-ping` | Indicador de carga / llamada activa |

### Patrón de Botones

```css
/* Glow effect */
shadow-[0_0_30px_rgba(99,102,241,0.5)]
/* Glassmorphism */
bg-white/10 backdrop-blur-sm border border-white/20
```

---

## 16. Scripts

```bash
npm run dev      # Servidor de desarrollo (Next.js con webpack)
npm run build    # Build de producción
npm start        # Servidor en producción
npm run lint     # ESLint
```

---

*Generado el 2026-06-16 — EntrevistIA*
