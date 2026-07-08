# Project Context & Observations

## Existing Architecture & Codebase Status
- Monorepo configured with `pnpm` workspaces (root `package.json` and `pnpm-workspace.yaml`).
- Currently, only the `apps/api` folder contains source code (Java Spring Boot REST API).
- SQLite configuration exists in `apps/api/src/main/resources/application.properties` with context path `/api/v1`.
- Authentication using JWT token generation is mostly set up, but `/chat` controller is missing.
- MasteryService is partially implemented with standard average logic, but concept completion tracking is not yet integrated.
- Frontend React Vite application does not exist yet; must bootstrap it under `apps/web`.

## Key Dependencies
- **Backend**: Spring Boot, Spring Security, SQLite, JWT, HttpClient (Java 21 native), Jackson Object Node.
- **Frontend**: React 18, Vite, TailwindCSS v3, Framer Motion, Monaco Editor (or `@monaco-editor/react`), Lucide React.
- **AI Integration**: Gemini REST API.

## Core Concerns
- SQLite database schema needs automatic creation/update. Seeding script is critical to populate courses, lessons, concepts, and quizzes.
- Port conflict: Spring Boot server runs on port 8080.
- React UI has specific components: SVG-based knowledge graph (needs SVG layout rendering), Monaco editor execution workbench (needs real-time subprocess execution).
