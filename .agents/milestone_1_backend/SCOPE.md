# Scope: Milestone 1: Backend API Improvements

## Architecture
- Spring Boot Java Backend with SQLite database.
- AI Chat uses Gemini REST API via GeminiService.
- MasteryService calculates mastery score based on quiz attempts and concept completions.
- Seeding on startup via a CommandLineRunner (when DB is empty).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1.1: AI Assistant Chat | Implement POST /api/v1/chat using GeminiService | None | PLANNED |
| 2 | M1.2: Concept Completion Tracking | Add completion entity, repository, endpoints (POST /api/v1/courses/concepts/{conceptId}/complete) | None | PLANNED |
| 3 | M1.3: Mastery Calculation Updates | Update MasteryService for quiz and completion scores | None | PLANNED |
| 4 | M1.4: Database Seeding | Add startup Database Seeding on empty DB | None | PLANNED |
| 5 | M1.5: Compile & Verify | Verify Java Spring Boot builds and tests pass | None | PLANNED |

## Interface Contracts
### 1. AI Assistant Chat
* **POST `/api/v1/chat`**
  * Request: `{"persona": "TUTOR", "prompt": "Explain polymorphism"}`
  * Response: `{"response": "Polymorphism is..."}`

### 2. Concept Completion
* **POST `/api/v1/courses/concepts/{conceptId}/complete`**
  * Request: `{}` (authenticated user)
  * Response: `{"conceptId": "<uuid>", "completed": true}`

### 3. Mastery Calculations
* **GET `/api/v1/courses/mastery`**
  * Response: `{"courses": [{"courseId": "<uuid>", "title": "...", "masteryScore": 75.0}], "velocity": 1.5}`
