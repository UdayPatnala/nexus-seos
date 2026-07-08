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
        if (courseRepository.count() == 0 || lessonRepository.count() == 0 || conceptRepository.count() == 0) {
            conceptRepository.deleteAll();
            quizRepository.deleteAll();
            lessonRepository.deleteAll();
            courseRepository.deleteAll();
            
            // 1. Java & Object-Oriented Design
            Course c1 = createCourse("Java & Object-Oriented Design", "Deep study of Java syntax, collections internals, JVM memory, GC tuning, and SOLID design.", "INTERMEDIATE");
            Lesson l1_1 = createLesson(c1, "JVM Architecture & GC", 1);
            createConcept(l1_1, "JVM memory (Heap vs Stack)", 
                "### JVM Memory Layout\n" +
                "- **Stack**: Frame-based storage for local variables and execution paths. Fast LIFO access. Size set via `-Xss`.\n" +
                "- **Heap**: Stores all instance objects. Shared across threads. Set via `-Xms` and `-Xmx`.\n" +
                "- **Metaspace**: Stores class metadata, bytecode, and method details in native off-heap memory.");
            createConcept(l1_1, "Garbage Collection tuning", 
                "### GC Collectors\n" +
                "- **Generational hypothesis**: Heap split into Eden, S0, S1 (Young) and Old generation.\n" +
                "- **G1 GC**: Garbage-First. Splits heap into regions, targeting memory-heavy regions to minimize pause times.\n" +
                "- **ZGC**: Low-latency collector designed to scale to TBs with pause times under 10ms.");
            Lesson l1_2 = createLesson(c1, "Object-Oriented Design Principles", 2);
            createConcept(l1_2, "SOLID Principles", 
                "### SOLID Principles of OOD\n" +
                "- **S (Single Responsibility)**: A class should have exactly one reason to change.\n" +
                "- **O (Open/Closed)**: Extend functionality via polymorphism without modifying existing source code.\n" +
                "- **L (Liskov Substitution)**: Derived classes must be completely substitutable for their base classes.\n" +
                "- **I (Interface Segregation)**: Prefer small, client-specific interfaces over massive, general ones.\n" +
                "- **D (Dependency Inversion)**: Depend on abstractions rather than concrete modules.");
            createQuiz(l1_1, "JVM Basics Quiz");
            createQuiz(l1_2, "SOLID Principles Quiz");

            // 2. Python & FastAPI Development
            Course c2 = createCourse("Python & FastAPI Development", "Asynchronous Python programming, Pydantic validation, and dependency injection patterns.", "BEGINNER");
            Lesson l2_1 = createLesson(c2, "Asynchronous Python & FastAPI Core", 1);
            createConcept(l2_1, "FastAPI async/await mechanics", 
                "### Asynchronous API Handlers\n" +
                "- Python's `asyncio` event loop executes non-blocking tasks concurrently.\n" +
                "- Use `async def` for I/O bound endpoints (e.g., database queries, third-party API fetches).\n" +
                "- Use standard `def` if the endpoint contains blocking synchronous code (runs in a separate threadpool).");
            createConcept(l2_1, "Pydantic Schema Validation", 
                "### Pydantic Data Parsing\n" +
                "- Validates incoming JSON payloads against declared model types at runtime.\n" +
                "- Exposes type hints to build OpenAPI documentation automatically.\n" +
                "- Supports custom validators and strict/lax parsing modes.");
            createQuiz(l2_1, "Python async & FastAPI Quiz");

            // 3. Node.js & Express.js Backend
            Course c3 = createCourse("Node.js & Express.js Backend", "Master single-threaded non-blocking event loops, middleware architectures, and async I/O.", "INTERMEDIATE");
            Lesson l3_1 = createLesson(c3, "Node.js Event Loop & Middleware", 1);
            createConcept(l3_1, "Event Loop Phases", 
                "### Node.js Event Loop\n" +
                "1. **Timers**: Executes `setTimeout` and `setInterval` callbacks.\n" +
                "2. **Pending Callbacks**: Executes I/O errors and pending system callbacks.\n" +
                "3. **Poll**: Retrieves new I/O events and executes scripts.\n" +
                "4. **Check**: Executes `setImmediate` callbacks.\n" +
                "5. **Close Callbacks**: Cleans up socket connections.");
            createConcept(l3_1, "Express Middleware Pipeline", 
                "### Express Middleware\n" +
                "- Functions having access to `req`, `res`, and `next` in the request-response cycle.\n" +
                "- Can modify request parameters, authenticate users, or terminate the pipeline early.\n" +
                "- Standard pipeline order is critical for routing and error handling.");
            createQuiz(l3_1, "Node & Express Quiz");

            // 4. Data Structures & Algorithms
            Course c4 = createCourse("Data Structures & Algorithms", "Master array algorithms, sliding window, two-pointer patterns, complexity, sorting, and search.", "ADVANCED");
            Lesson l4_1 = createLesson(c4, "Array & Sliding Window Patterns", 1);
            createConcept(l4_1, "Sliding Window Pattern", 
                "### Sliding Window Algorithm\n" +
                "- Optimizes nested loop O(N²) subarrays to linear O(N) runtime.\n" +
                "- **Fixed Window**: Slide window of constant size K.\n" +
                "- **Dynamic Window**: Expand/shrink boundaries based on condition criteria.");
            createConcept(l4_1, "Two-Pointer Strategy", 
                "### Two-Pointer Scanning\n" +
                "- Typically used in sorted arrays to find targets (opposite directions) or detect cycles (slow/fast runner).");
            createQuiz(l4_1, "DSA Array Patterns Quiz");

            // 5. Relational Databases & SQL
            Course c5 = createCourse("Relational Databases & SQL", "Deep study of schema design, indices, query plans, and transaction consistency.", "INTERMEDIATE");
            Lesson l5_1 = createLesson(c5, "Query Optimization & ACID", 1);
            createConcept(l5_1, "B-Tree Indices", 
                "### B-Tree Indexing\n" +
                "- Self-balancing search tree keeping keys sorted for O(log N) lookups.\n" +
                "- **Leftmost Prefix**: Composite indices require left-to-right matching columns to trigger optimization.");
            createConcept(l5_1, "ACID properties & Isolation levels", 
                "### Database Transactions\n" +
                "- **ACID**: Atomicity, Consistency, Isolation, Durability.\n" +
                "- **Isolation Levels**: Read Uncommitted, Read Committed, Repeatable Read, Serializable.");
            createQuiz(l5_1, "SQL Optimization Quiz");

            // 6. Cloud & Client-Side Storage
            Course c6 = createCourse("Cloud & Client-Side Storage", "Firebase Auth, Firestore real-time sync, IndexedDB, and localStorage persistence.", "BEGINNER");
            Lesson l6_1 = createLesson(c6, "Client & Firebase Storage", 1);
            createConcept(l6_1, "Firestore Sync vs IndexedDB", 
                "### Database Sync Mechanisms\n" +
                "- **Firestore**: Document database supporting real-time listeners (`onSnapshot`) and offline persistence.\n" +
                "- **IndexedDB**: Standard transactional browser object database for storing large client-side binary data.");
            createQuiz(l6_1, "Storage options Quiz");

            // 7. Machine Learning & AI Integration
            Course c7 = createCourse("Machine Learning & AI Integration", "Matrix calculations in NumPy, Pandas data structures, scikit-learn models, and Gemini API.", "INTERMEDIATE");
            Lesson l7_1 = createLesson(c7, "Machine Learning Pipelines", 1);
            createConcept(l7_1, "NumPy & Pandas Operations", 
                "### Data Manipulation\n" +
                "- **NumPy**: Element-wise array math operations built on optimized C libraries.\n" +
                "- **Pandas**: DataFrame analysis operations for filtering, joining, and cleaning tabular data.");
            createConcept(l7_1, "scikit-learn fit/predict pipeline", 
                "### Model Training Flow\n" +
                "1. **Preprocess**: Clean, scale features (StandardScaler), and split train/test datasets.\n" +
                "2. **Fit**: Minimize loss function weights on training inputs.\n" +
                "3. **Predict**: Evaluate test set validation metrics.");
            createQuiz(l7_1, "ML Pipelines Quiz");

            // 8. Frontend & Video Processing
            Course c8 = createCourse("Frontend & Video Processing", "React state hooks, Tailwind CSS layout structures, and face-api.js webcam tracking.", "BEGINNER");
            Lesson l8_1 = createLesson(c8, "React State & Canvas frames", 1);
            createConcept(l8_1, "React hooks state management", 
                "### React State & Lifecycle\n" +
                "- `useState`: Declares reactive variables that trigger a re-render on change.\n" +
                "- `useEffect`: Executes side-effects, handles subscription cleanups, and tracks dependencies.");
            createConcept(l8_1, "face-api.js Canvas Rendering", 
                "### Real-time Webcam Face Tracking\n" +
                "- Accesses camera streams via browser `navigator.mediaDevices.getUserMedia`.\n" +
                "- Pipes frame data into a canvas element, calling models to run expression classification.");
            createQuiz(l8_1, "Frontend & Video Quiz");

            // 9. Security, Auth & Tooling
            Course c9 = createCourse("Security, Auth & Tooling", "JWT token structures, Git branch workflows (merge vs rebase), and Vercel hosting.", "INTERMEDIATE");
            Lesson l9_1 = createLesson(c9, "JWT Security & Git Workflows", 1);
            createConcept(l9_1, "JWT Tokens structure", 
                "### JSON Web Tokens (JWT)\n" +
                "- Stateless tokens split into Header, Payload (claims), and Signature.\n" +
                "- Signed using symmetric HS256 or asymmetric RS256 algorithms to prevent tampering.");
            createConcept(l9_1, "Git workflows (Merge vs Rebase)", 
                "### Git History Strategies\n" +
                "- **Merge**: Combines target branches, creating a new merge commit. Preserves exact history.\n" +
                "- **Rebase**: Rewrites project history by applying commits individually on top of target branch base.");
            createQuiz(l9_1, "Security & Git Quiz");
        }
    }

    private Course createCourse(String title, String description, String diff) {
        Course c = new Course();
        c.setTitle(title);
        c.setDescription(description);
        c.setDifficulty(diff);
        return courseRepository.save(c);
    }

    private Lesson createLesson(Course course, String title, int orderNo) {
        Lesson l = new Lesson();
        l.setCourse(course);
        l.setTitle(title);
        l.setOrderNo(orderNo);
        return lessonRepository.save(l);
    }

    private void createConcept(Lesson lesson, String title, String content) {
        Concept c = new Concept();
        c.setLesson(lesson);
        c.setTitle(title);
        c.setContent(content);
        conceptRepository.save(c);
    }

    private void createQuiz(Lesson lesson, String title) {
        Quiz q = new Quiz();
        q.setLessonId(lesson.getId());
        q.setTitle(title);
        quizRepository.save(q);
    }
}
