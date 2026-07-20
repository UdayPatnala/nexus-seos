export interface GuidedExercise {
  prompt: string;
  starterCode: string;
  solutionCode: string;
}

export interface DebuggingTask {
  brokenCode: string;
  fixHint: string;
  solutionCode: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface ProjectSpec {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  rubric: string[];
}

export interface Concept {
  id: string;
  title: string;
  content: string;
  objectives?: string[];
  analogy?: string;
  walkthroughCode?: string;
  guidedExercise?: GuidedExercise;
  debuggingTask?: DebuggingTask;
  commonPitfalls?: string[];
  bestPractices?: string[];
  performanceTips?: string;
  interviewQuestions?: InterviewQuestion[];
  cheatSheet?: string;
}

export interface Lesson {
  id: string;
  title: string;
  dayNumber?: number;
  concepts: Concept[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDays: number;
  lessons: Lesson[];
  projects?: ProjectSpec[];
}

export const staticCourses: Course[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    title: 'Java & Object-Oriented Design',
    description: 'Deep 30-day mastery of Java 21 syntax, JVM memory layout, GC tuning algorithms, concurrency, and SOLID enterprise design patterns.',
    difficulty: 'INTERMEDIATE',
    estimatedDays: 30,
    projects: [
      {
        id: 'p1111111-1111-1111-1111-111111111111',
        title: 'Thread-Safe Connection Pool & Memory Cache Engine',
        description: 'Build a production-grade DB connection pool in Java utilizing lock-free queue concurrency, double-checked locking, and LRU memory eviction.',
        requirements: [
          'Implement a bounded blocking pool with maximum connection limit.',
          'Use ReentrantLock and Condition variables for thread synchronization.',
          'Implement an LRU eviction policy using ConcurrentHashMap and doubly linked lists.',
          'Handle memory leak prevention and graceful pool shutdown hooks.'
        ],
        starterCode: `public class ConnectionPool {\n  // TODO: Implement thread-safe connection pooling\n  public static void main(String[] args) {\n    System.out.println("Initializing Connection Pool...");\n  }\n}`,
        rubric: [
          'Correct thread synchronization without deadlocks.',
          'Clean eviction algorithm execution under concurrent pressure.',
          'Proper resource teardown and garbage collection friendliness.'
        ]
      }
    ],
    lessons: [
      {
        id: 'l1111111-1111-1111-1111-111111111111',
        title: 'JVM Architecture, Memory & GC Tuning',
        dayNumber: 1,
        concepts: [
          {
            id: 'co111111-1111-1111-1111-111111111111',
            title: 'JVM Memory (Heap vs Stack)',
            objectives: [
              'Distinguish between Stack frame execution and Heap object allocation.',
              'Understand Metaspace off-heap memory management.',
              'Identify memory leaks caused by static references.'
            ],
            analogy: 'Think of the Stack like a stack of cafeteria trays (LIFO: methods added on top and popped off when done). The Heap is like the open dining hall where tables and chairs (Objects) are dynamically arranged and cleaned up by custodians (Garbage Collectors).',
            content: `### JVM Memory Architecture

The Java Virtual Machine organizes memory into specialized regions:

1. **Thread Stack**:
   - Stores primitive values and references to Heap objects.
   - Allocated per thread. Managed strictly via LIFO stack frames.
   - StackOverflowError occurs when method call recursion exceeds \`-Xss\` limits.

2. **Heap Memory**:
   - Stores all instantiated objects (\`new Object()\`) and arrays.
   - Shared across all execution threads.
   - Divided into **Young Generation** (Eden, Survivor S0/S1) and **Old Generation**.

3. **Metaspace**:
   - Native off-heap memory introduced in Java 8 (replacing PermGen).
   - Holds class definitions, bytecode, runtime constant pools, and method metadata.`,
            walkthroughCode: `public class MemoryDemo {\n    public static void main(String[] args) {\n        int primitiveVar = 42; // Allocated on Stack frame\n        StringBuilder objectRef = new StringBuilder("JVM Memory"); // Ref on Stack, Object on Heap\n        System.out.println("Stack & Heap active: " + objectRef);\n    }\n}`,
            guidedExercise: {
              prompt: 'Write a small Java method that demonstrates how primitive variables are stored on the stack while string objects are allocated on the heap.',
              starterCode: `public class MemoryExercise {\n    public static void main(String[] args) {\n        // TODO: Declare a stack primitive and a heap object\n    }\n}`,
              solutionCode: `public class MemoryExercise {\n    public static void main(String[] args) {\n        int count = 100; // Stack\n        String msg = new String("Heap Allocation"); // Heap\n        System.out.println(msg + " count: " + count);\n    }\n}`
            },
            debuggingTask: {
              brokenCode: `import java.util.*;\npublic class MemoryLeak {\n    public static List<byte[]> cache = new ArrayList<>();\n    public static void main(String[] args) {\n        while(true) {\n            cache.add(new byte[1000000]); // Bug: Infinite static accumulation causes OutOfMemoryError\n        }\n    }\n}`,
              fixHint: 'Clear the static collection or limit the capacity to prevent Heap exhaustion.',
              solutionCode: `import java.util.*;\npublic class MemoryLeak {\n    public static List<byte[]> cache = new ArrayList<>();\n    public static void main(String[] args) {\n        for(int i=0; i<5; i++) {\n            cache.add(new byte[1000000]);\n        }\n        cache.clear(); // Cleared to allow GC\n        System.out.println("Memory cleared safely.");\n    }\n}`
            },
            commonPitfalls: [
              'Holding static references to large collections prevents Garbage Collection.',
              'Assuming primitives are stored on the heap — they live on the stack inside method frames.'
            ],
            bestPractices: [
              'Tune Heap limits carefully using -Xms (initial) and -Xmx (maximum).',
              'Use try-with-resources to close stream handles and avoid off-heap leaks.'
            ],
            performanceTips: 'Set initial heap size equal to maximum heap size (-Xms = -Xmx) in production to eliminate dynamic heap resizing overhead.',
            interviewQuestions: [
              {
                question: 'What is the difference between Heap and Stack memory in Java?',
                answer: 'Stack memory is thread-private and holds method call frames, local variables, and primitive types in LIFO order. Heap memory is shared across all threads, stores object instances, and is managed by the Garbage Collector.'
              }
            ],
            cheatSheet: 'Stack: Short-lived LIFO, method variables. Heap: Shared dynamic objects, GC managed. Metaspace: Class metadata in native off-heap memory.'
          },
          {
            id: 'co111111-2222-2222-2222-222222222222',
            title: 'Garbage Collection Algorithms & G1/ZGC Tuning',
            objectives: [
              'Understand the Weak Generational Hypothesis.',
              'Compare Stop-The-World (STW) pauses across Serial, Parallel, G1, and ZGC.',
              'Configure GC logging to diagnose memory pressure.'
            ],
            analogy: 'Imagine a factory line producing items. Mark-and-Sweep is like stopping the entire assembly line while sweepers clean up scrap. G1 GC cleans up small regions during minor pauses, while ZGC works alongside workers without stopping the line.',
            content: `### Garbage Collection Mechanics

1. **Weak Generational Hypothesis**:
   - Most objects die young (allocated in Eden, collected during Minor GC).
   - Survived objects migrate to Survivor spaces (S0/S1) and eventually to Old Gen.

2. **Garbage Collectors Comparison**:
   - **G1 GC**: Divide-and-conquer regional collector. Default since Java 9. Target pause time via \`-XX:MaxGCPauseMillis\`.
   - **ZGC**: Ultra low-latency collector (<1ms pause times) capable of handling terabytes of memory via colored pointers and load barriers.`
          }
        ]
      },
      {
        id: 'l1111111-2222-2222-2222-222222222222',
        title: 'SOLID Design Principles & Patterns',
        dayNumber: 2,
        concepts: [
          {
            id: 'co111111-3333-3333-3333-333333333333',
            title: 'SOLID Principles in Enterprise Java',
            objectives: [
              'Apply Single Responsibility and Open/Closed principles to class hierarchies.',
              'Refactor monolithic code bases into modular interfaces.'
            ],
            content: `### SOLID Refactoring Guidelines

- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle (Extend via interfaces, don't modify existing core)
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle`
          }
        ]
      }
    ]
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    title: 'Python & FastAPI Development',
    description: 'Asynchronous Python programming, Pydantic validation schemas, and high-performance API design.',
    difficulty: 'BEGINNER',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l2222222-1111-1111-1111-111111111111',
        title: 'Asynchronous Python Core',
        dayNumber: 1,
        concepts: [
          {
            id: 'co222222-1111-1111-1111-111111111111',
            title: 'FastAPI Event Loop & Async Mechanics',
            content: `### Python asyncio Mechanics
- Event loop processes asynchronous tasks concurrently without blocking thread resources.
- Use \`async def\` for I/O operations (database calls, network requests).`
          }
        ]
      }
    ]
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    title: 'Node.js & Express.js Backend',
    description: 'Master single-threaded non-blocking event loops, middleware architectures, and async I/O.',
    difficulty: 'INTERMEDIATE',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l3333333-1111-1111-1111-111111111111',
        title: 'Event Loop & Non-Blocking I/O',
        dayNumber: 1,
        concepts: [
          {
            id: 'co333333-1111-1111-1111-111111111111',
            title: 'Libuv Event Loop Stages',
            content: `### Libuv Loop Phases
1. Timers (setTimeout, setInterval)
2. Pending I/O Callbacks
3. Poll phase (incoming connections & file reads)
4. Check phase (setImmediate)
5. Close callbacks.`
          }
        ]
      }
    ]
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    title: 'Data Structures & Algorithms',
    description: 'Master array algorithms, sliding window, two-pointer patterns, complexity, sorting, and search.',
    difficulty: 'ADVANCED',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l4444444-1111-1111-1111-111111111111',
        title: 'Sliding Window & Two Pointers',
        dayNumber: 1,
        concepts: [
          {
            id: 'co444444-1111-1111-1111-111111111111',
            title: 'Dynamic Sliding Window Strategy',
            content: `### Sliding Window Pattern
- Reduces $O(N^2)$ brute-force nested loops down to $O(N)$ linear time complexity.
- Maintain left and right pointers expanding/shrinking based on constraint predicates.`
          }
        ]
      }
    ]
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    title: 'Relational Databases & SQL',
    description: 'Deep study of schema design, B-Tree indices, query plans, and transaction consistency.',
    difficulty: 'INTERMEDIATE',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l5555555-1111-1111-1111-111111111111',
        title: 'B-Tree Indexing & Query Plans',
        dayNumber: 1,
        concepts: [
          {
            id: 'co555555-1111-1111-1111-111111111111',
            title: 'B-Tree Index Structure',
            content: `### B-Tree Indexing
- Self-balancing search tree keeping data sorted in $O(\\log N)$ search time.
- Avoids sequential full table scans for high-cardinality lookups.`
          }
        ]
      }
    ]
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    title: 'Cloud & Client-Side Storage',
    description: 'Firebase Auth, Firestore real-time sync, IndexedDB, and localStorage persistence.',
    difficulty: 'BEGINNER',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l6666666-1111-1111-1111-111111111111',
        title: 'IndexedDB & Offline Storage',
        dayNumber: 1,
        concepts: [
          {
            id: 'co666666-1111-1111-1111-111111111111',
            title: 'Browser Offline Database',
            content: `### IndexedDB Architecture
- Transactional object database inside the browser environment.
- Stores large amounts of structured data for offline PWA web applications.`
          }
        ]
      }
    ]
  },
  {
    id: 'c7777777-7777-7777-7777-777777777777',
    title: 'Machine Learning & AI Integration',
    description: 'Matrix calculations in NumPy, Pandas data structures, scikit-learn models, and Gemini API.',
    difficulty: 'INTERMEDIATE',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l7777777-1111-1111-1111-111111111111',
        title: 'NumPy & Matrix Operations',
        dayNumber: 1,
        concepts: [
          {
            id: 'co777777-1111-1111-1111-111111111111',
            title: 'Vectorization & Tensor Math',
            content: `### NumPy Vectorization
- Performs element-wise operations on contiguous memory arrays in C.
- Replaces slow Python loops with hardware SIMD vectorized CPU instructions.`
          }
        ]
      }
    ]
  },
  {
    id: 'c8888888-8888-8888-8888-888888888888',
    title: 'Frontend & Video Processing',
    description: 'React state hooks, Tailwind CSS layout structures, and face-api.js webcam tracking.',
    difficulty: 'BEGINNER',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l8888888-1111-1111-1111-111111111111',
        title: 'React Rendering Pipeline & State',
        dayNumber: 1,
        concepts: [
          {
            id: 'co888888-1111-1111-1111-111111111111',
            title: 'Virtual DOM Reconciliation',
            content: `### React Diffing Algorithm
- Compares new Virtual DOM tree against previous tree in $O(N)$ heuristic time.
- Batches real DOM mutations to maximize browser paint performance.`
          }
        ]
      }
    ]
  },
  {
    id: 'c9999999-9999-9999-9999-999999999999',
    title: 'Security, Auth & Tooling',
    description: 'JWT token structures, Git branch workflows (merge vs rebase), and Vercel hosting.',
    difficulty: 'INTERMEDIATE',
    estimatedDays: 30,
    lessons: [
      {
        id: 'l9999999-1111-1111-1111-111111111111',
        title: 'JWT Authentication & Security',
        dayNumber: 1,
        concepts: [
          {
            id: 'co999999-1111-1111-1111-111111111111',
            title: 'HMAC-SHA256 Token Verification',
            content: `### JWT Token Layout
1. **Header**: Algorithm & Type (e.g. HS256)
2. **Payload**: User identity claims & expiration timestamp
3. **Signature**: Cryptographic HMAC signature preventing token tampering.`
          }
        ]
      }
    ]
  }
];
