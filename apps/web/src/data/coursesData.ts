export interface Concept {
  id: string;
  title: string;
  content: string;
}

export interface Lesson {
  id: string;
  title: string;
  concepts: Concept[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  lessons: Lesson[];
}

export const staticCourses: Course[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    title: 'Java & Object-Oriented Design',
    description: 'Deep study of Java syntax, collections internals, JVM memory, GC tuning, and SOLID design.',
    difficulty: 'INTERMEDIATE',
    lessons: [
      {
        id: 'l1111111-1111-1111-1111-111111111111',
        title: 'JVM Architecture & GC',
        concepts: [
          {
            id: 'co111111-1111-1111-1111-111111111111',
            title: 'JVM memory (Heap vs Stack)',
            content: `### JVM Memory Layout
- **Stack**: Frame-based storage for local variables and execution paths. Fast LIFO access. Size set via \`-Xss\`.
- **Heap**: Stores all instance objects. Shared across threads. Set via \`-Xms\` and \`-Xmx\`.
- **Metaspace**: Stores class metadata, bytecode, and method details in native off-heap memory.`
          },
          {
            id: 'co111111-2222-2222-2222-222222222222',
            title: 'Garbage Collection tuning',
            content: `### GC Collectors
- **Generational hypothesis**: Heap split into Eden, S0, S1 (Young) and Old generation.
- **G1 GC**: Garbage-First. Splits heap into regions, targeting memory-heavy regions to minimize pause times.
- **ZGC**: Low-latency collector designed to scale to TBs with pause times under 10ms.`
          }
        ]
      },
      {
        id: 'l1111111-2222-2222-2222-222222222222',
        title: 'Object-Oriented Design Principles',
        concepts: [
          {
            id: 'co111111-3333-3333-3333-333333333333',
            title: 'SOLID Principles',
            content: `### SOLID Principles of OOD
- **S (Single Responsibility)**: A class should have exactly one reason to change.
- **O (Open/Closed)**: Extend functionality via polymorphism without modifying existing source code.
- **L (Liskov Substitution)**: Derived classes must be completely substitutable for their base classes.
- **I (Interface Segregation)**: Prefer small, client-specific interfaces over massive, general ones.
- **D (Dependency Inversion)**: Depend on abstractions rather than concrete modules.`
          }
        ]
      }
    ]
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    title: 'Python & FastAPI Development',
    description: 'Asynchronous Python programming, Pydantic validation, and dependency injection patterns.',
    difficulty: 'BEGINNER',
    lessons: [
      {
        id: 'l2222222-1111-1111-1111-111111111111',
        title: 'Asynchronous Python & FastAPI Core',
        concepts: [
          {
            id: 'co222222-1111-1111-1111-111111111111',
            title: 'FastAPI async/await mechanics',
            content: `### Asynchronous API Handlers
- Python's \`asyncio\` event loop executes non-blocking tasks concurrently.
- Use \`async def\` for I/O bound endpoints (e.g., database queries, third-party API fetches).
- Use standard \`def\` if the endpoint contains blocking synchronous code (runs in a separate threadpool).`
          },
          {
            id: 'co222222-2222-2222-2222-222222222222',
            title: 'Pydantic Schema Validation',
            content: `### Pydantic Data Parsing
- Validates incoming JSON payloads against declared model types at runtime.
- Exposes type hints to build OpenAPI documentation automatically.
- Supports custom validators and strict/lax parsing modes.`
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
    lessons: [
      {
        id: 'l3333333-1111-1111-1111-111111111111',
        title: 'Node.js Event Loop & Middleware',
        concepts: [
          {
            id: 'co333333-1111-1111-1111-111111111111',
            title: 'Event Loop Phases',
            content: `### Node.js Event Loop
1. **Timers**: Executes \`setTimeout\` and \`setInterval\` callbacks.
2. **Pending Callbacks**: Executes I/O errors and pending system callbacks.
3. **Poll**: Retrieves new I/O events and executes scripts.
4. **Check**: Executes \`setImmediate\` callbacks.
5. **Close Callbacks**: Cleans up socket connections.`
          },
          {
            id: 'co333333-2222-2222-2222-222222222222',
            title: 'Express Middleware Pipeline',
            content: `### Express Middleware
- Functions having access to \`req\`, \`res\`, and \`next\` in the request-response cycle.
- Can modify request parameters, authenticate users, or terminate the pipeline early.
- Standard pipeline order is critical for routing and error handling.`
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
    lessons: [
      {
        id: 'l4444444-1111-1111-1111-111111111111',
        title: 'Array & Sliding Window Patterns',
        concepts: [
          {
            id: 'co444444-1111-1111-1111-111111111111',
            title: 'Sliding Window Pattern',
            content: `### Sliding Window Algorithm
- Optimizes nested loop O(N²) subarrays to linear O(N) runtime.
- **Fixed Window**: Slide window of constant size K.
- **Dynamic Window**: Expand/shrink boundaries based on condition criteria.`
          },
          {
            id: 'co444444-2222-2222-2222-222222222222',
            title: 'Two-Pointer Strategy',
            content: `### Two-Pointer Scanning
- Typically used in sorted arrays to find targets (opposite directions) or detect cycles (slow/fast runner).`
          }
        ]
      }
    ]
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    title: 'Relational Databases & SQL',
    description: 'Deep study of schema design, indices, query plans, and transaction consistency.',
    difficulty: 'INTERMEDIATE',
    lessons: [
      {
        id: 'l5555555-1111-1111-1111-111111111111',
        title: 'Query Optimization & ACID',
        concepts: [
          {
            id: 'co555555-1111-1111-1111-111111111111',
            title: 'B-Tree Indices',
            content: `### B-Tree Indexing
- Self-balancing search tree keeping keys sorted for O(log N) lookups.
- **Leftmost Prefix**: Composite indices require left-to-right matching columns to trigger optimization.`
          },
          {
            id: 'co555555-2222-2222-2222-222222222222',
            title: 'ACID properties & Isolation levels',
            content: `### Database Transactions
- **ACID**: Atomicity, Consistency, Isolation, Durability.
- **Isolation Levels**: Read Uncommitted, Read Committed, Repeatable Read, Serializable.`
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
    lessons: [
      {
        id: 'l6666666-1111-1111-1111-111111111111',
        title: 'Client & Firebase Storage',
        concepts: [
          {
            id: 'co666666-1111-1111-1111-111111111111',
            title: 'Firestore Sync vs IndexedDB',
            content: `### Database Sync Mechanisms
- **Firestore**: Document database supporting real-time listeners (\`onSnapshot\`) and offline persistence.
- **IndexedDB**: Standard transactional browser object database for storing large client-side binary data.`
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
    lessons: [
      {
        id: 'l7777777-1111-1111-1111-111111111111',
        title: 'Machine Learning Pipelines',
        concepts: [
          {
            id: 'co777777-1111-1111-1111-111111111111',
            title: 'NumPy & Pandas Operations',
            content: `### Data Manipulation
- **NumPy**: Element-wise array math operations built on optimized C libraries.
- **Pandas**: DataFrame analysis operations for filtering, joining, and cleaning tabular data.`
          },
          {
            id: 'co777777-2222-2222-2222-222222222222',
            title: 'scikit-learn fit/predict pipeline',
            content: `### Model Training Flow
1. **Preprocess**: Clean, scale features (StandardScaler), and split train/test datasets.
2. **Fit**: Minimize loss function weights on training inputs.
3. **Predict**: Evaluate test set validation metrics.`
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
    lessons: [
      {
        id: 'l8888888-1111-1111-1111-111111111111',
        title: 'React State & Canvas frames',
        concepts: [
          {
            id: 'co888888-1111-1111-1111-111111111111',
            title: 'React hooks state management',
            content: `### React State & Lifecycle
- \`useState\`: Declares reactive variables that trigger a re-render on change.
- \`useEffect\`: Executes side-effects, handles subscription cleanups, and tracks dependencies.`
          },
          {
            id: 'co888888-2222-2222-2222-222222222222',
            title: 'face-api.js Canvas Rendering',
            content: `### Real-time Webcam Face Tracking
- Accesses camera streams via browser \`navigator.mediaDevices.getUserMedia\`.
- Pipes frame data into a canvas element, calling models to run expression classification.`
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
    lessons: [
      {
        id: 'l9999999-1111-1111-1111-111111111111',
        title: 'JWT Security & Git Workflows',
        concepts: [
          {
            id: 'co999999-1111-1111-1111-111111111111',
            title: 'JWT Tokens structure',
            content: `### JSON Web Tokens (JWT)
- Stateless tokens split into Header, Payload (claims), and Signature.
- Signed using symmetric HS256 or asymmetric RS256 algorithms to prevent tampering.`
          },
          {
            id: 'co999999-2222-2222-2222-222222222222',
            title: 'Git workflows (Merge vs Rebase)',
            content: `### Git History Strategies
- **Merge**: Combines target branches, creating a new merge commit. Preserves exact history.
- **Rebase**: Rewrites project history by applying commits individually on top of target branch base.`
          }
        ]
      }
    ]
  }
];
