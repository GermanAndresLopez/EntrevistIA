# Documentación Técnica y Funcional: EntrevistIA

¡Bienvenido a la documentación oficial de **EntrevistIA**! Esta plataforma está diseñada para ayudar a desarrolladores y profesionales de tecnología a prepararse para entrevistas de trabajo reales mediante simulaciones de voz impulsadas por Inteligencia Artificial, y optimizar sus hojas de vida (CV) mediante creadores de plantillas y análisis ATS automatizados.

---

## Índice
1. [Introducción General](#1-introducción-general)
2. [Arquitectura del Proyecto](#2-arquitectura-del-proyecto)
3. [Explicación de Carpetas y Archivos](#3-explicación-de-carpetas-y-archivos)
4. [Sistema de Autenticación](#4-sistema-de-autenticación)
5. [Sistema de Entrevistas con IA](#5-sistema-de-entrevistas-con-ia)
6. [APIs, Webhooks y Server Actions](#6-apis-webhooks-y-server-actions)
7. [Base de Datos y Almacenamiento (Firestore)](#7-base-de-datos-y-almacenamiento-firestore)
8. [Componentes de la Interfaz de Usuario (UI)](#8-componentes-de-la-interfaz-de-usuario-ui)
9. [Estilos, Diseño y Animaciones](#9-estilos-diseño-y-animaciones)
10. [Flujo Completo del Usuario](#10-flujo-completo-del-usuario)
11. [Variables de Entorno y Configuración](#11-variables-de-env-y-configuración)
12. [Buenas Prácticas Aplicadas](#12-buenas-prácticas-aplicadas)
13. [Problemas Potenciales y Mejoras Futuras](#13-problemas-potenciales-y-mejoras-futuras)
14. [Glosario Técnico para Principiantes](#14-glosario-técnico-para-principiantes)

---

## 1. Introducción General

### ¿Qué hace el proyecto?
**EntrevistIA** es una aplicación web interactiva que automatiza el proceso de preparación para entrevistas laborales. A través de un agente conversacional de voz en tiempo real, simula a un entrevistador técnico o de comportamiento humano. Además, ofrece herramientas de creación de currículums (CV) y de análisis de coincidencia ATS (Applicant Tracking Systems) para asegurar que el perfil del usuario sea competitivo en el mercado laboral.

### Objetivo Principal
Capacitar a los candidatos eliminando el "miedo escénico" y la falta de preparación, proporcionándoles un entorno interactivo y retroalimentación inmediata, objetiva y constructiva.

### Problema que Resuelve
1. **Falta de práctica realista**: Los simuladores tradicionales son basados en texto. EntrevistIA utiliza voz interactiva nativa.
2. **Falta de feedback detallado**: Evalúa de manera cuantitativa y cualitativa el desempeño (fortalezas, debilidades, score técnico).
3. **Optimización de CV**: Ayuda a evitar que el currículum de un candidato sea descartado automáticamente por algoritmos ATS.

### Tipo de Usuarios
* **Candidatos/Desarrolladores**: Que buscan entrenarse para entrevistas y optimizar sus hojas de vida.
* **Instituciones o Bootcamps**: Que deseen ofrecer una herramienta de simulación de salida al mercado laboral para sus egresados.

---

## 2. Arquitectura del Proyecto

El proyecto está construido sobre el framework **Next.js 15+** aprovechando el paradigma del **App Router**. Es una arquitectura híbrida que combina el renderizado del lado del servidor (SSR) para velocidad y SEO, Server Actions para procesamiento seguro, y componentes de cliente (React) para interacciones de voz en tiempo real.

### Diagrama del Flujo de Comunicación

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Navegador)                       │
│  - React (Client Components)                                          │
│  - Vapi SDK (@vapi-ai/web) para captura de audio y eventos             │
│  - Framer Motion (Animaciones visuales de voz y layouts)               │
└───────────────┬───────────────────────────────▲────────────────────────┘
                │ (1) Iniciar Llamada           │ (4) Audio / Transcripción
                ▼                               │     en tiempo real
┌───────────────────────────────────────────────┴────────────────────────┐
│                         VAPI AI (Servicio de Voz)                      │
│  - Deepgram (Traducción de Audio a Texto - STT)                        │
│  - GPT-4 / LLM (Generación de respuestas conversacionales)              │
│  - ElevenLabs (Traducción de Texto a Audio - TTS)                      │
└───────────────┬────────────────────────────────────────────────────────┘
                │ (2) Fin de llamada: Ejecuta Webhook POST /api/vapi/generate
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS BACKEND & SERVICES                    │
│  - API Routes (Webhooks)                                               │
│  - Server Actions (createFeedback, getCurrentUser, signUp/signIn)      │
│  - Firebase Admin SDK (Conexión segura con Firestore y Auth)           │
└───────────────┬───────────────────────────────────────▲────────────────┘
                │ (3) LLM Query                         │ (5) Guardar datos
                ▼                                       ▼
┌───────────────────────────────┐       ┌────────────────────────────────┐
│      GOOGLE GEMINI API        │       │       FIREBASE FIRESTORE       │
│  - Genera feedback detallado  │       │  - Colección 'users'           │
│  - Estructuración JSON (Zod)  │       │  - Colección 'interviews'      │
│  - Generación de preguntas    │       │  - Colección 'feedback'        │
└───────────────────────────────┘       └────────────────────────────────┘
```

### Comunicación entre Capas
1. **Frontend a Vapi AI**: Comunicación WebSocket directa de baja latencia usando el SDK web de Vapi para transmitir datos de micrófono y recibir respuestas de audio con milisegundos de retraso.
2. **Vapi AI a Next.js (Webhook)**: Al concluir una llamada de "configuración", Vapi realiza una petición POST a `/api/vapi/generate` indicando los parámetros recolectados por voz.
3. **Next.js a Gemini**: El servidor de Next.js procesa la petición y llama a la API de **Google Gemini** a través de la librería `ai` (`generateText` y `generateObject`) para construir preguntas estructuradas o procesar la evaluación con esquemas estrictos de validación **Zod**.
4. **Next.js a Firebase**: Persistencia y consulta segura de colecciones sin exponer credenciales de administración en el cliente.

---

## 3. Explicación de Carpetas y Archivos

El proyecto sigue una estructura limpia, separando las responsabilidades de enrutamiento, componentes reutilizables, configuración e integraciones:

| Carpeta / Archivo | Responsabilidad Principal |
| :--- | :--- |
| `app/` | Contiene todas las páginas, grupos de rutas y endpoints de la API (Next.js App Router). |
| `app/(auth)/` | Grupo de rutas lógicas para la autenticación de usuarios (`sign-in` y `sign-up`). |
| `app/(root)/` | Grupo de rutas para usuarios autenticados (Dashboard, CV Creator, CV Analyzer, Interview). |
| `app/api/vapi/generate/` | Endpoint del Webhook que recibe las llamadas de Vapi para generar las preguntas. |
| `app/layout.tsx` | Layout raíz que define los metadatos globales, fuentes y estructura HTML inicial. |
| `app/globals.css` | Hoja de estilos globales que integra Tailwind CSS y define tokens de diseño de la marca. |
| `components/` | Componentes de UI modulares y reutilizables (formularios, layouts, agentes de voz, visualizaciones). |
| `constants/` | Esquemas de datos (Zod), plantillas fijas de entrevistas, mapeo de iconos de tecnologías y presets. |
| `firebase/` | Inicialización de Firebase. Contiene `client.ts` para el frontend y `admin.ts` para operaciones de servidor. |
| `lib/` | Utilidades del proyecto. Contiene actions del backend (`auth.action.ts`, `general.action.ts`) y el SDK de Vapi. |
| `public/` | Archivos multimedia estáticos (logos, avatares, ilustraciones y patrones de fondo). |
| `types/` | Definiciones globales de TypeScript (`index.d.ts`, `vapi.d.ts`) para garantizar tipado seguro. |

---

## 4. Sistema de Autenticación

El sistema de autenticación combina la rapidez de **Firebase Authentication** en el cliente y la seguridad de **Cookies HTTP-Only** en el servidor para evitar ataques XSS y proteger el acceso de manera robusta.

### Flujo de Registro (Sign Up)
1. El usuario completa el formulario con Nombre, Correo y Contraseña.
2. Firebase Auth del lado del cliente crea la credencial primaria (`createUserWithEmailAndPassword`).
3. Se invoca la Server Action `signUp` en [auth.action.ts](file:///c:/Users/herna/Desktop/Proyectos/voice_agent-interview/lib/actions/auth.action.ts), la cual registra un documento de usuario en la colección `users` en Firestore utilizando el UID generado por Firebase.

### Flujo de Inicio de Sesión (Sign In)
1. El cliente inicia sesión con correo y contraseña. Firebase retorna un `idToken` en caso de éxito.
2. Este `idToken` es enviado a la Server Action `signIn` que invoca a `setSessionCookie`.
3. El servidor crea una **Cookie de Sesión** segura (`sessionCookie`) usando `firebase-admin` con validez de 7 días y la establece en el navegador como `httpOnly: true` y `secure` (en producción).

### Protección de Rutas (Middleware / Layout Verification)
* Las rutas bajo la carpeta `(root)` están envueltas en el archivo [app/(root)/layout.tsx](file:///c:/Users/herna/Desktop/Proyectos/voice_agent-interview/app/%28root%29/layout.tsx).
* El componente ejecuta `isAuthenticated()`, el cual valida la cookie en el servidor utilizando `auth.verifySessionCookie`. Si la firma es inválida o no existe, se redirige inmediatamente al usuario a `/sign-in`.

---

## 5. Sistema de Entrevistas con IA

Este es el núcleo conversacional del proyecto. Permite realizar dos flujos distintos:

### Flujo A: Configuración Interactiva de la Entrevista ("Conversar para generar")
1. El usuario inicia una sesión de diálogo libre con el **Agente de voz** (Vapi configurado con el workflow `NEXT_PUBLIC_VAPI_WORKFLOW_ID`).
2. El agente interactúa mediante voz preguntándole al usuario: *¿Qué puesto buscas? ¿Cuál es tu nivel de experiencia? ¿Qué tecnologías manejas?*
3. Cuando el usuario cuelga, el servidor de Vapi dispara un Webhook a `/api/vapi/generate`.
4. El webhook procesa los parámetros recolectados y llama a **Google Gemini** para estructurar un listado formal de preguntas en formato JSON.
5. El sistema guarda la entrevista generada en la colección `interviews` y la asocia al ID del usuario.

### Flujo B: Simulación de Entrevista Real (Práctica y Evaluación)
1. El usuario selecciona una plantilla o entrevista guardada y hace clic en **"Iniciar entrevista"**.
2. Se renderiza el componente [Agent.tsx](file:///c:/Users/herna/Desktop/Proyectos/voice_agent-interview/components/Agent.tsx) cargando la plantilla del asistente `interviewer` (configurada con síntesis y transcripción en español en `constants/index.ts`).
3. Vapi toma control del micrófono y lee las preguntas correspondientes de forma secuencial.
4. El SDK de Vapi intercepta las respuestas del usuario y emite eventos en tiempo real:
   * `speech-start` / `speech-end`: Modifica estados del cliente para mostrar micro-animaciones de voz.
   * `message`: Acumula las transcripciones finales del usuario y del entrevistador en el estado `messages`.
5. Al colgar, si la llamada ha terminado, el componente cliente dispara la Server Action `createFeedback()`.

### Generación de Feedback Automático (Evaluación con Gemini)
La Server Action `createFeedback` toma la transcripción acumulada y ejecuta el modelo de Google Gemini:
```typescript
const { object } = await generateObject({
  model: google("gemini-3.1-flash-lite-preview"),
  schema: feedbackSchema, // Esquema estructurado Zod
  prompt: `Evalúa la entrevista basándote en: habilidades de comunicación, conocimiento técnico, resolución de problemas...`
});
```
* **Esquema estructurado (Zod)**: Garantiza que Gemini retorne una estructura JSON exacta con: puntuación total, desglose por categorías (nombre, puntaje, comentarios), fortalezas y áreas de mejora.
* Al recibir el JSON exitoso, se guarda en la colección `feedback` en Firestore y se redirige al usuario a la vista de resultados `/interview/[id]/feedback`.

---

## 6. APIs y Server Actions

El backend está construido bajo el estándar moderno de Next.js 15, dividiéndose en Endpoints API clásicos (para servicios externos) y Server Actions (para operaciones del cliente).

### API Routes (Endpoints Webhook)
* **`POST /api/vapi/generate`**:
  * **Uso**: Invocado por Vapi al colgar la llamada de configuración.
  * **Acción**: Lee los parámetros del cuerpo de la petición, consulta a Gemini para generar `$amount` preguntas técnicas/conductuales, las estructura en formato de arreglo JSON, y guarda la entrevista en Firestore.

### Server Actions
Las Server Actions se definen usando la directiva `"use server"` en el servidor y se importan directamente en el cliente como funciones asíncronas normales:

| Server Action | Ubicación | Parámetros | Propósito |
| :--- | :--- | :--- | :--- |
| `signUp` | `auth.action.ts` | `SignUpParams` | Registra el correo y nombre del usuario en Firestore. |
| `signIn` | `auth.action.ts` | `SignInParams` | Genera la sesión HTTP-Only en Next.js tras validar a Firebase. |
| `getCurrentUser` | `auth.action.ts` | Ninguno | Verifica la cookie de sesión y devuelve el perfil del usuario activo. |
| `getInterviewsByUserId` | `general.action.ts` | `userId` | Consulta la base de datos para listar las entrevistas pasadas de un usuario. |
| `createFeedback` | `general.action.ts` | `CreateFeedbackParams`| Analiza la transcripción usando Gemini y guarda el feedback en base de datos. |

---

## 7. Base de Datos y Almacenamiento (Firestore)

El proyecto utiliza **Firebase Firestore** como su base de datos NoSQL documental. A continuación se detallan las tres colecciones principales y sus esquemas relacionales:

### Colección: `users`
Almacena el perfil básico del usuario autenticado. El ID de cada documento coincide con el UID generado por Firebase Authentication.
```json
{
  "name": "Juan García",
  "email": "juan@email.com"
}
```

### Colección: `interviews`
Representa una sesión de entrevista simulada configurada o una plantilla reutilizable.
```json
{
  "userId": "uuid-del-usuario-propietario",
  "role": "Frontend Developer",
  "level": "Junior",
  "type": "Technical",
  "techstack": ["React", "TypeScript", "Tailwind CSS"],
  "questions": [
    "¿Cuál es el propósito del Virtual DOM?",
    "¿Cómo manejas el estado global en React?"
  ],
  "finalized": true,
  "coverImage": "/react.png",
  "createdAt": "2026-05-24T22:09:57.000Z"
}
```

### Colección: `feedback`
Almacena el análisis de rendimiento generado por Google Gemini para una entrevista completada.
```json
{
  "interviewId": "id-de-la-entrevista-evaluada",
  "userId": "uuid-del-usuario",
  "totalScore": 82,
  "categoryScores": [
    {
      "name": "Habilidades de Comunicación",
      "score": 85,
      "comment": "El candidato se expresa con claridad pero debe evitar muletillas."
    },
    {
      "name": "Conocimiento Técnico",
      "score": 80,
      "comment": "Explica bien los hooks pero flaquea en la optimización del render."
    }
  ],
  "strengths": [
    "Excelente explicación de conceptos básicos de React.",
    "Actitud profesional y lenguaje cercano."
  ],
  "areasForImprovement": [
    "Profundizar en estrategias de renderizado del lado del servidor (SSR).",
    "Reducir tiempos de pausa en respuestas complejas."
  ],
  "finalAssessment": "Un candidato sólido con buena base en Frontend. Recomendado ajustar temas de optimización.",
  "createdAt": "2026-05-24T22:11:00.000Z"
}
```

---

## 8. Componentes UI Importantes

La interfaz gráfica cuenta con componentes estilizados orientados a la experiencia del usuario (UX) e interacción de audio en tiempo real:

### 1. `Agent.tsx`
* **Propósito**: Maneja el ciclo de vida del micrófono y de la llamada con Vapi AI.
* **Flujo**: 
  * Se monta e inicializa los oyentes (`vapi.on`).
  * Muestra el avatar de la entrevistadora (`ai-avatar_v2.png`) y del usuario de forma circular.
  * Si la IA está hablando (`isSpeaking === true`), dispara una animación de ondas expansivas de sonido (`.animate-speak`).
  * Al terminar, desconecta el audio y envía el log de mensajes a procesar.

### 2. `CvCreatorForm.tsx` (Módulo 2)
* **Propósito**: Formulario tipo *wizard* (stepper) que permite crear el currículum del usuario en cuatro pasos, autoguardando el progreso localmente y renderizando una vista previa dinámica a un costado.
* **Props**: No recibe props complejas; gestiona internamente los estados de `PersonalInfo`, `WorkExperience[]`, `skills[]`, `Education[]` y `accentColor`.

### 3. `CvAnalyzerUpload.tsx` (Módulo 3)
* **Propósito**: Módulo interactivo de arrastrar y soltar currículums (PDF/DOCX) y compararlos contra descripciones de cargos.
* **Flujo**:
  * Permite pegar texto manual o seleccionar un preset de oferta laboral.
  * Valida y simula la carga del archivo mediante animaciones de carga.
  * Renderiza los componentes de resultado de ATS de forma secuencial con micro-animaciones.

---

## 9. Estilos, Diseño y Animaciones

El sistema gráfico es de alta fidelidad, con una estética **Dark Mode futurista** que emula las mejores plataformas de desarrollo modernas (SaaS premium).

### Tailwind CSS y Variables CSS
El diseño se basa en tokens definidos en [app/globals.css](file:///c:/Users/herna/Desktop/Proyectos/voice_agent-interview/app/globals.css) y configuraciones de Tailwind:
* **Gradients premium**: Se utilizan mezclas de morados, índigos y fucsias de opacidad reducida (`bg-indigo-500/10`) y bordes semitransparentes para recrear el efecto de **Glassmorphism**.
* **blue-gradient-dark**: Utility CSS (`bg-gradient-to-b from-[#171532] to-[#08090D]`) usada para dar profundidad tridimensional a las tarjetas y el panel principal.

### Micro-animaciones (Framer Motion)
Se utiliza la librería `framer-motion` para suavizar la entrada de elementos y transiciones de estado:
* **Efectos de voz**: El anillo animado de comunicación (`.animate-speak` usando `animate-ping`) reacciona dinámicamente al sonido.
* **Fondo dinámico interactivo**: El hero de la landing principal integra formas geométricas abstractas (`ElegantShape`) que flotan y se desplazan suavemente en bucle infinito reduciendo la fatiga visual.

---

## 10. Flujo Completo del Usuario

A continuación se esquematiza el camino secuencial que recorre un usuario promedio en la plataforma:

```
Inicio (Landing Page) ──► Login / Registro ──► Dashboard Principal
                                                   │
     ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
     ▼                                             ▼                                             ▼
Módulo 1: Preparar Entrevista                 Módulo 2: Crear CV con IA                     Módulo 3: Analizador ATS
  ├─ Hablar con Agente de Configuración         ├─ Llenar datos en Stepper                    ├─ Seleccionar o pegar oferta de trabajo
  ├─ Generar preguntas personalizadas           ├─ Elegir plantilla interactiva               ├─ Arrastrar currículum en PDF/DOCX
  ├─ Simulación de entrevista por voz           ├─ Personalizar idioma y colores              ├─ Simulación de procesamiento de IA
  └─ Visualizar Feedback Técnico                └─ Descargar CV Optimizado (Próximamente)     └─ Ver puntuación ATS y Plan de Mejora
```

---

## 11. Variables de Entorno y Configuración

El archivo `.env.local` almacena las claves privadas y públicas de los servicios de terceros requeridos.

| Variable | Tipo | Propósito |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_VAPI_WEB_TOKEN` | Pública | Token del cliente para autorizar e iniciar las llamadas con el SDK web de Vapi AI. |
| `NEXT_PUBLIC_VAPI_WORKFLOW_ID`| Pública | ID del flujo conversacional conversacional de configuración de entrevistas en Vapi. |
| `GEMINI_API_KEY` | Privada | Credencial de Google Gemini para procesamiento de texto e inteligencia artificial en Server Actions. |
| `FIREBASE_PROJECT_ID` | Privada | ID del proyecto de Firebase (usado por Admin SDK). |
| `FIREBASE_CLIENT_EMAIL` | Privada | Correo de la cuenta de servicio de Firebase para autenticación interna de servidor. |
| `FIREBASE_PRIVATE_KEY` | Privada | Clave secreta RSA del certificado de administración de Firebase. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Pública | Clave de API pública para inicializar Firebase Auth en el lado del navegador. |

---

## 12. Buenas Prácticas Utilizadas

1. **Separación Estricta de Entornos (Client vs Server Components)**: Los componentes pesados de procesamiento y conexión a base de datos son Server Components por defecto. Sólo se usa `"use client"` en componentes interactivos que capturan audio o eventos del usuario, optimizando el tamaño del bundle.
2. **Validación Estricta con TypeScript**: Todo el flujo de datos tiene interfaces definidas en `types/index.d.ts`, reduciendo errores en tiempo de ejecución.
3. **Control de Inyección de Respuestas (Zod Schemas)**: Mediante `generateObject` de la librería `ai` y el esquema Zod, se asegura que las respuestas del LLM cumplan con el formato de datos necesario sin posibilidad de romper el parser JSON.
4. **Seguridad de Datos**: Las peticiones a Firebase y APIs de Inteligencia Artificial se ejecutan del lado del servidor, ocultando las credenciales críticas del navegador del cliente.

---

## 13. Problemas Potenciales y Mejoras

### Cuellos de Botella
* **Tiempos de respuesta de Gemini**: La Server Action que genera el feedback puede demorar entre 5 y 10 segundos al procesar una entrevista larga.
  * *Mejora*: Implementar un estado visual de carga persistente (Loading Skeleton) y procesar el feedback de forma asíncrona mediante background jobs.

### Seguridad
* **Validación de Archivos en CV Analyzer**: El analizador ATS simula el procesamiento del archivo subido en el cliente.
  * *Mejora*: Implementar validación en servidor del tipo MIME y tamaño del archivo para evitar inyecciones de código malicioso en PDF o Word.

---

## 14. Glosario Técnico para Principiantes

* **Next.js App Router**: Sistema de enrutamiento basado en archivos físicos dentro de la carpeta `app/`. Permite crear layouts jerárquicos y optimiza la velocidad del sitio.
* **Server Action**: Función de JavaScript ejecutada exclusivamente en el servidor web de Next.js, pero invocada desde el frontend como si fuera una función local.
* **Vapi AI**: Plataforma de desarrollo que permite crear asistentes de voz impulsados por Inteligencia Artificial que se integran fácilmente a aplicaciones web.
* **ATS (Applicant Tracking System)**: Software usado por reclutadores para filtrar automáticamente los currículums de candidatos que no coinciden con las palabras clave de la oferta de empleo.
* **Zod**: Librería de validación y declaración de esquemas en TypeScript que ayuda a estructurar y limpiar los datos de entrada en las funciones.
* **Deepgram (STT)**: Servicio tecnológico que convierte la voz humana capturada por micrófono en texto legible por máquinas (Speech-to-Text).
* **ElevenLabs (TTS)**: Motor de generación de voz ultra realista por IA que lee texto simulando tonos y acentos humanos (Text-to-Speech).
