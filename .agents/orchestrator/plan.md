# Execution Plan - Nexus SEOS

This document outlines the detailed step-by-step verification plan for building the Nexus Software Engineering Operating System (SEOS).

## Execution Track
We employ a Dual-Track approach:
1. **E2E Testing Track**: Defines the test cases and writes opaque-box E2E tests based on requirements.
2. **Implementation Track**: Implements the code across 6 sequential/parallel milestones.

## Step-by-Step Verification Plan

### Phase 1: Planning and Setup (Orchestrator)
- [ ] Write `PROJECT.md` at root specifying architecture, API routes, and database models.
- [ ] Initialize E2E Testing track.

### Phase 2: Implementation Track Milestones
#### Milestone 1: Backend API Enhancements
- [ ] Implement `ChatController` on `/api/v1/chat` that routes to `GeminiService`.
- [ ] Improve JWT token verification to support cookies in addition to the Authorization header if needed.
- [ ] Create `ConceptProgress` entity and JPA repositories for tracking concept completion.
- [ ] Update `MasteryService` to include concept completion state in mastery calculation (e.g. 20% completion of concepts + 20% completing quizzes + 60% average quiz scores).
- [ ] Implement database seeding runner to pre-populate mock courses, lessons, concepts, and quizzes.
- [ ] Verification: Unit tests for Chat, MasteryService, and seeding. Build succeeds.

#### Milestone 2: React Web Client Setup
- [ ] Bootstrap Vite/React 18 application under `apps/web`.
- [ ] Set up TailwindCSS, router, basic state management.
- [ ] Create layout including a sidebar navigation, header, user profile, and landing/auth routes (Login/Register).
- [ ] Verification: Clean builds, landing page renders, login/register forms work.

#### Milestone 3: Monaco Workbench & Subprocess Execution
- [ ] Embed Monaco editor component in code workspace.
- [ ] Add directory tree navigation pane on the left side of the editor.
- [ ] Create terminal output panel below the editor.
- [ ] Integrate with Backend endpoints for POST `/projects` and POST `/projects/{id}/execute` to run Javascript/Python files and output stdout/stderr.
- [ ] Verification: Writing code in editor runs, subprocess captures stdout/stderr in real-time, sandbox handles timeouts.

#### Milestone 4: SVG Concept Knowledge Graph & Mastery Dashboard
- [ ] Create dashboard homepage displaying mastery score (0-100) and daily learning velocity metrics.
- [ ] Implement SVG-based interactive knowledge graph nodes representing concepts, colored dynamically by user completion/mastery level.
- [ ] Create note-taking panel with markdown rendering and editing.
- [ ] Implement quiz cards that allow users to select answers, submit attempts to backend, and calculate instant score updates.
- [ ] Verification: User dashboard correctly loads metrics, SVG nodes click/expand, note saves persist, quiz submit recalculates mastery.

#### Milestone 5: Multi-Persona AI Chat Drawer
- [ ] Build side drawer UI for chatting with the AI.
- [ ] Provide selector for AI Persona (Tutor, Architect, Debugger, Interviewer) with customized system context styles.
- [ ] Connect chat panel to backend POST `/chat` with persona parameter and render Markdown responses.
- [ ] Verification: Multi-persona chat drawer opens, sends messages, displays Gemini responses properly.

#### Milestone 6: E2E Integration and Hardening
- [ ] Run full E2E test suite (Tiers 1-4).
- [ ] Solve any integration bugs found during E2E test runs.
- [ ] Perform Adversarial Coverage Hardening (Tier 5) with white-box analysis.
- [ ] Verification: 100% of E2E tests pass, no coverage gaps.

## Success Criteria
- Backend builds and runs successfully on port 8080 under `/api/v1`.
- Frontend builds and runs on port 5173.
- All E2E test cases pass successfully.
- Clean Forensic Audit report.
