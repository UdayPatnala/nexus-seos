## 2026-07-08T03:55:14Z

You are the E2E Test Implementer for Nexus SEOS.
Your working directory is: d:\PROJECT\RBA\nexus-seos\.agents\worker_e2e_tests_1
Role: E2E Test Implementer

Your mission is to write the complete E2E testing framework, test suite, database seeding/cleaning tools, and execution runner for the project.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks:
1. Create the `apps/e2e-tests` directory if it does not exist.
2. Write `apps/e2e-tests/package.json` with the following content:
{
  "name": "e2e-tests",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node run.js"
  }
}

3. Write `apps/e2e-tests/utils/db-manager.py` to handle database seeding and cleaning. It should use Python's built-in `sqlite3` library to seed the SQLite database `../../nexus-seos.db` with static UUIDs:
   - Course: "a0e0a0e0-0000-0000-0000-000000000001", Title: "Introduction to Software Engineering", Difficulty: "BEGINNER"
   - Lesson: "a0e0a0e0-0000-0000-0000-000000000002", Title: "Git Version Control", OrderNo: 1
   - Concept 1: "a0e0a0e0-0000-0000-0000-000000000003", Title: "Repository Basics"
   - Concept 2: "a0e0a0e0-0000-0000-0000-000000000004", Title: "Branching & Merging"
   - Quiz: "a0e0a0e0-0000-0000-0000-000000000005", Title: "Git Basics Quiz"
   It should support two arguments: `seed` (checks if tables exist and seeds if not already seeded) and `clean` (clears user accounts, quiz attempts, notes, projects, executions, and profiles tables).

4. Write `apps/e2e-tests/utils/api-client.js`. It should export helper functions that perform fetch operations on `http://localhost:8080/api/v1` for Auth, Courses/Lessons/Concepts/Quizzes/Mastery, Notes, Sandbox Projects/Execution, and AI Chat, passing JWT token headers as necessary.

5. Write the following test files in `apps/e2e-tests/tests/` using Node's built-in `node:test` and `node:assert`:
   - `auth.test.js` (Tier 1 & 2 Auth tests)
   - `courses.test.js` (Tier 1 & 2 Course & Concepts tests)
   - `notes.test.js` (Tier 1 & 2 Notes tests)
   - `sandbox.test.js` (Tier 1 & 2 Sandbox & Execution tests)
   - `chat.test.js` (Tier 1 & 2 AI Chat tests)
   - `integration.test.js` (Tier 3 Cross-Feature & Tier 4 Workload tests)
   Ensure that each test case has proper assertions. If the backend does not implement some endpoints yet (e.g. `/chat`, `/courses/concepts/{id}/complete`), the tests should expect the behavior as per interface contracts (so they will fail or succeed depending on whether the endpoints are complete, which is correct). To ensure tests are runnable and give clean reports, use unique credentials for registration.

6. Write `apps/e2e-tests/run.js` which:
   - Kills any process currently listening on port 8080 (to prevent port conflicts).
   - Starts the Spring Boot backend using `mvn spring-boot:run` in `apps/api`.
   - Polls `http://localhost:8080/api/v1/courses` until the server starts up (timeout after 60s).
   - Executes `python utils/db-manager.py seed` and `python utils/db-manager.py clean` to set up the DB.
   - Spawns the test runner via `node --test tests/auth.test.js tests/courses.test.js tests/notes.test.js tests/sandbox.test.js tests/chat.test.js tests/integration.test.js`.
   - Cleans up and stops the Spring Boot backend process (and kills port 8080 to avoid orphaned java processes).
   - Exits with 0 if tests pass, and non-zero otherwise.

Verify that the files compile, and try to build the backend. Document your results in `handoff.md` in your working directory and notify me when you are done.
