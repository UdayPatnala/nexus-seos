# Project: Nexus SEOS (Software Engineering Operating System)

## Architecture
Nexus SEOS is a monorepo consisting of:
- **Backend (apps/api)**: A Java 21 Spring Boot REST API using SQLite database, standard JPA repositories, Spring Security, and JWT for token-based authentication. It connects to the Gemini REST API for tutoring, architecture advice, debugging, and interview preparation.
- **Frontend (apps/web)**: A React 18, Vite, Tailwind CSS v3, and Framer Motion single-page application. Features include a Monaco Editor workspace, SVG concept knowledge graph, quiz engine, markdown note-taking editor, and an AI chat assistant drawer.
- **Data Flow**:
  - The client authenticates via JWT (Authorization header `Bearer <token>` or cookie).
  - The client fetches course materials, concepts, notes, and mastery calculations.
  - Code written in the Monaco Editor is sent to the backend, which compiles/runs it inside a temporary file sandbox and returns stdout/stderr.
  - AI queries are routed through the backend to Gemini REST endpoint using the configured API key.

## Code Layout
- `apps/api/src/main/java/com/nexus/seos`
  - `/api`: REST Controllers, Security configurations, JWT utilities.
  - `/core`: Core business logic (MasteryService, etc.).
  - `/database`: JPA Entities, Repositories, Database structures.
  - `/ai`: AI persona orchestration and Gemini API client.
- `apps/web`
  - `/src/components`: Reusable UI elements (KnowledgeGraph, QuizCard, Editor, Terminal, NotesPanel, PersonaChat).
  - `/src/pages`: Main routing pages (Login, Dashboard, Workbench, Admin/Seeding if any).
  - `/src/context`: React Context for Auth, Active State, and Theme.
  - `/src/services`: API client functions (Auth, Chat, Courses, Notes, Projects).
- `.agents/`
  - Coordinator and worker metadata files.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend API Improvements | Implement `/chat` endpoint, database seeding, concept completion tracking, and update MasteryService. | None | IN_PROGRESS (Conv: 8846384b-bc63-4e07-a9a7-4e3fca1817a8) |
| 2 | Frontend Bootstrap & UI Layout | Create `apps/web` Vite React application with Tailwind CSS, Framer Motion, layout structures, and Auth pages. | M1 | PLANNED |
| 3 | Monaco Code Sandbox Integration | Implement code execution UI, directories pane, Terminal output, and integrate with project execution API. | M2 | PLANNED |
| 4 | SVG Concept Knowledge Graph | Implement interactive SVG node tree representing concepts, quiz submission cards, and Mastery Dashboard view. | M3 | PLANNED |
| 5 | AI Multi-Persona Chat Drawer | Implement Chat Drawer UI, selector for Tutor/Architect/Debugger/Interviewer, and connect to `/chat` API. | M4 | PLANNED |
| 6 | E2E Testing & Hardening | Establish test harness, verify all scenarios (Tiers 1-4), perform white-box security/correctness hardening (Tier 5). | M1-M5 | IN_PROGRESS (Conv: 133ec928-dd4d-42a6-8c13-c408ef1b50be) |

## Interface Contracts

### Rest API Endpoints

#### 1. Authentication
* **POST `/api/v1/auth/register`**
  * Request: `{"email": "student@nexus.edu", "password": "password123", "fullName": "Jane Doe"}`
  * Response: `{"token": "<jwt-token>", "email": "student@nexus.edu", "fullName": "Jane Doe"}`
* **POST `/api/v1/auth/login`**
  * Request: `{"email": "student@nexus.edu", "password": "password123"}`
  * Response: `{"token": "<jwt-token>", "email": "student@nexus.edu", "fullName": "Jane Doe"}`
* **GET `/api/v1/auth/me`**
  * Request Header: `Authorization: Bearer <jwt-token>`
  * Response: `{"id": "<uuid>", "email": "student@nexus.edu", "fullName": "Jane Doe", "bio": "", "avatarUrl": ""}`

#### 2. Courses & Concepts
* **GET `/api/v1/courses`**
  * Response: List of courses.
* **GET `/api/v1/courses/{id}/lessons`**
  * Response: List of lessons for the course, sorted by order number.
* **GET `/api/v1/courses/lessons/{id}/concepts`**
  * Response: List of concepts in the lesson.
* **GET `/api/v1/courses/lessons/{id}/quizzes`**
  * Response: List of quizzes in the lesson.
* **POST `/api/v1/courses/quizzes/{quizId}/submit`**
  * Request: `{"score": 85.0}`
  * Response: `{"message": "Quiz attempt submitted successfully.", "score": 85.0}`
* **POST `/api/v1/courses/concepts/{conceptId}/complete`**
  * Request: `{}`
  * Response: `{"conceptId": "<uuid>", "completed": true}`
* **GET `/api/v1/courses/mastery`**
  * Response: `{"courses": [{"courseId": "<uuid>", "title": "...", "masteryScore": 75.0}], "velocity": 1.5}`

#### 3. Notes
* **GET `/api/v1/notes`**
  * Response: List of notes saved by the user.
* **GET `/api/v1/notes/concept/{conceptId}`**
  * Response: `{"id": "<uuid>", "conceptId": "<uuid>", "markdown": "# Custom Note"}`
* **POST `/api/v1/notes`**
  * Request: `{"conceptId": "<uuid>", "markdown": "# Custom Note"}`
  * Response: Saved Note entity.

#### 4. Projects & Execution
* **GET `/api/v1/projects`**
  * Response: List of user's sandbox projects.
* **POST `/api/v1/projects`**
  * Request: `{"name": "My Sandbox"}`
  * Response: Saved Project entity.
* **POST `/api/v1/projects/{id}/execute`**
  * Request: `{"code": "console.log('Hello');", "language": "javascript"}` (or `python`)
  * Response: `{"id": "<uuid>", "projectId": "<uuid>", "language": "javascript", "stdout": "Hello\n", "stderr": "", "status": "SUCCESS"}`

#### 5. AI Assistant Chat
* **POST `/api/v1/chat`**
  * Request: `{"persona": "TUTOR", "prompt": "Explain polymorphism"}`
  * Response: `{"response": "Polymorphism is..."}`
