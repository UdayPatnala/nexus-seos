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
            
            // 1. Java Core & JVM Internals
            Course c1 = createCourse("Java Programming", "Core Java syntax, Collection details, JVM memory mechanics, and Garbage Collection.", "INTERMEDIATE");
            Lesson l1_1 = createLesson(c1, "JVM Architecture & Memory", 1);
            
            createConcept(l1_1, "JVM Memory Layout (Heap vs Stack)", 
                "### JVM Memory Architecture\n\n" +
                "The Java Virtual Machine (JVM) divides its run-time data area into distinct logical regions:\n\n" +
                "1. **Stack Memory**:\n" +
                "   - Stores local variables and method call frames.\n" +
                "   - Memory allocation is LIFO (Last In First Out) and scope-based.\n" +
                "   - Access is extremely fast. Size is determined by `-Xss`.\n\n" +
                "2. **Heap Memory**:\n" +
                "   - Stores all dynamically allocated objects and instance variables.\n" +
                "   - Shared across all threads. Size is set using `-Xms` (initial) and `-Xmx` (max).\n" +
                "   - Managed by the Garbage Collector.\n" +
                "   - Divided into **Young Generation** (Eden, S0, S1) and **Old Generation**.\n\n" +
                "3. **Metaspace**:\n" +
                "   - Replaced PermGen in Java 8.\n" +
                "   - Stores class metadata (class definitions, method bytecodes).\n" +
                "   - Allocates memory dynamically out of the native system memory.");

            createConcept(l1_1, "Garbage Collection & Internals", 
                "### Garbage Collection (GC) in Java\n\n" +
                "Garbage Collection is the automatic process of freeing heap memory by reclaiming unreachable objects.\n\n" +
                "#### Generational Hypothesis\n" +
                "Most objects die young. Therefore, the heap is split to optimize GC runs:\n" +
                "- **Minor GC**: Reclaims memory in the Young Generation (Eden + Survivor spaces).\n" +
                "- **Major GC / Full GC**: Cleans the Old Generation.\n\n" +
                "#### Modern GC Collectors:\n" +
                "- **G1 (Garbage-First) GC**: Standard in modern JVMs. Divides heap into equal-sized regions and targets regions with the most garbage first to minimize pause times.\n" +
                "- **ZGC (Z Garbage Collector)**: A low-latency collector designed to scale to terabytes of memory with pause times under 10 milliseconds, using color pointers and load barriers.");

            createQuiz(l1_1, "JVM Internals Quiz");

            // 2. OOP & Design Patterns
            Course c2 = createCourse("Object Oriented Design", "Solidify design principles, API abstraction, and structural design patterns.", "INTERMEDIATE");
            Lesson l2_1 = createLesson(c2, "SOLID Principles", 1);
            
            createConcept(l2_1, "SOLID Principles Walkthrough", 
                "### SOLID Principles of Object-Oriented Design\n\n" +
                "These five design principles help build clean, maintainable, and extendable software architectures:\n\n" +
                "1. **S - Single Responsibility Principle (SRP)**:\n" +
                "   - A class should have one, and only one, reason to change.\n" +
                "   - *Bad Practice*: A User class handling database storage AND email validation.\n\n" +
                "2. **O - Open/Closed Principle (OCP)**:\n" +
                "   - Code should be open for extension but closed for modification.\n" +
                "   - Implement abstract classes or interfaces to add behaviors without modifying existing code.\n\n" +
                "3. **L - Liskov Substitution Principle (LSP)**:\n" +
                "   - Subclasses must be completely substitutable for their superclasses without changing the correctness of the program.\n\n" +
                "4. **I - Interface Segregation Principle (ISP)**:\n" +
                "   - Clients should not be forced to depend on interfaces they do not use. Prefer small, focused interfaces over large, fat ones.\n\n" +
                "5. **D - Dependency Inversion Principle (DIP)**:\n" +
                "   - High-level modules should not depend on low-level modules. Both must depend on abstractions.");

            createQuiz(l2_1, "SOLID Principles Quiz");

            // 3. Relational Databases & SQL
            Course c3 = createCourse("Databases & SQL", "Deep study of transactional consistency, index mechanics, and Query optimization.", "INTERMEDIATE");
            Lesson l3_1 = createLesson(c3, "Indexing & Transactions", 1);
            
            createConcept(l3_1, "B-Tree Indexing Mechanics", 
                "### B-Tree Database Indexing\n\n" +
                "An index is a data structure used to speed up queries by pointing directly to record locations.\n\n" +
                "#### How B-Trees Work:\n" +
                "- B-Tree indexes are self-balancing search trees.\n" +
                "- Keeps keys in sorted order, allowing fast binary searches (O(log N)).\n" +
                "- Leaf nodes contain pointers to actual rows (or cluster keys).\n\n" +
                "#### Best Practices:\n" +
                "- **Clustered Index**: Determines the physical storage order of table data (typically the Primary Key).\n" +
                "- **Composite Index**: Index on multiple columns. Order matters! Follow the **Leftmost Prefix rule** (queries must match columns from left to right to use the index).");

            createConcept(l3_1, "ACID Transactions & Isolation Levels", 
                "### Database Transactions & ACID\n\n" +
                "ACID properties guarantee database reliability during failures:\n" +
                "- **Atomicity**: Entire transaction succeeds or rolls back completely.\n" +
                "- **Consistency**: Data moves from one valid state to another.\n" +
                "- **Isolation**: Concurrent transactions execute without interference.\n" +
                "- **Durability**: Committed data survives power losses or crashes.\n\n" +
                "#### Isolation Levels (ANSI SQL standard):\n" +
                "1. **Read Uncommitted**: Can read dirty data. Lowest isolation level.\n" +
                "2. **Read Committed**: Prevents Dirty Reads. (Default for PostgreSQL/SQL Server).\n" +
                "3. **Repeatable Read**: Prevents Non-Repeatable Reads. (Default for MySQL).\n" +
                "4. **Serializable**: Strict execution ordering. Prevents Phantom Reads.");

            createQuiz(l3_1, "SQL Indices & ACID Quiz");

            // 4. DSA
            Course c4 = createCourse("Algorithms & Data Structures", "Learn optimal coding structures, complexities, and algorithmic patterns.", "ADVANCED");
            Lesson l4_1 = createLesson(c4, "Algorithmic Paradigms", 1);
            
            createConcept(l4_1, "Sliding Window & Two-Pointer Patterns", 
                "### Sliding Window & Two-Pointer Coding Techniques\n\n" +
                "These patterns optimize nested loops from O(N²) down to linear O(N) complexity:\n\n" +
                "#### 1. Two-Pointer Technique:\n" +
                "- Uses two reference indices to scan array elements concurrently.\n" +
                "- Common for **sorted arrays** (e.g., Target Sum, Reversing strings).\n" +
                "- Pointers can move in opposite directions (left/right) or at different speeds (fast/slow runner for cycle detection).\n\n" +
                "#### 2. Sliding Window Pattern:\n" +
                "- Represents a sub-array subarray dynamic window.\n" +
                "- **Fixed Window**: Maintains a constant window length (e.g., maximum sum sub-array of size K).\n" +
                "- **Dynamic Window**: Expand/shrink boundaries using a condition (e.g., longest substring without repeating characters).");

            createQuiz(l4_1, "Algorithm Patterns Quiz");

            // 5. REST & API Architecture
            Course c5 = createCourse("REST API Architecture", "Convention guidelines, request patterns, payload mapping, and JWT security.", "BEGINNER");
            Lesson l5_1 = createLesson(c5, "API Conventions", 1);
            
            createConcept(l5_1, "RESTful HTTP Guidelines", 
                "### RESTful API Design Standards\n\n" +
                "REST (Representational State Transfer) structures communications over HTTP:\n\n" +
                "#### 1. HTTP Methods:\n" +
                "- `GET`: Retrieve resource. Must be idempotent.\n" +
                "- `POST`: Create resource. Non-idempotent.\n" +
                "- `PUT`: Full update. Idempotent.\n" +
                "- `PATCH`: Partial update. Idempotent.\n" +
                "- `DELETE`: Remove resource. Idempotent.\n\n" +
                "#### 2. Status Codes:\n" +
                "- `200 OK` / `201 Created` / `204 No Content`\n" +
                "- `400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found`\n" +
                "- `500 Internal Server Error` / `503 Service Unavailable`\n\n" +
                "#### 3. Path Naming:\n" +
                "- Use plural nouns: `GET /users`, `POST /users/{id}/projects`.\n" +
                "- Filter using query parameters: `GET /users?status=active`.");

            createQuiz(l5_1, "REST API Quiz");
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
