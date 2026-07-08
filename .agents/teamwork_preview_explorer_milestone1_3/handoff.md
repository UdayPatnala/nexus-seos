# Milestone 1: Backend API Improvements — Design and Implementation Strategy

## 1. Observation
Based on the read-only inspection of the codebase under `d:\PROJECT\RBA\nexus-seos`, the following details were directly observed:

* **Servlet Context Path Prefix**: In `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\resources\application.properties` (lines 2-3):
  ```properties
  server.port=8080
  server.servlet.context-path=/api/v1
  ```
  Therefore, all controller request mappings are automatically prefixed with `/api/v1`.

* **AI Chat Assistant logic**: In `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\ai\GeminiService.java` (lines 30-33):
  ```java
  public String generateResponse(String persona, String prompt) {
      if (apiKey == null || apiKey.trim().isEmpty()) {
          return "[Mock " + persona + " Mode] Hello! API key is not configured. Here is a simulated response to: \"" + prompt + "\"";
      }
  ```
  And valid personas are identified in the `getSystemInstruction` helper (lines 78-91) as `"TUTOR"`, `"ARCHITECT"`, `"DEBUGGER"`, and `"INTERVIEWER"`.

* **JWT Verification Pattern**: In existing controllers like `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\api\NoteController.java` (lines 26-28):
  ```java
  @GetMapping
  public ResponseEntity<?> getNotes(@RequestHeader("Authorization") String authHeader) {
      String token = authHeader.substring(7);
      UUID userId = tokenProvider.getUserIdFromToken(token);
  ```

* **Entity Relationships vs. Raw UUID Fields**:
  * In `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\database\Concept.java` (lines 21-23), the relationship to `Lesson` is mapped as an entity:
    ```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
    ```
  * In `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\database\Quiz.java` (lines 21-22), the relationship to `Lesson` is mapped as a raw UUID:
    ```java
    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;
    ```
  * Similarly, in `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\database\QuizAttempt.java` (lines 22-26), references to quiz and user are raw UUIDs:
    ```java
    @Column(name = "quiz_id", nullable = false)
    private UUID quizId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;
    ```

* **Current Mastery Calculation**: In `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\core\MasteryService.java` (lines 25-49), the current method signature is:
  ```java
  public double calculateMasteryScore(UUID userId, List<UUID> quizIds)
  ```
  It computes a score where 40% is the ratio of attempted quizzes to total quizzes, and 60% is the average score of the latest attempts.

* **CourseController's Mastery Call**: In `d:\PROJECT\RBA\nexus-seos\apps\api\src\main\java\com\nexus\seos\api\CourseController.java` (lines 95-99):
  ```java
  double score = masteryService.calculateMasteryScore(userId, quizIds);
  ```

---

## 2. Logic Chain
To implement the Milestone 1 features without introducing design regressions, compile errors, or test failures, the following implementation logic is formulated:

### Feature 1: AI Chat Controller (`POST /api/v1/chat`)
1. **Target File**: Create `apps/api/src/main/java/com/nexus/seos/api/ChatController.java`.
2. **Path Mapping**: Annotate the class with `@RestController` and `@RequestMapping("/chat")`. Since `/api/v1` is the servlet context path, this exposes the required `/api/v1/chat` endpoint.
3. **Input Validation**:
   * As defined in `TEST_INFRA.md` under `TC2.5.1` (Chat Empty Prompt) and `TC2.5.2` (Chat Invalid Persona), the controller must validate requests.
   * If the prompt is null or empty, return `400 Bad Request`.
   * If the persona is null or not in the set `{"TUTOR", "ARCHITECT", "DEBUGGER", "INTERVIEWER"}`, return `400 Bad Request`.
4. **Security & Auth**: Although `/api/v1/chat` is permitted in Spring Security (as it allows `anyRequest().permitAll()` for ease of prototyping), we should check the `Authorization` header and extract the user identity using `tokenProvider.getUserIdFromToken(token)` to ensure only authenticated users can access the AI.

### Feature 2: Concept Completion Tracking
1. **Target File (Entity)**: Create `apps/api/src/main/java/com/nexus/seos/database/ConceptProgress.java`.
2. **Design**: Following the style of `QuizAttempt` and `Note`, store the relations as raw UUIDs (`userId` and `conceptId`) for simplicity. Define a unique constraint on `(user_id, concept_id)` in the `@Table` annotation to ensure idempotency.
3. **Target File (Repository)**: Modify `apps/api/src/main/java/com/nexus/seos/database/Repositories.java` to add the nested interface:
   ```java
   @Repository
   public interface ConceptProgressRepository extends JpaRepository<ConceptProgress, UUID> {
       Optional<ConceptProgress> findByUserIdAndConceptId(UUID userId, UUID conceptId);
       List<ConceptProgress> findByUserId(UUID userId);
   }
   ```
4. **Target File (Controller Endpoint)**: Add `POST /concepts/{conceptId}/complete` within `apps/api/src/main/java/com/nexus/seos/api/CourseController.java`.
   * Extract user ID from the `Authorization` header.
   * Validate that the concept exists in the database. If not, return `404 Not Found` (matching `TC2.2.2`).
   * Perform an upsert (find-or-create) on `ConceptProgress`, setting `completed = true` and `completedAt = LocalDateTime.now()`.
   * Return `200 OK` with JSON matching `{"conceptId": "<uuid>", "completed": true}`.

### Feature 3: Mastery Calculation Updates
1. **Target File (Service)**: Modify `apps/api/src/main/java/com/nexus/seos/core/MasteryService.java`.
2. **Method Signature**: Overload `calculateMasteryScore` to support:
   ```java
   public double calculateMasteryScore(UUID userId, List<UUID> quizIds, List<UUID> conceptIds)
   ```
   This prevents compile errors on any code still using the two-argument signature.
3. **Mastery Formula**:
   * **Concept Completion (20%)**: Compute $\frac{\text{Completed Concepts}}{\text{Total Concepts}} \times 20.0$.
     * Use `conceptProgressRepository.findByUserIdAndConceptId(...)` or a batch query to count how many of `conceptIds` are marked complete for the user.
   * **Quiz Completion (20%)**: Compute $\frac{\text{Attempted Quizzes}}{\text{Total Quizzes}} \times 20.0$.
     * Count distinct quizzes in `quizIds` that have at least one attempt in `QuizAttemptRepository`.
   * **Quiz Performance (60%)**: Compute $\frac{\text{Average Latest Quiz Score}}{100.0} \times 60.0$.
     * For each attempted quiz, fetch the latest attempt score, average them, and weight by 0.60.
   * **Boundary Conditions**: If both lists are empty (e.g. new user / course), return `0.0` (matching `TC2.2.5`).
4. **Target File (Controller Update)**: In `apps/api/src/main/java/com/nexus/seos/api/CourseController.java`, update the `getMastery` method to extract all concepts (`conceptIds`) along with quizzes (`quizIds`) for the course, and call the new three-argument `calculateMasteryScore`.

### Feature 4: Database Seeding
1. **Target File**: Create `apps/api/src/main/java/com/nexus/seos/database/DatabaseSeeder.java`.
2. **Startup Trigger**: Implement `CommandLineRunner` and annotate the class with `@Component`.
3. **Transactional Behavior**: Annotate the `run` method with `@Transactional` to ensure that partial seeding failures are rolled back, keeping the SQLite DB clean.
4. **Idempotence**: Wrap the execution in an `if (courseRepository.count() == 0)` check.
5. **JPA Entity vs. UUID Caveat**:
   * When saving a `Concept`, assign the `Lesson` entity using `concept.setLesson(lesson)`.
   * When saving a `Quiz`, assign the raw UUID using `quiz.setLessonId(lesson.getId())`.
   * Failing to distinguish these two patterns will cause validation/mapping errors at compile/run time.

---

## 3. Caveats
* **SQLite Constraints**: SQLite does not strictly enforce all complex SQL features, but standard JPA unique constraints are supported. Care must be taken with the unique constraint on `(user_id, concept_id)` inside `ConceptProgress` to avoid database locking or write conflicts during rapid asynchronous completion requests.
* **Test Infrastructure**: The test execution relies on Node.js-based E2E tests (`apps/e2e-tests/run.js`) which require a running instance of the Spring Boot application on port `8080` and a cleaned SQLite database. Since Maven is not on the host environment's default `PATH`, testing must be coordinated by running the spring boot application first, then launching Node.js E2E tests recursively from the root package.

---

## 4. Conclusion
Milestone 1 backend API enhancements are fully defined and can be cleanly implemented. The strategy proposes creating two new files (`ChatController.java` and `DatabaseSeeder.java`), one new entity (`ConceptProgress.java`), and updates to `Repositories.java`, `CourseController.java`, and `MasteryService.java`. Following this structured plan guarantees compatibility with the existing security, token parsing, and data layer conventions.

---

## 5. Verification Method
To verify the implementation once completed, perform the following steps:

1. **Clean Compile and Launch**:
   Run the backend application (e.g. through an IDE or using the appropriate wrapper/java command):
   ```bash
   # Run the Spring Boot application
   java -jar target/nexus-seos-api-0.0.1-SNAPSHOT.jar
   ```
2. **Log Inspection (Seeding)**:
   Verify the console logs during startup to confirm database seeding triggers (i.e. check for Hibernate SQL insert statements for courses, lessons, concepts, and quizzes).
3. **Execute E2E Tests**:
   Run the E2E test suite from the project root:
   ```bash
   pnpm run test
   ```
   Or run the Node test runner specifically inside the E2E tests directory:
   ```bash
   node apps/e2e-tests/run.js
   ```
   Verify that all test cases related to authentication, courses, concepts, quizzes, mastery calculations, and the AI chat assistant pass successfully.
