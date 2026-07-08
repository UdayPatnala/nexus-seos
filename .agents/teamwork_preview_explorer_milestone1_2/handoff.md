# Milestone 1 Backend Design & Implementation Report

## 1. Observation
After reviewing the backend codebase (`apps/api`) under `d:\PROJECT\RBA\nexus-seos`, the following direct observations were made:

### Context Path and Routing Configuration
In `apps/api/src/main/resources/application.properties` (lines 1-3):
```properties
server.port=8080
server.servlet.context-path=/api/v1
```
This implies all endpoints exposed by controllers are prefixed with `/api/v1` (e.g. `@RequestMapping("/courses")` maps to `/api/v1/courses`).

### Security Configuration
In `apps/api/src/main/java/com/nexus/seos/api/SecurityConfig.java` (lines 34-37):
```java
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().permitAll() // Permit all for easier prototype API usage, JWT details extracted in filter
            )
```
This permits all requests by default. However, `JwtAuthenticationFilter` (lines 34-41) intercepts requests and populates the security context with the authenticated user's ID as the principal if a valid JWT is present:
```java
UUID userId = tokenProvider.getUserIdFromToken(jwt);
UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
        userId, null, new ArrayList<>());
```

### Entity Mapping Discrepancy
- In `Concept.java` (lines 21-23) and `Lesson.java` (lines 22-24), relations are mapped using objects:
  ```java
  // In Concept.java
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lesson_id", nullable = false)
  private Lesson lesson;
  ```
- In `Quiz.java` (lines 21-22), relationships are mapped using flat UUID columns:
  ```java
  // In Quiz.java
  @Column(name = "lesson_id", nullable = false)
  private UUID lessonId;
  ```
This discrepancy must be handled carefully when setting up seeding relationships.

### Existing Mastery Calculation Logic
In `apps/api/src/main/java/com/nexus/seos/core/MasteryService.java` (lines 19-49), the original mastery logic calculates performance using quiz attempts in a loop:
```java
    public double calculateMasteryScore(UUID userId, List<UUID> quizIds) {
        if (quizIds.isEmpty()) {
            return 0.0;
        }

        int attemptedCount = 0;
        double totalScoreSum = 0.0;

        for (UUID quizId : quizIds) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
            if (!attempts.isEmpty()) {
                attemptedCount++;
                attempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
                totalScoreSum += attempts.get(0).getScore();
            }
        }
        ...
```

### Existing Gemini Service Implementation
In `apps/api/src/main/java/com/nexus/seos/ai/GeminiService.java` (lines 30-33), the service includes a complete HTTP client interaction mechanism with Gemini REST endpoint and supports a fallback Mock Mode:
```java
    public String generateResponse(String persona, String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "[Mock " + persona + " Mode] Hello! API key is not configured. Here is a simulated response to: \"" + prompt + "\"";
        }
        ...
```

---

## 2. Logic Chain
- **AI Chat Endpoint**: Since `GeminiService` already implements the `generateResponse(persona, prompt)` logic (Obs 5) and the context path is configured as `/api/v1` (Obs 1), exposing a `POST` mapping at `/chat` in a new `ChatController` will fulfill the contract of `POST /api/v1/chat`.
- **Concept Completion Model**: To track concept completions, we require a database schema. Consistent with the other models in the codebase (Obs 4), a flat UUID mapping for `userId` and `conceptId` is preferred. Placing the `ConceptProgressRepository` as a nested class in `Repositories.java` adheres to existing organizational patterns.
- **Integrated Mastery score**: To incorporate concept completion tracking (currently at 0% weight in Obs 4) into the mastery calculations, the service signature for `calculateMasteryScore` must be updated to accept `conceptIds` in addition to `quizIds`. To prevent N+1 database queries when matching concepts, the completions should be loaded in a single batch query (`findByUserId`) and stored in a hash set.
- **Database Seeder**: To populate empty databases on startup, a `CommandLineRunner` is appropriate. We must use `courseRepository.count() == 0` as the trigger. The seeding logic must map relationships properly, observing that `Quiz` uses a raw UUID reference while `Concept` uses an entity relationship (Obs 3).

---

## 3. Caveats
- **Mock Mode Fallback**: If `GEMINI_API_KEY` is not provided in environment variables, the system defaults to mock mode. This must be highlighted to the developer testing the API.
- **Concurrency & SQLite**: SQLite is used for development (Obs 1). It has limited support for concurrent writes, which may result in database locks if requests are made rapidly.
- **JWT Header Null-Safety**: Extracting token headers using `authHeader.substring(7)` can cause crashes if the header format is unexpected. Custom validation is recommended.
- **Lack of Tests**: Currently, there are no tests in `src/test/java`. Bootstrap verification tests are recommended as part of the implementation.

---

## 4. Conclusion & Design Strategy

The recommended implementation strategy involves adding 3 new files, modifying 3 existing files, and setting up verification tests.

### Proposed Code / Target Files

#### 1. Implement AI Chat Controller
* **Target File**: `apps/api/src/main/java/com/nexus/seos/api/ChatController.java` (New)
* **Strategy**: Create a REST controller that validates the authorization header, parses `persona` and `prompt`, and forwards it to `GeminiService`.

```java
package com.nexus.seos.api;

import com.nexus.seos.ai.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final GeminiService geminiService;

    @Autowired
    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        String persona = request.get("persona");
        String prompt = request.get("prompt");

        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required."));
        }
        if (persona == null || persona.trim().isEmpty()) {
            persona = "ORCHESTRATOR";
        }

        String responseText = geminiService.generateResponse(persona, prompt);
        return ResponseEntity.ok(Map.of("response", responseText));
    }
}
```

---

#### 2. Concept Completion Tracking
* **Target File**: `apps/api/src/main/java/com/nexus/seos/database/ConceptProgress.java` (New)
* **Strategy**: Entity defining user concept completions.

```java
package com.nexus.seos.database;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "concept_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "concept_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConceptProgress {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "concept_id", nullable = false)
    private UUID conceptId;

    @Column(name = "completed", nullable = false)
    private boolean completed = true;

    @Column(name = "completed_at")
    private LocalDateTime completedAt = LocalDateTime.now();
}
```

* **Target File**: `apps/api/src/main/java/com/nexus/seos/database/Repositories.java` (Modify)
* **Strategy**: Add `ConceptProgressRepository` interface inside `Repositories` class.

```java
    // Append inside com.nexus.seos.database.Repositories class:
    @Repository
    public interface ConceptProgressRepository extends JpaRepository<ConceptProgress, UUID> {
        List<ConceptProgress> findByUserId(UUID userId);
        Optional<ConceptProgress> findByUserIdAndConceptId(UUID userId, UUID conceptId);
    }
```

* **Target File**: `apps/api/src/main/java/com/nexus/seos/api/CourseController.java` (Modify)
* **Strategy**: Autowire `ConceptProgressRepository`, add `POST /concepts/{conceptId}/complete` endpoint.

```java
    // 1. Inject ConceptProgressRepository and ConceptRepository (already injected)
    private final ConceptProgressRepository conceptProgressRepository;

    // 2. Add Endpoint inside CourseController:
    @PostMapping("/concepts/{conceptId}/complete")
    public ResponseEntity<?> completeConcept(
            @PathVariable UUID conceptId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid authorization header."));
        }
        
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);

        if (!conceptRepository.existsById(conceptId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Concept not found."));
        }

        Optional<ConceptProgress> progressOpt = conceptProgressRepository.findByUserIdAndConceptId(userId, conceptId);
        ConceptProgress progress;
        if (progressOpt.isPresent()) {
            progress = progressOpt.get();
            progress.setCompleted(true);
            progress.setCompletedAt(java.time.LocalDateTime.now());
        } else {
            progress = new ConceptProgress();
            progress.setUserId(userId);
            progress.setConceptId(conceptId);
            progress.setCompleted(true);
        }
        conceptProgressRepository.save(progress);

        return ResponseEntity.ok(Map.of("conceptId", conceptId, "completed", true));
    }
```

---

#### 3. Update Mastery Service and Controller Integration
* **Target File**: `apps/api/src/main/java/com/nexus/seos/core/MasteryService.java` (Modify)
* **Strategy**: Inject `ConceptProgressRepository` and change `calculateMasteryScore` to use the 20% concept completion, 20% quiz completion, and 60% quiz performance formula.

```java
    // Add dependency injection
    private final ConceptProgressRepository conceptProgressRepository;

    @Autowired
    public MasteryService(QuizAttemptRepository quizAttemptRepository, 
                          ConceptProgressRepository conceptProgressRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.conceptProgressRepository = conceptProgressRepository;
    }

    public double calculateMasteryScore(UUID userId, List<UUID> quizIds, List<UUID> conceptIds) {
        if (quizIds.isEmpty() && conceptIds.isEmpty()) {
            return 0.0;
        }

        // 1. Concept Completion Ratio (20% weight)
        double conceptCompletionRatio = 0.0;
        if (!conceptIds.isEmpty()) {
            List<ConceptProgress> progressList = conceptProgressRepository.findByUserId(userId);
            Set<UUID> completedConceptIds = new java.util.HashSet<>();
            for (ConceptProgress progress : progressList) {
                if (progress.isCompleted()) {
                    completedConceptIds.add(progress.getConceptId());
                }
            }
            int completedCount = 0;
            for (UUID conceptId : conceptIds) {
                if (completedConceptIds.contains(conceptId)) {
                    completedCount++;
                }
            }
            conceptCompletionRatio = (double) completedCount / conceptIds.size();
        }

        // 2. Quiz Performance and Completion (20% completion weight + 60% performance weight)
        double quizAttemptRatio = 0.0;
        double averageScore = 0.0;
        if (!quizIds.isEmpty()) {
            int attemptedCount = 0;
            double totalScoreSum = 0.0;

            for (UUID quizId : quizIds) {
                List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
                if (!attempts.isEmpty()) {
                    attemptedCount++;
                    attempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
                    totalScoreSum += attempts.get(0).getScore();
                }
            }
            quizAttemptRatio = (double) attemptedCount / quizIds.size();
            averageScore = attemptedCount > 0 ? (totalScoreSum / attemptedCount) : 0.0;
        }

        // 3. Combined Mastery Score calculation
        double mastery = 0.0;
        if (!conceptIds.isEmpty() && !quizIds.isEmpty()) {
            mastery = (conceptCompletionRatio * 20.0) + (quizAttemptRatio * 20.0) + ((averageScore / 100.0) * 60.0);
        } else if (!conceptIds.isEmpty()) {
            mastery = conceptCompletionRatio * 100.0; // Fallback: no quizzes in course
        } else {
            mastery = (quizAttemptRatio * 40.0) + ((averageScore / 100.0) * 60.0); // Fallback: no concepts in course (original formula)
        }

        return Math.min(100.0, Math.max(0.0, mastery));
    }
```

* **Target File**: `apps/api/src/main/java/com/nexus/seos/api/CourseController.java` (Modify `getMastery` endpoint)
* **Strategy**: Collect course concept IDs and update the service call.

```java
            // Inside CourseController.getMastery loop (lines 85-101):
            List<UUID> quizIds = new ArrayList<>();
            List<UUID> conceptIds = new ArrayList<>();
            List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderNoAsc(course.getId());
            for (Lesson lesson : lessons) {
                List<Quiz> quizzes = quizRepository.findByLessonId(lesson.getId());
                for (Quiz quiz : quizzes) {
                    quizIds.add(quiz.getId());
                }
                List<Concept> concepts = conceptRepository.findByLessonId(lesson.getId());
                for (Concept concept : concepts) {
                    conceptIds.add(concept.getId());
                }
            }

            double score = masteryService.calculateMasteryScore(userId, quizIds, conceptIds);
```

---

#### 4. Add Database Seeder
* **Target File**: `apps/api/src/main/java/com/nexus/seos/database/DatabaseSeeder.java` (New)
* **Strategy**: Implement Spring's `CommandLineRunner` to seed initial courses, lessons, concepts, and quizzes on startup when the database is empty.

```java
package com.nexus.seos.database;

import com.nexus.seos.database.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ConceptRepository conceptRepository;
    private final QuizRepository quizRepository;

    @Autowired
    public DatabaseSeeder(CourseRepository courseRepository, LessonRepository lessonRepository,
                          ConceptRepository conceptRepository, QuizRepository quizRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.conceptRepository = conceptRepository;
        this.quizRepository = quizRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (courseRepository.count() == 0) {
            seedDatabase();
        }
    }

    private void seedDatabase() {
        // Course 1: Object-Oriented Programming (OOP)
        Course oopCourse = new Course();
        oopCourse.setTitle("Object-Oriented Programming");
        oopCourse.setDescription("Learn encapsulation, inheritance, polymorphism, and abstraction.");
        oopCourse.setDifficulty("BEGINNER");
        oopCourse = courseRepository.save(oopCourse);

        // Lesson 1.1: Core Pillars
        Lesson oopLesson1 = new Lesson();
        oopLesson1.setCourse(oopCourse);
        oopLesson1.setTitle("Core Pillars of OOP");
        oopLesson1.setOrderNo(1);
        oopLesson1 = lessonRepository.save(oopLesson1);

        // Concepts
        Concept concept1 = new Concept();
        concept1.setLesson(oopLesson1);
        concept1.setTitle("Encapsulation");
        concept1.setContent("Encapsulation is the mechanism of hiding data fields and exposing them through getter/setter methods.");
        conceptRepository.save(concept1);

        Concept concept2 = new Concept();
        concept2.setLesson(oopLesson1);
        concept2.setTitle("Polymorphism");
        concept2.setContent("Polymorphism allows objects to take multiple forms. Key implementations include method overriding and overloading.");
        conceptRepository.save(concept2);

        // Quiz (note flat UUID for lessonId)
        Quiz oopQuiz1 = new Quiz();
        oopQuiz1.setLessonId(oopLesson1.getId());
        oopQuiz1.setTitle("Core Pillars Quiz");
        quizRepository.save(oopQuiz1);

        // Course 2: Advanced Software Architecture
        Course archCourse = new Course();
        archCourse.setTitle("Software Architecture");
        archCourse.setDescription("Deep dive into microservices, event-driven design, and system scalability.");
        archCourse.setDifficulty("ADVANCED");
        archCourse = courseRepository.save(archCourse);

        // Lesson 2.1: Architectural Patterns
        Lesson archLesson1 = new Lesson();
        archLesson1.setCourse(archCourse);
        archLesson1.setTitle("Architectural Patterns");
        archLesson1.setOrderNo(1);
        archLesson1 = lessonRepository.save(archLesson1);

        Concept concept3 = new Concept();
        concept3.setLesson(archLesson1);
        concept3.setTitle("Microservices");
        concept3.setContent("Microservice architecture structures an application as a collection of loosely coupled, independently deployable services.");
        conceptRepository.save(concept3);

        Quiz archQuiz1 = new Quiz();
        archQuiz1.setLessonId(archLesson1.getId());
        archQuiz1.setTitle("Architecture Patterns Quiz");
        quizRepository.save(archQuiz1);
    }
}
```

---

## 5. Verification Method

### Phase 1: Compile Check
Run the Maven compile step locally inside `apps/api`:
```powershell
mvn clean compile
```

### Phase 2: Unit Testing
Add unit tests inside `apps/api/src/test/java/com/nexus/seos/core/MasteryServiceTest.java`:
Verify the formula correctness using JUnit 5:
- Test 0% completion (empty concept completions and quiz attempts).
- Test 100% concept completion with no quiz attempts (should score 20%).
- Test 100% concept completion, 100% quiz completion, and 100% quiz scores (should score 100%).
- Test fallback scenarios.

Verify execution via:
```powershell
mvn test
```

### Phase 3: Integration Checks via API Endpoint Tests
1. **Chat Endpoint check**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/chat \
     -H "Content-Type: application/json" \
     -d '{"persona": "TUTOR", "prompt": "Explain polymorphism"}'
   ```
   Verify response is formatted like: `{"response": "..."}`.

2. **Database Seeding check**:
   Start the application, then run:
   ```bash
   curl http://localhost:8080/api/v1/courses
   ```
   Verify courses list is seeded.

3. **Concept Completion and Mastery Recalculation check**:
   - Register a student and extract their JWT token.
   - Fetch courses, find a Concept ID, and mark it complete:
     ```bash
     curl -X POST http://localhost:8080/api/v1/courses/concepts/{conceptId}/complete \
       -H "Authorization: Bearer <JWT_TOKEN>"
     ```
   - Request mastery details:
     ```bash
     curl http://localhost:8080/api/v1/courses/mastery \
       -H "Authorization: Bearer <JWT_TOKEN>"
     ```
     Verify that the mastery score reflects the new completion.
