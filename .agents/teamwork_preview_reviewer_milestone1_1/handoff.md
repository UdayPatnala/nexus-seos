# Milestone 1 Backend API Review Report

## 1. Observation

### Observation 1: Naive Authorization Header Parsing
In `apps/api/src/main/java/com/nexus/seos/api/CourseController.java` and `apps/api/src/main/java/com/nexus/seos/api/NoteController.java`, the `Authorization` header is processed blindly using `.substring(7)` without verifying if it is non-null, starts with `"Bearer "`, or has a length greater than or equal to 7.
- `CourseController.java` line 65:
  ```java
  String token = authHeader.substring(7);
  ```
- `CourseController.java` line 80:
  ```java
  String token = authHeader.substring(7);
  ```
- `CourseController.java` line 106:
  ```java
  String token = authHeader.substring(7);
  ```
- `NoteController.java` line 27:
  ```java
  String token = authHeader.substring(7);
  ```
- `NoteController.java` line 36:
  ```java
  String token = authHeader.substring(7);
  ```
- `NoteController.java` line 50:
  ```java
  String token = authHeader.substring(7);
  ```

### Observation 2: NullPointerException Vulnerability in Mastery Calculations
- In `apps/api/src/main/java/com/nexus/seos/database/QuizAttempt.java` lines 20-21, the `score` field is defined as a nullable `Double`:
  ```java
  @Column(name = "score")
  private Double score;
  ```
- In `CourseController.java` lines 67-73, a quiz attempt submission doesn't validate whether the `score` is null or bounds-checked before saving:
  ```java
  Double score = request.get("score"); // 0.0 to 100.0

  QuizAttempt attempt = new QuizAttempt();
  attempt.setQuizId(quizId);
  attempt.setUserId(userId);
  attempt.setScore(score);
  quizAttemptRepository.save(attempt);
  ```
- In `apps/api/src/main/java/com/nexus/seos/core/MasteryService.java` lines 52 and 96, the `score` field is auto-unboxed to primitive `double`:
  ```java
  totalScoreSum += mutableAttempts.get(0).getScore();
  ```
  If `getScore()` returns `null`, this line throws a `NullPointerException`.
- In `MasteryService.java` lines 51, 95, and 141, the attempts list is sorted via:
  ```java
  mutableAttempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
  ```
  If `submittedAt` is null in the database, this throws a `NullPointerException`. Also, in `calculateLearningVelocity(UUID userId)` (line 141), the list returned by the repository is sorted in-place, which might throw an `UnsupportedOperationException` if the JPA provider returns an unmodifiable list:
  ```java
  List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(userId);
  ...
  attempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt));
  ```

### Observation 3: Authentication Bypass on Sandbox Execution
In `apps/api/src/main/java/com/nexus/seos/api/ProjectController.java` line 57, the sandbox code execution endpoint does not authenticate the user or check if the user has ownership over the project:
```java
    @PostMapping("/{projectId}/execute")
    public ResponseEntity<?> executeCode(
            @PathVariable UUID projectId,
            @RequestBody Map<String, String> request) {
```
This is in contrast to the list and create endpoints which extract user details from the `Authorization` header.

### Observation 4: Test Suite Verification
Unit tests were executed via the command:
```powershell
C:\Users\udayp\.m2\wrapper\dists\apache-maven-3.9.14\ed7edd442f634ac1c1ef5ba2b61b6d690b5221091f1a8e1123f5fadcc967520d\bin\mvn.cmd clean test
```
The output logs from the execution verify that the build is successful and all tests passed:
```
[INFO] Running com.nexus.seos.core.MasteryServiceTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.054 s -- in com.nexus.seos.core.MasteryServiceTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```

---

## 2. Logic Chain

1. **Robustness of Request Header Handling**:
   - Because `CourseController` and `NoteController` perform `.substring(7)` blindly on the `Authorization` header (Observation 1), a request containing a header with length less than 7 or not matching the format `Bearer <token>` will crash with `StringIndexOutOfBoundsException` (500 Internal Server Error) instead of returning a proper `401 Unauthorized` or `400 Bad Request`.
2. **Mastery Calculations Fragility**:
   - Because the endpoint `/quizzes/{quizId}/submit` does not validate if `score` is present or null (Observation 2), a client can submit a quiz attempt with a missing or null score.
   - If a quiz attempt has a null score, the auto-unboxing operation `totalScoreSum += ...getScore()` inside `MasteryService` will throw a `NullPointerException` (Observation 2).
   - This means a single null score submission will permanently break the `/mastery` calculation for that user (500 Internal Server Error).
   - Similarly, if `submittedAt` is null, sorting attempts using `Comparator.comparing` will crash with a `NullPointerException`.
3. **Security Gap in Code Execution**:
   - Because the `/projects/{projectId}/execute` endpoint does not require authentication or perform user check validations (Observation 3), any client can execute arbitrary Python or JavaScript code on the server host via `/api/v1/projects/{projectId}/execute` without an authorization token, bypassing sandbox user association restrictions.
4. **General Assessment**:
   - Although the basic functional implementation matches the design requirements (courses, lessons, concepts, chat endpoints, and database seeding) and the test suite passes (Observation 4), the lack of validation, error checking, and proper Spring Security principal extraction in the controllers warrants changes to make the backend robust and secure.

---

## 3. Caveats

- **Gemini API Key requirement**: The actual Gemini service integration has a fallback mock mode if the API key is not configured, which we assumed to be correct and verified as functioning for development.
- **Spring Security Configuration**: It is assumed that `.anyRequest().permitAll()` in `SecurityConfig` is temporary for prototyping. However, this relies heavily on controller endpoints manually verifying authentication. Without controller verification (e.g. in `ProjectController` execute endpoint), endpoints are entirely public.

---

## 4. Conclusion

### Quality Review Summary
**Verdict**: REQUEST_CHANGES

#### Findings

##### [Major] Finding 1: Naive Authorization parsing causing crashes
- **Where**: `CourseController.java` (lines 65, 80, 106) and `NoteController.java` (lines 27, 36, 50)
- **Why**: Malformed headers cause `StringIndexOutOfBoundsException` rather than controlled HTTP 401/400.
- **Suggestion**: Use `Authentication` or `@AuthenticationPrincipal` to retrieve the user ID, or implement header validation like in `AuthController.getCurrentUser`.

##### [Major] Finding 2: `NullPointerException` in `MasteryService` calculations
- **Where**: `MasteryService.java` (lines 52, 96, 141) and `CourseController.java` (lines 67-73)
- **Why**: Null values for `score` or `submittedAt` in `QuizAttempt` cause `NullPointerException` during unboxing or sorting, leading to a permanent crash of the user's mastery endpoint.
- **Suggestion**: Validate that `score` is not null and is between `[0, 100]` upon submission. Add null checks in `MasteryService` before unboxing or sorting.

##### [Minor] Finding 3: Direct sorting of Repository list in `calculateLearningVelocity`
- **Where**: `MasteryService.java` (line 141)
- **Why**: Mutating/sorting lists returned by Spring Data JPA repositories in place can throw `UnsupportedOperationException` depending on Hibernate's return collection implementation.
- **Suggestion**: Wrap the repository list in a new `ArrayList` before sorting: `List<QuizAttempt> mutableAttempts = new ArrayList<>(attempts);`.

---

### Adversarial Review Summary
**Overall risk assessment**: HIGH

#### Challenges

##### [Critical] Challenge 1: Arbitrary remote code execution without authentication
- **Assumption challenged**: That the sandbox endpoint `/projects/{projectId}/execute` is restricted to authorized project owners.
- **Attack scenario**: An unauthenticated attacker issues a `POST` request to `/api/v1/projects/{projectId}/execute` containing malicious Python or NodeJS code (e.g. system commands, filesystem access, reverse shells). The server executes the code inside its environment because the controller does not parse or validate authorization.
- **Blast radius**: Full system compromise, unauthorized access to host database, file reading/writing outside sandbox.
- **Mitigation**: Require the `Authorization` header, parse user ID, verify that the `projectId` exists and belongs to the authenticated `userId` before launching `ProcessBuilder`.

##### [High] Challenge 2: Denial of Service on `/mastery` calculations
- **Assumption challenged**: That quiz scores submitted are always numeric values sent by correct client logic.
- **Attack scenario**: A user sends a request to `/quizzes/{quizId}/submit` with `{}` or `{"score": null}`. The backend saves this attempt. Later, any call to `/mastery` by that user fails with an HTTP 500 NPE, locking them out of their dashboard.
- **Blast radius**: Individual user service disruption.
- **Mitigation**: Enforce `@NotNull` and `@Min(0)` / `@Max(100)` validation on quiz score submissions.

---

## 5. Verification Method

1. **Build & Test Execution**:
   Run the following command inside `apps/api` to verify the compilation and unit test suite:
   ```powershell
   C:\Users\udayp\.m2\wrapper\dists\apache-maven-3.9.14\ed7edd442f634ac1c1ef5ba2b61b6d690b5221091f1a8e1123f5fadcc967520d\bin\mvn.cmd clean test
   ```
2. **Manual Code Verification**:
   Inspect the target controllers and services to confirm the identified vulnerabilities are present.
