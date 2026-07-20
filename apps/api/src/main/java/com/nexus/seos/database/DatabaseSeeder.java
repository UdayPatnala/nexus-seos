package com.nexus.seos.database;

import com.nexus.seos.database.Repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.persistence.EntityManager;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ConceptRepository conceptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    public DatabaseSeeder(CourseRepository courseRepository,
                          LessonRepository lessonRepository,
                          ConceptRepository conceptRepository,
                          QuizRepository quizRepository,
                          UserRepository userRepository,
                          ProfileRepository profileRepository,
                          PasswordEncoder passwordEncoder,
                          EntityManager entityManager) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.conceptRepository = conceptRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        executeSeeder();
    }

    @Transactional
    public void executeSeeder() {
        seedUsers();
        
        boolean needsReset = false;
        try {
            if (courseRepository.count() == 0 || lessonRepository.count() == 0 || conceptRepository.count() == 0) {
                needsReset = true;
            } else {
                // Verify if we have static UUID database or the old dynamic UUID database
                java.util.UUID expectedStaticId = java.util.UUID.fromString("c1111111-1111-1111-1111-111111111111");
                if (!courseRepository.existsById(expectedStaticId)) {
                    System.out.println("====== DETECTED OLD DATABASE UUIDs - FORCING RE-SEED ======");
                    needsReset = true;
                } else {
                    // Verify we can successfully fetch lessons for a course to catch UUID type mismatch
                    Course first = courseRepository.findAll().get(0);
                    if (lessonRepository.findByCourseIdOrderByOrderNoAsc(first.getId()).isEmpty()) {
                        System.out.println("====== SYSTEM DETECTED CORRUPTED SQLite SCHEMA (UUID MISMATCH) ======");
                        // We must delete the database file and exit to let Hibernate recreate it with correct column types
                        java.io.File dbFile = new java.io.File("/data/nexus-seos.db");
                        if (dbFile.exists()) {
                            System.out.println("Deleting database file: " + dbFile.getAbsolutePath());
                            dbFile.delete();
                        }
                        java.io.File localDbFile = new java.io.File("nexus-seos.db");
                        if (localDbFile.exists()) {
                            System.out.println("Deleting local database file");
                            localDbFile.delete();
                        }
                        System.exit(1);
                    }
                }
            }
        } catch (Exception e) {
            needsReset = true;
        }

        if (needsReset) {
            System.out.println("====== DB SCHEMA RESET/RE-SEED REQUIRED ======");
            // Clear everything to ensure clean foreign key states and correct column types
            entityManager.createNativeQuery("PRAGMA foreign_keys = OFF;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM concept_completions;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM quiz_attempts;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM concepts;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM quizzes;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM lessons;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM courses;").executeUpdate();
            entityManager.createNativeQuery("PRAGMA foreign_keys = ON;").executeUpdate();
            
            // 1. Java & Object-Oriented Design
            Course c1 = createCourse(UUID.fromString("c1111111-1111-1111-1111-111111111111"), "Java & Object-Oriented Design", "Deep study of Java syntax, collections internals, JVM memory, GC tuning, and SOLID design.", "INTERMEDIATE");
            Lesson l1_1 = createLesson(UUID.fromString("l1111111-1111-1111-1111-111111111111"), c1, "JVM Architecture & GC", 1);
            createConcept(UUID.fromString("co111111-1111-1111-1111-111111111111"), l1_1, "JVM memory (Heap vs Stack)", 
                "### JVM Memory Layout\n" +
                "- **Stack**: Frame-based storage for local variables and execution paths. Fast LIFO access. Size set via `-Xss`.\n" +
                "- **Heap**: Stores all instance objects. Shared across threads. Set via `-Xms` and `-Xmx`.\n" +
                "- **Metaspace**: Stores class metadata, bytecode, and method details in native off-heap memory.");
            createConcept(UUID.fromString("co111111-2222-2222-2222-222222222222"), l1_1, "Garbage Collection tuning", 
                "### GC Collectors\n" +
                "- **Generational hypothesis**: Heap split into Eden, S0, S1 (Young) and Old generation.\n" +
                "- **G1 GC**: Garbage-First. Splits heap into regions, targeting memory-heavy regions to minimize pause times.\n" +
                "- **ZGC**: Low-latency collector designed to scale to TBs with pause times under 10ms.");
            Lesson l1_2 = createLesson(UUID.fromString("l1111111-2222-2222-2222-222222222222"), c1, "Object-Oriented Design Principles", 2);
            createConcept(UUID.fromString("co111111-3333-3333-3333-333333333333"), l1_2, "SOLID Principles", 
                "### SOLID Principles of OOD\n" +
                "- **S (Single Responsibility)**: A class should have exactly one reason to change.\n" +
                "- **O (Open/Closed)**: Extend functionality via polymorphism without modifying existing source code.\n" +
                "- **L (Liskov Substitution)**: Derived classes must be completely substitutable for their base classes.\n" +
                "- **I (Interface Segregation)**: Prefer small, client-specific interfaces over massive, general ones.\n" +
                "- **D (Dependency Inversion)**: Depend on abstractions rather than concrete modules.");
            createQuiz(UUID.fromString("q1111111-1111-1111-1111-111111111111"), l1_1, "JVM Basics Quiz");
            createQuiz(UUID.fromString("q1111111-2222-2222-2222-222222222222"), l1_2, "SOLID Principles Quiz");

            // 2. Python & FastAPI Development
            Course c2 = createCourse(UUID.fromString("c2222222-2222-2222-2222-222222222222"), "Python & FastAPI Development", "Asynchronous Python programming, Pydantic validation, and dependency injection patterns.", "BEGINNER");
            Lesson l2_1 = createLesson(UUID.fromString("l2222222-1111-1111-1111-111111111111"), c2, "Asynchronous Python & FastAPI Core", 1);
            createConcept(UUID.fromString("co222222-1111-1111-1111-111111111111"), l2_1, "FastAPI async/await mechanics", 
                "### Asynchronous API Handlers\n" +
                "- Python's `asyncio` event loop executes non-blocking tasks concurrently.\n" +
                "- Use `async def` for I/O bound endpoints (e.g., database queries, third-party API fetches).\n" +
                "- Use standard `def` if the endpoint contains blocking synchronous code (runs in a separate threadpool).");
            createConcept(UUID.fromString("co222222-2222-2222-2222-222222222222"), l2_1, "Pydantic Schema Validation", 
                "### Pydantic Data Parsing\n" +
                "- Validates incoming JSON payloads against declared model types at runtime.\n" +
                "- Exposes type hints to build OpenAPI documentation automatically.\n" +
                "- Supports custom validators and strict/lax parsing modes.");
            createQuiz(UUID.fromString("q2222222-1111-1111-1111-111111111111"), l2_1, "Python async & FastAPI Quiz");

            // 3. Node.js & Express.js Backend
            Course c3 = createCourse(UUID.fromString("c3333333-3333-3333-3333-333333333333"), "Node.js & Express.js Backend", "Master single-threaded non-blocking event loops, middleware architectures, and async I/O.", "INTERMEDIATE");
            Lesson l3_1 = createLesson(UUID.fromString("l3333333-1111-1111-1111-111111111111"), c3, "Node.js Event Loop & Middleware", 1);
            createConcept(UUID.fromString("co333333-1111-1111-1111-111111111111"), l3_1, "Event Loop Phases", 
                "### Node.js Event Loop\n" +
                "1. **Timers**: Executes `setTimeout` and `setInterval` callbacks.\n" +
                "2. **Pending Callbacks**: Executes I/O errors and pending system callbacks.\n" +
                "3. **Poll**: Retrieves new I/O events and executes scripts.\n" +
                "4. **Check**: Executes `setImmediate` callbacks.\n" +
                "5. **Close Callbacks**: Cleans up socket connections.");
            createConcept(UUID.fromString("co333333-2222-2222-2222-222222222222"), l3_1, "Express Middleware Pipeline", 
                "### Express Middleware\n" +
                "- Functions having access to `req`, `res`, and `next` in the request-response cycle.\n" +
                "- Can modify request parameters, authenticate users, or terminate the pipeline early.\n" +
                "- Standard pipeline order is critical for routing and error handling.");
            createQuiz(UUID.fromString("q3333333-1111-1111-1111-111111111111"), l3_1, "Node & Express Quiz");

            // 4. Data Structures & Algorithms
            Course c4 = createCourse(UUID.fromString("c4444444-4444-4444-4444-444444444444"), "Data Structures & Algorithms", "Master array algorithms, sliding window, two-pointer patterns, complexity, sorting, and search.", "ADVANCED");
            Lesson l4_1 = createLesson(UUID.fromString("l4444444-1111-1111-1111-111111111111"), c4, "Array & Sliding Window Patterns", 1);
            createConcept(UUID.fromString("co444444-1111-1111-1111-111111111111"), l4_1, "Sliding Window Pattern", 
                "### Sliding Window Algorithm\n" +
                "- Optimizes nested loop O(N²) subarrays to linear O(N) runtime.\n" +
                "- **Fixed Window**: Slide window of constant size K.\n" +
                "- **Dynamic Window**: Expand/shrink boundaries based on condition criteria.");
            createConcept(UUID.fromString("co444444-2222-2222-2222-222222222222"), l4_1, "Two-Pointer Strategy", 
                "### Two-Pointer Scanning\n" +
                "- Typically used in sorted arrays to find targets (opposite directions) or detect cycles (slow/fast runner).");
            createQuiz(UUID.fromString("q4444444-1111-1111-1111-111111111111"), l4_1, "DSA Array Patterns Quiz");

            // 5. Relational Databases & SQL
            Course c5 = createCourse(UUID.fromString("c5555555-5555-5555-5555-555555555555"), "Relational Databases & SQL", "Deep study of schema design, indices, query plans, and transaction consistency.", "INTERMEDIATE");
            Lesson l5_1 = createLesson(UUID.fromString("l5555555-1111-1111-1111-111111111111"), c5, "Query Optimization & ACID", 1);
            createConcept(UUID.fromString("co555555-1111-1111-1111-111111111111"), l5_1, "B-Tree Indices", 
                "### B-Tree Indexing\n" +
                "- Self-balancing search tree keeping keys sorted for O(log N) lookups.\n" +
                "- **Leftmost Prefix**: Composite indices require left-to-right matching columns to trigger optimization.");
            createConcept(UUID.fromString("co555555-2222-2222-2222-222222222222"), l5_1, "ACID properties & Isolation levels", 
                "### Database Transactions\n" +
                "- **ACID**: Atomicity, Consistency, Isolation, Durability.\n" +
                "- **Isolation Levels**: Read Uncommitted, Read Committed, Repeatable Read, Serializable.");
            createQuiz(UUID.fromString("q5555555-1111-1111-1111-111111111111"), l5_1, "SQL Optimization Quiz");

            // 6. Cloud & Client-Side Storage
            Course c6 = createCourse(UUID.fromString("c6666666-6666-6666-6666-666666666666"), "Cloud & Client-Side Storage", "Firebase Auth, Firestore real-time sync, IndexedDB, and localStorage persistence.", "BEGINNER");
            Lesson l6_1 = createLesson(UUID.fromString("l6666666-1111-1111-1111-111111111111"), c6, "Client & Firebase Storage", 1);
            createConcept(UUID.fromString("co666666-1111-1111-1111-111111111111"), l6_1, "Firestore Sync vs IndexedDB", 
                "### Database Sync Mechanisms\n" +
                "- **Firestore**: Document database supporting real-time listeners (`onSnapshot`) and offline persistence.\n" +
                "- **IndexedDB**: Standard transactional browser object database for storing large client-side binary data.");
            createQuiz(UUID.fromString("q6666666-1111-1111-1111-111111111111"), l6_1, "Storage options Quiz");

            // 7. Machine Learning & AI Integration
            Course c7 = createCourse(UUID.fromString("c7777777-7777-7777-7777-777777777777"), "Machine Learning & AI Integration", "Matrix calculations in NumPy, Pandas data structures, scikit-learn models, and Gemini API.", "INTERMEDIATE");
            Lesson l7_1 = createLesson(UUID.fromString("l7777777-1111-1111-1111-111111111111"), c7, "Machine Learning Pipelines", 1);
            createConcept(UUID.fromString("co777777-1111-1111-1111-111111111111"), l7_1, "NumPy & Pandas Operations", 
                "### Data Manipulation\n" +
                "- **NumPy**: Element-wise array math operations built on optimized C libraries.\n" +
                "- **Pandas**: DataFrame analysis operations for filtering, joining, and cleaning tabular data.");
            createConcept(UUID.fromString("co777777-2222-2222-2222-222222222222"), l7_1, "scikit-learn fit/predict pipeline", 
                "### Model Training Flow\n" +
                "1. **Preprocess**: Clean, scale features (StandardScaler), and split train/test datasets.\n" +
                "2. **Fit**: Minimize loss function weights on training inputs.\n" +
                "3. **Predict**: Evaluate test set validation metrics.");
            createQuiz(UUID.fromString("q7777777-1111-1111-1111-111111111111"), l7_1, "ML Pipelines Quiz");

            // 8. Frontend & Video Processing
            Course c8 = createCourse(UUID.fromString("c8888888-8888-8888-8888-888888888888"), "Frontend & Video Processing", "React state hooks, Tailwind CSS layout structures, and face-api.js webcam tracking.", "BEGINNER");
            Lesson l8_1 = createLesson(UUID.fromString("l8888888-1111-1111-1111-111111111111"), c8, "React State & Canvas frames", 1);
            createConcept(UUID.fromString("co888888-1111-1111-1111-111111111111"), l8_1, "React hooks state management", 
                "### React State & Lifecycle\n" +
                "- `useState`: Declares reactive variables that trigger a re-render on change.\n" +
                "- `useEffect`: Executes side-effects, handles subscription cleanups, and tracks dependencies.");
            createConcept(UUID.fromString("co888888-2222-2222-2222-222222222222"), l8_1, "face-api.js Canvas Rendering", 
                "### Real-time Webcam Face Tracking\n" +
                "- Accesses camera streams via browser `navigator.mediaDevices.getUserMedia`.\n" +
                "- Pipes frame data into a canvas element, calling models to run expression classification.");
            createQuiz(UUID.fromString("q8888888-1111-1111-1111-111111111111"), l8_1, "Frontend & Video Quiz");

            // 9. Security, Auth & Tooling
            Course c9 = createCourse(UUID.fromString("c9999999-9999-9999-9999-999999999999"), "Security, Auth & Tooling", "JWT token structures, Git branch workflows (merge vs rebase), and Vercel hosting.", "INTERMEDIATE");
            Lesson l9_1 = createLesson(UUID.fromString("l9999999-1111-1111-1111-111111111111"), c9, "JWT Security & Git Workflows", 1);
            createConcept(UUID.fromString("co999999-1111-1111-1111-111111111111"), l9_1, "JWT Tokens structure", 
                "### JSON Web Tokens (JWT)\n" +
                "- Stateless tokens split into Header, Payload (claims), and Signature.\n" +
                "- Signed using symmetric HS256 or asymmetric RS256 algorithms to prevent tampering.");
            createConcept(UUID.fromString("co999999-2222-2222-2222-222222222222"), l9_1, "Git workflows (Merge vs Rebase)", 
                "### Git History Strategies\n" +
                "- **Merge**: Combines target branches, creating a new merge commit. Preserves exact history.\n" +
                "- **Rebase**: Rewrites project history by applying commits individually on top of target branch base.");
            createQuiz(UUID.fromString("q9999999-1111-1111-1111-111111111111"), l9_1, "Security & Git Quiz");
        }
    }

    private Course createCourse(UUID id, String title, String description, String diff) {
        Course c = new Course();
        c.setId(id);
        c.setTitle(title);
        c.setDescription(description);
        c.setDifficulty(diff);
        return courseRepository.save(c);
    }

    private Lesson createLesson(UUID id, Course course, String title, int orderNo) {
        Lesson l = new Lesson();
        l.setId(id);
        l.setCourse(course);
        l.setTitle(title);
        l.setOrderNo(orderNo);
        return lessonRepository.save(l);
    }

    private void createConcept(UUID id, Lesson lesson, String title, String content) {
        Concept c = new Concept();
        c.setId(id);
        c.setLesson(lesson);
        c.setTitle(title);
        c.setContent(content);
        conceptRepository.save(c);
    }

    private void createQuiz(UUID id, Lesson lesson, String title) {
        Quiz q = new Quiz();
        q.setId(id);
        q.setLessonId(lesson.getId());
        q.setTitle(title);
        quizRepository.save(q);
    }

    private void seedUsers() {
        if (userRepository.count() != 10 || userRepository.findByAccessKey("NEXUS-DEMO-Z9F2X7").isEmpty()) {
            System.out.println("====== SEEDING ACCESS KEY PROFILES ======");
            // Drop existing users and profiles safely using native SQL
            entityManager.createNativeQuery("PRAGMA foreign_keys = OFF;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM profiles;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM executions;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM projects;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notes;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM quiz_attempts;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM concept_completions;").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM users;").executeUpdate();
            entityManager.createNativeQuery("PRAGMA foreign_keys = ON;").executeUpdate();

            // Create 10 users
            // 1 Demo User (Complex Key)
            createUserWithKey("NEXUS-DEMO-Z9F2X7", "demo@nexus.dev", "Demo Profile", true);
            // 9 Normal Users with complex, randomized keys
            String[] randomKeys = {
                "NEXUS-KEY-K3P7X9W2",
                "NEXUS-KEY-R8N5J4Y6",
                "NEXUS-KEY-H2M9Q6V4",
                "NEXUS-KEY-T5F1S8B3",
                "NEXUS-KEY-L4X7Z2P9",
                "NEXUS-KEY-W9C3D6Y8",
                "NEXUS-KEY-M1N8P5Q2",
                "NEXUS-KEY-V7B2F6K9",
                "NEXUS-KEY-J4H9D3S7"
            };
            for (int i = 0; i < randomKeys.length; i++) {
                String key = randomKeys[i];
                String email = String.format("user%02d@nexus.dev", i + 2);
                String name = String.format("Profile %02d", i + 2);
                createUserWithKey(key, email, name, false);
            }
            System.out.println("====== SEEDED 10 ACCESS KEY PROFILES ======");
        }
    }

    private void createUserWithKey(String key, String email, String fullName, boolean isDemo) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("nexus")); // default dummy password
        user.setAccessKey(key);
        user.setDemo(isDemo);
        User savedUser = userRepository.saveAndFlush(user);

        Profile profile = new Profile();
        profile.setUser(savedUser);
        profile.setFullName(fullName);
        profile.setBio("Access Key user account.");
        profile.setAvatarUrl("");
        profileRepository.saveAndFlush(profile);
    }
}
