# Milestone 1 Backend Design and Implementation Report

This report outlines the design, implementation strategy, and code templates for the four backend features of Milestone 1 in the Nexus SEOS platform.

---

## 1. Observation

Direct observations from the `d:\PROJECT\RBA\nexus-seos` codebase:

### 1.1 Context Path & Port Configuration
In `apps/api/src/main/resources/application.properties` (lines 2-3):
```properties
server.port=8080
server.servlet.context-path=/api/v1
```
This requires that all controller mappings omit `/api/v1` in their `@RequestMapping` annotations, as the context path prefix `/api/v1` is automatically prepended by Spring Boot.

### 1.2 Security Configuration
In `apps/api/src/main/java/com/nexus/seos/api/SecurityConfig.java` (lines 34-38):
```java
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().permitAll() // Permit all for easier prototype API usage, JWT details extracted in filter
            )
```
All endpoints are permitted by default for prototype ease, but incoming JWTs are still parsed and authentication is set in the context via `JwtAuthenticationFilter.java` (lines 31-41) if the token is present in the `Authorization` header.

### 1.3 AI Chat Integration
In `apps/api/src/main/java/com/nexus/seos/ai/GeminiService.java` (lines 20-33):
```java
    @Value("${gemini.api.key:#{systemEnvironment['GEMINI_API_KEY']}}")
    private String apiKey;
...
    public String generateResponse(String persona, String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "[Mock " + persona + " Mode] Hello! API key is not configured. Here is a simulated response to: \"" + prompt + "\"";
        }
```
If the API key is not set, `GeminiService` falls back to a rules-based mock assistant instead of throwing an exception.

### 1.4 Existing Mastery Calculation Pattern
In `apps/api/src/main/java/com/nexus/seos/api/CourseController.java` (lines 85-99):
```java
        for (Course course : courses) {
            List<UUID> quizIds = new ArrayList<>();
            List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderNoAsc(course.getId());
            for (Lesson lesson : lessons) {
                List<Quiz> quizzes = quizRepository.findByLessonId(lesson.getId());
                for (Quiz quiz : quizzes) {
                    quizIds.add(quiz.getId());
                }
            }

            double score = masteryService.calculateMasteryScore(userId, quizIds);
```
And in `apps/api/src/main/java/com/nexus/seos/core/MasteryService.java` (lines 25-49):
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
                // Find latest attempt score
                attempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
                totalScoreSum += attempts.get(0).getScore(); // Assuming score is 0.0 to 100.0
            }
        }

        double attemptRatio = (double) attemptedCount / quizIds.size();
        double averageScore = attemptedCount > 0 ? (totalScoreSum / attemptedCount) : 0.0;

        // Mastery Score formula: 40% completion weight + 60% performance weight
        double mastery = (attemptRatio * 40.0) + ((averageScore / 100.0) * 60.0);
        return Math.min(100.0, Math.max(0.0, mastery));
    }
```

### 1.5 Database Structure and Bidirectional Relationships
In `apps/api/src/main/java/com/nexus/seos/database/Course.java` (lines 35-36):
```java
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Lesson> lessons;
```
In `apps/api/src/main/java/com/nexus/seos/database/Lesson.java` (lines 21-24, 32-33):
```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Concept> concepts;
```
In `apps/api/src/main/java/com/nexus/seos/database/Concept.java` (lines 21-23):
```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
```
None of these bidirectional relationships utilize `@JsonIgnore` or `@JsonIgnoreProperties`, meaning Jackson attempts to serialize them recursively.

---

## 2. Logic Chain

The proposed design decisions are derived from the above observations:

1. **Endpoint Path Mapping**: Since `application.properties` configures the context path as `/api/v1` (Observation 1.1), our controllers will use relative request mappings (e.g., `@RequestMapping("/chat")` to expose `/api/v1/chat` and `@PostMapping("/concepts/{conceptId}/complete")` to expose `/api/v1/courses/concepts/{conceptId}/complete`).
2. **AI Chat Controller Validation**: The `/chat` endpoint must enforce prompt and persona validations. `GeminiService` defines valid personas as `TUTOR`, `ARCHITECT`, `DEBUGGER`, and `INTERVIEWER`. The controller must validate input strings and return `400 Bad Request` with structured error messages for invalid or empty inputs, while delegating valid requests to the existing `GeminiService.generateResponse()` method (Observation 1.3).
3. **Database Relationships (Concept Completion)**: We will model the new `ConceptCompletion` entity using flat `userId` and `conceptId` UUID fields (similar to `QuizAttempt` in Observation 1.4) instead of complex entity mappings. This prevents circular dependency mapping issues and keeps data manipulation simple.
4. **Mastery Refactoring**: In the current implementation, `CourseController` queries lessons and quizzes to build a list of quiz IDs, then passes it to `MasteryService` (Observation 1.4). Adding concept completions requires `MasteryService` to also know about the concepts. Rather than making the controller query both concepts and quizzes, we will refactor `calculateMasteryScore` to accept the `courseId` directly. This encapsulates all database fetching within `MasteryService` and keeps the controller thin.
5. **Recursion Risk Mitigation**: In our review of the JPA entities (Observation 1.5), we observed bidirectional mapping without Jackson serialization limits. This introduces a major risk of `StackOverflowError` when fetching courses, lessons, or concepts. We must introduce `@JsonIgnoreProperties` or `@JsonIgnore` to exclude the parent-referencing fields (`Lesson.course`, `Concept.lesson`) during JSON rendering.

---

## 3. Caveats

- **Read-Only Verification**: Due to the read-only constraint of this investigation, compilation, schema migrations, and tests were not run on the active codebase. 
- **Database Schema Auto-Generation**: We assume `spring.jpa.hibernate.ddl-auto=update` is active and SQLite will successfully create the `concept_completions` table automatically upon startup.
- **Node E2E Tests**: The E2E tests are planned under a separate workspace directory (`apps/e2e-tests`) which does not exist in the current working copy yet, so API endpoints will need to be verified via Maven tests or local curl commands first.

---

## 4. Conclusion & Implementation Strategy

### 4.1 Target Files & Changes

| Target File | Operation | Description |
|---|---|---|
| `apps/api/src/main/java/com/nexus/seos/database/ConceptCompletion.java` | **Create** | Introduce JPA Entity for tracking concept completion. |
| `apps/api/src/main/java/com/nexus/seos/database/Repositories.java` | **Update** | Define `ConceptCompletionRepository` inside the inner repository definitions. |
| `apps/api/src/main/java/com/nexus/seos/api/ChatController.java` | **Create** | Implement POST `/api/v1/chat` endpoint validating input and calling `GeminiService`. |
| `apps/api/src/main/java/com/nexus/seos/core/MasteryService.java` | **Update** | Refactor mastery formula to compute both quiz scores and concept completion. |
| `apps/api/src/main/java/com/nexus/seos/api/CourseController.java` | **Update** | Integrate concept completion endpoint and update mastery query parameters. |
| `apps/api/src/main/java/com/nexus/seos/database/Lesson.java` | **Update** | Add `@JsonIgnoreProperties("lessons")` to `course` property. |
| `apps/api/src/main/java/com/nexus/seos/database/Concept.java` | **Update** | Add `@JsonIgnoreProperties("concepts")` to `lesson` property. |
| `apps/api/src/main/java/com/nexus/seos/database/DatabaseSeeder.java` | **Create** | Startup seeder class populating courses, lessons, concepts, and quizzes. |

### 4.2 Proposed Code Modifications

#### A. Concept Completion Entity (`ConceptCompletion.java`)
Create a new file in `com.nexus.seos.database`:
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
@Table(
    name = "concept_completions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "concept_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConceptCompletion {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "concept_id", nullable = false)
    private UUID conceptId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();
}
```

#### B. Repository Updates (`Repositories.java`)
Append the repository interface to `com.nexus.seos.database.Repositories` (inside the `Repositories` class):
```java
    @Repository
    public interface ConceptCompletionRepository extends JpaRepository<ConceptCompletion, UUID> {
        List<ConceptCompletion> findByUserId(UUID userId);
        Optional<ConceptCompletion> findByUserIdAndConceptId(UUID userId, UUID conceptId);
        List<ConceptCompletion> findByUserIdAndConceptIdIn(UUID userId, java.util.Collection<UUID> conceptIds);
    }
```

#### C. AI Assistant Chat Controller (`ChatController.java`)
Create a new controller `com.nexus.seos.api.ChatController`:
```java
package com.nexus.seos.api;

import com.nexus.seos.ai.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final GeminiService geminiService;
    private static final List<String> VALID_PERSONAS = List.of("TUTOR", "ARCHITECT", "DEBUGGER", "INTERVIEWER");

    @Autowired
    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<?> handleChat(@RequestBody Map<String, String> request) {
        String persona = request.get("persona");
        String prompt = request.get("prompt");

        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt cannot be empty."));
        }

        if (persona == null || persona.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Persona cannot be empty."));
        }

        String upperPersona = persona.toUpperCase();
        if (!VALID_PERSONAS.contains(upperPersona)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or unsupported persona."));
        }

        String responseText = geminiService.generateResponse(upperPersona, prompt);
        return ResponseEntity.ok(Map.of("response", responseText));
    }
}
```

#### D. Mastery Service Update (`MasteryService.java`)
Refactor `MasteryService.java` to fetch entities internally and combine concept completion (30%), quiz attempt ratio (30%), and quiz score average (40%):
```java
package com.nexus.seos.core;

import com.nexus.seos.database.*;
import com.nexus.seos.database.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MasteryService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final ConceptCompletionRepository conceptCompletionRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final ConceptRepository conceptRepository;

    @Autowired
    public MasteryService(QuizAttemptRepository quizAttemptRepository,
                          ConceptCompletionRepository conceptCompletionRepository,
                          LessonRepository lessonRepository,
                          QuizRepository quizRepository,
                          ConceptRepository conceptRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.conceptCompletionRepository = conceptCompletionRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
        this.conceptRepository = conceptRepository;
    }

    /**
     * Calculate mastery score (0-100) for a user in a specific course.
     * Formula:
     * - Concept Completion (30% weight): Ratio of completed concepts in the course.
     * - Quiz Completion (30% weight): Ratio of attempted quizzes in the course.
     * - Quiz Performance (40% weight): Average score of the latest attempts of attempted quizzes.
     */
    public double calculateMasteryScore(UUID userId, UUID courseId) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId);
        
        List<UUID> conceptIds = new ArrayList<>();
        List<UUID> quizIds = new ArrayList<>();

        for (Lesson lesson : lessons) {
            conceptRepository.findByLessonId(lesson.getId()).forEach(c -> conceptIds.add(c.getId()));
            quizRepository.findByLessonId(lesson.getId()).forEach(q -> quizIds.add(q.getId()));
        }

        // Calculate Concept Completion
        double conceptRatio = 1.0;
        if (!conceptIds.isEmpty()) {
            List<ConceptCompletion> completions = conceptCompletionRepository.findByUserIdAndConceptIdIn(userId, conceptIds);
            conceptRatio = (double) completions.size() / conceptIds.size();
        }

        // Calculate Quiz Completion & Performance
        double quizAttemptRatio = 1.0;
        double averageScore = 0.0;

        if (!quizIds.isEmpty()) {
            int attemptedCount = 0;
            double totalScoreSum = 0.0;

            for (UUID quizId : quizIds) {
                List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
                if (!attempts.isEmpty()) {
                    attemptedCount++;
                    // Find latest attempt score
                    attempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
                    totalScoreSum += attempts.get(0).getScore();
                }
            }

            quizAttemptRatio = (double) attemptedCount / quizIds.size();
            averageScore = attemptedCount > 0 ? (totalScoreSum / attemptedCount) : 0.0;
        } else {
            averageScore = 100.0; // If no quizzes exist, default performance to max
        }

        double mastery = (conceptRatio * 30.0) + (quizAttemptRatio * 30.0) + ((averageScore / 100.0) * 40.0);
        return Math.min(100.0, Math.max(0.0, mastery));
    }

    /**
     * Calculate learning velocity (average mastery gain per day over attempts).
     */
    public double calculateLearningVelocity(UUID userId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(userId);
        if (attempts.size() < 2) {
            return 1.2; // default base velocity
        }
        
        attempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt));
        double firstScore = attempts.get(0).getScore();
        double lastScore = attempts.get(attempts.size() - 1).getScore();
        
        double diff = lastScore - firstScore;
        if (diff <= 0) {
            return 0.5; // low positive velocity
        }
        
        return Math.min(10.0, Math.max(0.1, diff / Math.max(1, attempts.size())));
    }
}
```

#### E. Course Controller Updates (`CourseController.java`)
Inject the repository, update `/mastery`, and implement `/concepts/{conceptId}/complete`:
```java
// Add to CourseController attributes:
private final ConceptCompletionRepository conceptCompletionRepository;

// Update constructor to inject ConceptCompletionRepository:
@Autowired
public CourseController(CourseRepository courseRepository, LessonRepository lessonRepository,
                        ConceptRepository conceptRepository, QuizRepository quizRepository,
                        QuizAttemptRepository quizAttemptRepository, MasteryService masteryService,
                        JwtTokenProvider tokenProvider, ConceptCompletionRepository conceptCompletionRepository) {
    this.courseRepository = courseRepository;
    this.lessonRepository = lessonRepository;
    this.conceptRepository = conceptRepository;
    this.quizRepository = quizRepository;
    this.quizAttemptRepository = quizAttemptRepository;
    this.masteryService = masteryService;
    this.tokenProvider = tokenProvider;
    this.conceptCompletionRepository = conceptCompletionRepository;
}

// Update /mastery mapping in getMastery method:
    @GetMapping("/mastery")
    public ResponseEntity<?> getMastery(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);

        List<Course> courses = courseRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> courseMasteryList = new ArrayList<>();

        for (Course course : courses) {
            double score = masteryService.calculateMasteryScore(userId, course.getId());
            Map<String, Object> cMap = new HashMap<>();
            cMap.put("courseId", course.getId());
            cMap.put("title", course.getTitle());
            cMap.put("masteryScore", score);
            courseMasteryList.add(cMap);
        }

        response.put("courses", courseMasteryList);
        response.put("velocity", masteryService.calculateLearningVelocity(userId));
        return ResponseEntity.ok(response);
    }

// Add the concept completion endpoint:
    @PostMapping("/concepts/{conceptId}/complete")
    public ResponseEntity<?> completeConcept(
            @PathVariable UUID conceptId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);

        Optional<Concept> conceptOpt = conceptRepository.findById(conceptId);
        if (conceptOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Concept not found."));
        }

        Optional<ConceptCompletion> existing = conceptCompletionRepository.findByUserIdAndConceptId(userId, conceptId);
        if (existing.isEmpty()) {
            ConceptCompletion completion = new ConceptCompletion();
            completion.setConceptId(conceptId);
            completion.setUserId(userId);
            conceptCompletionRepository.save(completion);
        }

        return ResponseEntity.ok(Map.of("conceptId", conceptId, "completed", true));
    }
```

#### F. Prevent Bidirectional JSON Recursion Loops
Add `@JsonIgnoreProperties` annotations to the parent-referencing fields in `Lesson.java` and `Concept.java`:

In `apps/api/src/main/java/com/nexus/seos/database/Lesson.java`:
```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("lessons")
    private Course course;
```

In `apps/api/src/main/java/com/nexus/seos/database/Concept.java`:
```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("concepts")
    private Lesson lesson;
```

#### G. Database Seeder (`DatabaseSeeder.java`)
Create a new file in `com.nexus.seos.database`:
```java
package com.nexus.seos.database;

import com.nexus.seos.database.Repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ConceptRepository conceptRepository;
    private final QuizRepository quizRepository;

    public DatabaseSeeder(CourseRepository courseRepository,
                          LessonRepository lessonRepository,
                          ConceptRepository conceptRepository,
                          QuizRepository quizRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.conceptRepository = conceptRepository;
        this.quizRepository = quizRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (courseRepository.count() == 0) {
            // Seed Course 1
            Course c1 = new Course();
            c1.setTitle("Software Engineering & System Design");
            c1.setDescription("Learn the fundamentals of software architecture, design patterns, and SOLID principles.");
            c1.setDifficulty("INTERMEDIATE");
            c1 = courseRepository.save(c1);

            // Lesson 1.1
            Lesson l1_1 = new Lesson();
            l1_1.setCourse(c1);
            l1_1.setTitle("SOLID Design Principles");
            l1_1.setOrderNo(1);
            l1_1 = lessonRepository.save(l1_1);

            // Concept 1.1.1
            Concept con1_1_1 = new Concept();
            con1_1_1.setLesson(l1_1);
            con1_1_1.setTitle("Single Responsibility & Open-Closed Principles");
            con1_1_1.setContent("Single Responsibility Principle (SRP) states that a class should have one, and only one, reason to change.\nOpen-Closed Principle (OCP) states that software entities should be open for extension but closed for modification.");
            conceptRepository.save(con1_1_1);

            // Concept 1.1.2
            Concept con1_1_2 = new Concept();
            con1_1_2.setLesson(l1_1);
            con1_1_2.setTitle("Liskov Substitution & Dependency Inversion");
            con1_1_2.setContent("Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of its subclasses without breaking the application.\nDependency Inversion Principle (DIP) states that high-level modules should not import anything from low-level modules. Both should depend on abstractions.");
            conceptRepository.save(con1_1_2);

            // Quiz 1.1
            Quiz q1_1 = new Quiz();
            q1_1.setLessonId(l1_1.getId());
            q1_1.setTitle("SOLID Principles Basics Quiz");
            quizRepository.save(q1_1);

            // Lesson 1.2
            Lesson l1_2 = new Lesson();
            l1_2.setCourse(c1);
            l1_2.setTitle("Design Patterns");
            l1_2.setOrderNo(2);
            l1_2 = lessonRepository.save(l1_2);

            // Concept 1.2.1
            Concept con1_2_1 = new Concept();
            con1_2_1.setLesson(l1_2);
            con1_2_1.setTitle("Creational Design Patterns");
            con1_2_1.setContent("Creational design patterns provide various object creation mechanisms, which increase flexibility and reuse of existing code. Examples include Singleton, Factory Method, Abstract Factory, Builder, and Prototype.");
            conceptRepository.save(con1_2_1);

            // Quiz 1.2
            Quiz q1_2 = new Quiz();
            q1_2.setLessonId(l1_2.getId());
            q1_2.setTitle("Creational Patterns Quiz");
            quizRepository.save(q1_2);

            // Seed Course 2
            Course c2 = new Course();
            c2.setTitle("Introduction to Java Programming");
            c2.setDescription("Learn the syntax, semantics, and object-oriented programming paradigm in Java.");
            c2.setDifficulty("BEGINNER");
            c2 = courseRepository.save(c2);

            // Lesson 2.1
            Lesson l2_1 = new Lesson();
            l2_1.setCourse(c2);
            l2_1.setTitle("Java Basics & OOP");
            l2_1.setOrderNo(1);
            l2_1 = lessonRepository.save(l2_1);

            // Concept 2.1_1
            Concept con2_1_1 = new Concept();
            con2_1_1.setLesson(l2_1);
            con2_1_1.setTitle("Classes, Objects, and Polymorphism");
            con2_1_1.setContent("Classes are blueprints for objects. Polymorphism allows us to perform a single action in different ways. In Java, polymorphism is achieved by method overloading and method overriding.");
            conceptRepository.save(con2_1_1);

            // Quiz 2.1
            Quiz q2_1 = new Quiz();
            q2_1.setLessonId(l2_1.getId());
            q2_1.setTitle("Java OOP Concepts Quiz");
            quizRepository.save(q2_1);
        }
    }
}
```

---

## 5. Verification Method

To independently verify the implementation strategy:

### 5.1 Compilation and Unit Tests
Run the standard Maven clean and test compilation targets in `apps/api`:
```powershell
mvn clean compile test-compile
```
*Invalidation Condition*: If compile errors occur due to missing annotations (Lombok) or import conflicts, check if dependencies match `pom.xml`.

### 5.2 Database Seeding Verification
On startup, verify the SQLite database `nexus-seos.db` is populated:
```powershell
sqlite3 nexus-seos.db "SELECT COUNT(*) FROM courses;"
```
*Invalidation Condition*: If count returns `0` but the server booted without errors, check if `CommandLineRunner` is registered as a `@Component` and that the application context successfully scanned it.

### 5.3 API Request Verification
Verify API endpoints using local Curl command tests:

- **AI Chat Endpoint**:
```powershell
curl -X POST http://localhost:8080/api/v1/chat `
  -H "Content-Type: application/json" `
  -d '{"persona": "TUTOR", "prompt": "Explain SOLID"}'
```
Expect `200 OK` with JSON `{"response": "..."}`.

- **Concept Completion Endpoint** (Requires an active user JWT token):
```powershell
curl -X POST http://localhost:8080/api/v1/courses/concepts/<concept-uuid>/complete `
  -H "Authorization: Bearer <jwt-token>" `
  -H "Content-Type: application/json" `
  -d '{}'
```
Expect `200 OK` with JSON `{"conceptId": "<concept-uuid>", "completed": true}`.

- **Mastery Endpoint**:
```powershell
curl -X GET http://localhost:8080/api/v1/courses/mastery `
  -H "Authorization: Bearer <jwt-token>"
```
Expect `200 OK` showing the calculated mastery score using the new formula.
