# CHANGELOG

## [Unreleased] - 2026-07-21
### Added
- **7-Stage Adaptive Homework Learning Engine**:
  - Implemented 7-stage learning journey (Quick Recall, Concept Verification, Concept Application, Practical Code, Real-World Scenarios, FAANG Challenge Mode, Metacognitive Reflection).
  - Added TypeScript data contracts & models in `homeworkTypes.ts`.
  - Added rich static homework assignments in `homeworkData.ts`.
  - Added Spring Boot JPA entities `Homework.java` & `HomeworkSubmission.java`.
  - Added `HomeworkRepository.java`, `HomeworkSubmissionRepository.java`, and `HomeworkService.java`.
  - Added `HomeworkEngine.tsx` master component and embedded it into `CoursesPage.tsx`.

### Refactored & Improved
- **Code Audit & Type Hardening**:
  - Hardened TypeScript interfaces for submission callbacks (`StageCompletionCallback`, `StageAnswerPayload`, `AIEvaluationReport`).
  - Added smooth Framer Motion `AnimatePresence` page & tab transitions to `HomeworkEngine.tsx`.
  - Polished error handling, loading states, and keyboard accessibility across all 7 stage components.
