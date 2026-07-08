# Original User Request

## Initial Request — 2026-07-08T09:20:13+05:30

Build the Nexus Software Engineering Operating System (SEOS) consisting of a React/Vite Monaco frontend and a Java Spring Boot backend featuring a Mastery Science Engine, SQLite database storage, and a Gemini-powered multi-persona AI assistant team (Tutor, Architect, Debugger, Interviewer).

Working directory: d:/PROJECT/RBA/nexus-seos
Integrity mode: demo

## Requirements

### R1. Java Spring Boot Backend
- Implement a Java 21+ Spring Boot REST API server running on port 8080 under `/api/v1`.
- Setup database access with SQLite and standard JPA Repositories for Users, Profiles, Courses, Lessons, Concepts, Notes, Projects, Executions, Quizzes, and QuizAttempts.
- Implement JWT token generation and validation for cookie-based/Authorization header auth.
- Expose endpoints:
  - Auth: POST `/auth/register`, POST `/auth/login`, GET `/auth/me`
  - Courses: GET `/courses`, GET `/courses/{id}/lessons`, GET `/courses/lessons/{id}/concepts`, GET `/courses/lessons/{id}/quizzes`
  - Notes: GET `/notes`, GET `/notes/concept/{conceptId}`, POST `/notes`
  - Projects & Executions: GET `/projects`, POST `/projects`, POST `/projects/{id}/execute` (supporting execution of JS and Python code via system subprocesses)
  - AI Assistant Chat: POST `/chat` interfacing with the Gemini REST API (or Google GenAI SDK if available) to provide responses from Tutor, Architect, Debugger, or Interviewer.

### R2. React Web UI Client
- Create a web dashboard using React 18, Vite, TailwindCSS v3, and Framer Motion.
- Embed a Monaco Editor with file tree directory structure panel and terminal execution pane showing execution results.
- Implement an interactive SVG-based concept knowledge graph displaying user concepts and mastery levels.
- Integrate note-taking Markdown editing components and lesson quiz submission cards.
- Add an AI persona chat drawer allowing the student to select Tutor, Architect, Debugger, or Interviewer.

### R3. Mastery science engine
- Implement core logic to calculate mastery scores (0-100) per course using quiz scores and concept completion state.
- Track daily learning velocity over time.

## Acceptance Criteria

### Authentication & Authorization
- [ ] User can sign up, login, and access secure routes using a valid JWT token.

### Course & Notes Management
- [ ] Student can fetch courses, view lessons, study concepts, and save custom Markdown notes that persist to the DB.

### Code Execution Workbench
- [ ] Student can write Javascript or Python code in the Monaco Editor and execute it, capturing stdout/stderr output in real time.

### AI Persona Assistants
- [ ] Student can chat with four distinct AI personas (Tutor, Architect, Debugger, Interviewer) and receive customized guidance powered by Gemini.

### Mastery Dashboard
- [ ] User dashboard shows mastery status (0-100) and learning velocity based on database attempts.

## Follow-up — 2026-07-08T03:58:15Z

Status check: please provide the latest progress and check if any execution files or docker-compose manifests are ready.
