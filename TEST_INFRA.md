# E2E Test Infra: Nexus SEOS

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Real-world) |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Auth & Session | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Course & Concepts | ORIGINAL_REQUEST §R1 & §R3 | 5 | 5 | ✓ | ✓ |
| 3 | Notes Management | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Sandbox & Execution | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | AI Persona Chat | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Node.js built-in test runner (`node --test`), which is standard, zero-dependency, and extremely fast.
- **Directory Layout**:
  - `apps/e2e-tests/`
    - `run.js` (Test runner script)
    - `tests/`
      - `auth.test.js` (Tier 1 & 2 Auth tests)
      - `courses.test.js` (Tier 1 & 2 Course & Concepts tests)
      - `notes.test.js` (Tier 1 & 2 Notes tests)
      - `sandbox.test.js` (Tier 1 & 2 Sandbox & Execution tests)
      - `chat.test.js` (Tier 1 & 2 AI Chat tests)
      - `integration.test.js` (Tier 3 Cross-Feature & Tier 4 Workload tests)
    - `utils/`
      - `api-client.js` (Helper for making backend REST calls)
      - `db-cleaner.js` (Helper to clean/reset SQLite database between tests)

## Coverage Thresholds
- Tier 1: 25 test cases (5 per feature)
- Tier 2: 25 test cases (5 per feature)
- Tier 3: 5 cross-feature combination test cases
- Tier 4: 5 real-world workload scenarios
- **Total test suite: 60 test cases**

---

## Detailed Test Cases

### Tier 1: Feature Coverage (25 Test Cases)

#### F1: Authentication & Authorization
- **TC1.1.1 (Register Happy Path)**: Register a new user with valid details, verify JWT is returned in the response.
- **TC1.1.2 (Login Happy Path)**: Log in with valid credentials, verify JWT is returned in the response.
- **TC1.1.3 (Fetch Current User)**: Call GET `/auth/me` with valid JWT, verify that the returned user details match the registration details.
- **TC1.1.4 (Different User Sessions)**: Register two different users, verify they receive different profile/me responses.
- **TC1.1.5 (Auth Header & Cookie Support)**: Verify GET `/auth/me` works using both `Authorization: Bearer <token>` header and cookie auth.

#### F2: Course & Concept Management
- **TC1.2.1 (Get Courses)**: Fetch all courses, verify the list is returned and has expected format.
- **TC1.2.2 (Get Lessons)**: Fetch lessons for a course, verify that they are sorted by order number.
- **TC1.2.3 (Get Concepts)**: Fetch concepts for a lesson, verify fields are present.
- **TC1.2.4 (Complete Concept)**: Mark a concept as completed, verify the returned completion response.
- **TC1.2.5 (Submit Quiz)**: Submit a quiz score, verify the response message indicating successful submission.

#### F3: Notes Management
- **TC1.3.1 (Create Note)**: Save a new Markdown note for a concept, verify that it is persisted and has correct contents.
- **TC1.3.2 (Get Notes List)**: Fetch all notes for the user, verify that the created note is in the list.
- **TC1.3.3 (Get Note by Concept)**: Fetch a note specifically by its concept ID, verify that contents match.
- **TC1.3.4 (Update Note)**: Modify an existing note, verify that updated content is successfully saved.
- **TC1.3.5 (Note Markdown Rendering)**: Save complex markdown (headers, codeblocks, formatting), verify it parses and retrieves correctly.

#### F4: Sandbox Project & Code Execution
- **TC1.4.1 (Create Project)**: Create a new project, verify UUID is returned.
- **TC1.4.2 (Get Projects)**: Fetch the user's projects, verify the created project is in the list.
- **TC1.4.3 (Execute JavaScript)**: Execute simple JavaScript (`console.log('test')`), verify stdout contains 'test' and status is SUCCESS.
- **TC1.4.4 (Execute Python)**: Execute simple Python (`print('hello')`), verify stdout contains 'hello' and status is SUCCESS.
- **TC1.4.5 (Execution Logs)**: Verify execution history list shows correct execution details.

#### F5: AI Persona Chat Assistant
- **TC1.5.1 (Tutor Persona)**: Send prompt to `/chat` with TUTOR persona, verify custom guidance response.
- **TC1.5.2 (Architect Persona)**: Send prompt to `/chat` with ARCHITECT persona, verify architecture advice response.
- **TC1.5.3 (Debugger Persona)**: Send prompt to `/chat` with DEBUGGER persona, verify debugging tips response.
- **TC1.5.4 (Interviewer Persona)**: Send prompt to `/chat` with INTERVIEWER persona, verify mock interview question response.
- **TC1.5.5 (Chat Request Structure)**: Verify `/chat` endpoint accepts prompt and persona parameters and returns standard response JSON format.

---

### Tier 2: Boundary & Edge Cases (25 Test Cases)

#### F1: Authentication & Authorization
- **TC2.1.1 (Register Email Duplicate)**: Attempt to register with an already existing email, verify it returns 400 Bad Request or 409 Conflict.
- **TC2.1.2 (Login Invalid Password)**: Attempt to log in with an invalid password, verify it returns 401 Unauthorized.
- **TC2.1.3 (Auth Token Expired/Malformed)**: Send an invalid or malformed JWT token, verify it returns 401/403.
- **TC2.1.4 (Register Invalid Inputs)**: Attempt registration with empty email/password, verify validation errors (400 Bad Request).
- **TC2.1.5 (Access Secure Route Without Token)**: Attempt to call GET `/notes` without auth header/cookie, verify 401/403.

#### F2: Course & Concept Management
- **TC2.2.1 (Get Lessons Invalid Course)**: Fetch lessons for a non-existent course UUID, verify 404 Not Found.
- **TC2.2.2 (Complete Non-existent Concept)**: Mark a non-existent concept ID as completed, verify 404.
- **TC2.2.3 (Submit Quiz Invalid Score)**: Submit quiz score with invalid values (negative or > 100), verify validation error (400).
- **TC2.2.4 (Quiz Out of Order Attempt)**: Attempt quiz submission for a non-existent quiz, verify 404.
- **TC2.2.5 (Get Mastery Empty State)**: Verify mastery calculation for new user with zero completed concepts/quizzes returns 0.0.

#### F3: Notes Management
- **TC2.3.1 (Get Note Non-existent Concept)**: Fetch note for a non-existent concept UUID, verify it returns 404 or empty note.
- **TC2.3.2 (Create Note Empty Body)**: Save note with empty markdown content, verify it's allowed or handled gracefully.
- **TC2.3.3 (Create Note Duplicate Concept)**: Attempt saving multiple notes for the same concept ID, verify that it updates the existing note instead of duplicating (idempotency).
- **TC2.3.4 (Access Note of Another User)**: Attempt to fetch a note belonging to another user's concept, verify access is denied.
- **TC2.3.5 (Create Note Invalid Concept ID)**: Save note with non-existent concept ID, verify 400/404 response.

#### F4: Sandbox Project & Code Execution
- **TC2.4.1 (Execute Code Infinite Loop)**: Execute code with an infinite loop (e.g., `while(true){}`), verify execution times out and terminates gracefully.
- **TC2.4.2 (Execute Code Syntax Error)**: Execute code with syntax error, verify stderr contains error details and status is ERROR/FAILURE.
- **TC2.4.3 (Execute Code Invalid Language)**: Execute with unsupported language (e.g. `c++`), verify 400 Bad Request.
- **TC2.4.4 (Execute Large Output)**: Execute code printing a massive amount of text, verify stdout doesn't crash the server.
- **TC2.4.5 (Execute Sandbox Escape)**: Attempt file writes outside sandbox or dangerous system calls, verify they are blocked or fail gracefully.

#### F5: AI Persona Chat Assistant
- **TC2.5.1 (Chat Empty Prompt)**: Send chat with empty prompt, verify 400 Bad Request.
- **TC2.5.2 (Chat Invalid Persona)**: Send chat with invalid/unsupported persona name, verify 400 Bad Request.
- **TC2.5.3 (Chat Token Limit Prompt)**: Send very long prompt to `/chat`, verify API handles it or rejects with appropriate status (no crash).
- **TC2.5.4 (Chat Mock/Fallback Mode)**: Verify that if the Gemini API key is missing or invalid, the backend falls back to a rules-based mock assistant instead of crashing.
- **TC2.5.5 (Chat Security Filtering)**: Send prompt containing dangerous commands or prompt injection, verify it is blocked, sanitized, or handled gracefully.

---

### Tier 3: Cross-Feature Combinations (5 Test Cases)

- **TC3.1 (Auth + Notes Isolation)**: User A creates a note. User B logs in, verifies that they cannot list, view, or update User A's note.
- **TC3.2 (Concepts + Quiz + Mastery)**: Student completes a fraction of concepts and submits quiz scores, verify mastery score updates dynamically to reflect learning achievements.
- **TC3.3 (Notes + AI Tutor)**: Query the AI Tutor about a specific concept, then save the response as a note for that concept, verify the note persists.
- **TC3.4 (Project Execution + AI Debugger)**: Run a Python script that errors, capture stderr, feed it to the AI Debugger persona, verify the debugger suggests a fix.
- **TC3.5 (Auth + Project Isolation)**: Verify sandbox projects are isolated; User B cannot list or execute code in User A's project.

---

### Tier 4: Real-world Workload Scenarios (5 Test Cases)

- **TC4.1 (Complete Student Journey)**:
  1. Register new student account.
  2. Fetch courses list, select a course.
  3. Load lessons and study concepts sequentially.
  4. Save notes on concepts.
  5. Take lesson quiz and submit score.
  6. Verify dashboard shows updated mastery progress.
- **TC4.2 (Interactive Coding Lab)**:
  1. Student logs in.
  2. Creates sandbox project.
  3. Writes JavaScript code using active concepts.
  4. Executes code, receives syntax error.
  5. Asks AI Debugger to explain the error.
  6. Fixes code, re-runs execution successfully.
  7. Completes concept and quiz.
- **TC4.3 (AI-Assisted Study Session)**:
  1. Student studies a programming lesson.
  2. Queries AI Architect for design advice on the topic.
  3. Queries AI Tutor to explain specific concept details.
  4. Saves custom notes summarizing the advice.
  5. Verifies saved notes list.
- **TC4.4 (Code Review and Interview Prep)**:
  1. Student requests Mock Interview question from Interviewer persona.
  2. Write code response in sandbox editor.
  3. Run tests in sandbox to verify code correctness.
  4. Sends sandbox code execution results to Tutor for review.
  5. Saves review notes to DB.
- **TC4.5 (Multi-Course Progress Tracker)**:
  1. Register student.
  2. Access Course A, complete concepts, submit quiz.
  3. Access Course B, complete concepts, submit quiz.
  4. Verify mastery endpoint calculates scores correctly across multiple distinct courses and daily learning velocity reflects study pattern.
