import type { HomeworkAssignment } from '../types/homeworkTypes';

export const staticHomeworkAssignments: Record<string, HomeworkAssignment> = {
  // Lesson 1: Java Memory Architecture
  'lesson-1': {
    id: 'hw-lesson-1',
    lessonId: 'lesson-1',
    courseId: 'java-mastery',
    title: 'Mastery Assignment: Java JVM Memory Architecture & Heap Allocation',
    estimatedMinutes: 35,
    stage1Recall: [
      {
        id: 'r1',
        frontPrompt: 'What memory region in the JVM stores local primitive variables and method call frames?',
        backConceptSummary: 'The Stack memory stores primitive variables and references to objects. Each thread gets its own call stack.',
        keyTakeaway: 'Stack memory is short-lived, thread-safe, and managed using LIFO order.'
      },
      {
        id: 'r2',
        frontPrompt: 'Where are objects and instance variables stored during Java execution?',
        backConceptSummary: 'All Java objects and array allocations live in the Heap memory space, shared across all active threads.',
        keyTakeaway: 'Heap objects are garbage-collected when no references point to them.'
      }
    ],
    stage2Verification: [
      {
        id: 'v1',
        type: 'MCQ',
        question: 'Which garbage collection algorithm phase identifies objects that are no longer reachable from GC roots?',
        options: ['Compaction Phase', 'Mark Phase', 'Sweep Phase', 'Young Generation Copying'],
        correctAnswer: 'Mark Phase',
        explanation: 'The Mark phase traverses object references starting from GC Roots to label reachable objects.'
      }
    ],
    stage3Application: [
      {
        id: 'a1',
        type: 'PREDICT_OUTPUT',
        prompt: 'Predict the console output of the following Java snippet:',
        snippet: `String s1 = "Nexus";\nString s2 = "Nexus";\nString s3 = new String("Nexus");\nSystem.out.println((s1 == s2) + " " + (s1 == s3) + " " + s1.equals(s3));`,
        expectedKeywords: ['true false true'],
        solutionExplanation: 's1 == s2 is true (same literal pool address). s1 == s3 is false (different heap references). s1.equals(s3) is true (same value content).'
      }
    ],
    stage4Practical: [
      {
        id: 'p1',
        title: 'Implement Custom RingBuffer with Zero-Allocation Object Reuse',
        instructions: 'Write a ring buffer data structure that reuses object allocations to minimize Heap allocation overhead during high-frequency telemetry logging.',
        starterCode: `public class TelemetryRingBuffer {\n    private final String[] buffer;\n    private int head = 0, tail = 0, capacity;\n\n    public TelemetryRingBuffer(int capacity) {\n        this.capacity = capacity;\n        this.buffer = new String[capacity];\n    }\n\n    public void add(String data) {\n        // TODO: Insert data into circular buffer\n    }\n}`,
        solutionCode: `public class TelemetryRingBuffer {\n    private final String[] buffer;\n    private int head = 0, tail = 0, count = 0, capacity;\n\n    public TelemetryRingBuffer(int capacity) {\n        this.capacity = capacity;\n        this.buffer = new String[capacity];\n    }\n\n    public void add(String data) {\n        buffer[tail] = data;\n        tail = (tail + 1) % capacity;\n        if (count < capacity) count++; else head = (head + 1) % capacity;\n    }\n}`,
        testCases: [
          { input: 'add("event-1")', expectedOutput: 'Inserted' }
        ],
        hint: 'Use modulo arithmetic `(tail + 1) % capacity` to wrap pointer around without reallocating arrays.'
      }
    ],
    stage5RealWorld: [
      {
        id: 'rw1',
        title: 'Production Outage: Resolving java.lang.OutOfMemoryError (Metaspace)',
        businessContext: 'High-traffic e-commerce microservice crashed during Black Friday sale with `java.lang.OutOfMemoryError: Metaspace`.',
        problemStatement: 'Analyze the heap dump snippet and identify why dynamic class generation by CGLIB proxies flooded Metaspace.',
        architectureSnippet: `Enhancer enhancer = new Enhancer();\nenhancer.setSuperclass(OrderProcessor.class);\nenhancer.setUseCache(false);`,
        tasks: [
          'Identify why setting `useCache(false)` caused Metaspace growth.',
          'Formulate hotfix for Spring proxy generation.'
        ],
        rubric: [
          'Correctly identifies disabling proxy caching as root cause.'
        ]
      }
    ],
    stage6Challenge: [
      {
        id: 'c1',
        title: 'FAANG Interview: LRU Cache with O(1) Access and Zero Memory Leaks',
        timeLimitSeconds: 600,
        question: 'Design a Data Structure for Least Recently Used (LRU) Cache supporting `get` and `put` operations in O(1) time complexity without causing reference leaks.',
        faangTopicTag: 'Google / Meta High Frequency Data Structures',
        expectedOutputOrBehavior: 'All operations return in O(1) time complexity. Memory reclaimed cleanly upon deletion.'
      }
    ],
    stage7Reflection: [
      {
        id: 'ref1',
        prompt: 'Which JVM memory concept was most counter-intuitive or difficult for you today?',
        category: 'DIFFICULTY'
      }
    ]
  },

  // Lesson 2: Concurrency & Lock-Free Data Structures
  'lesson-2': {
    id: 'hw-lesson-2',
    lessonId: 'lesson-2',
    courseId: 'java-mastery',
    title: 'Mastery Assignment: Lock-Free Concurrency & CAS (Compare-And-Swap)',
    estimatedMinutes: 40,
    stage1Recall: [
      {
        id: 'r2-1',
        frontPrompt: 'What hardware CPU instruction enables non-blocking atomic updates in Java AtomicInteger?',
        backConceptSummary: 'Compare-And-Swap (CAS) is an atomic CPU instruction that updates a memory location only if it matches expected value.',
        keyTakeaway: 'CAS avoids expensive thread context switching caused by synchronized OS locks.'
      }
    ],
    stage2Verification: [
      {
        id: 'v2-1',
        type: 'MCQ',
        question: 'What race condition phenomenon occurs when a CAS location changes from value A to B and back to A before comparison?',
        options: ['Livelock', 'Deadlock', 'ABA Problem', 'Thread Starvation'],
        correctAnswer: 'ABA Problem',
        explanation: 'The ABA problem occurs when a thread sees value A, gets preempted while A changes to B and back to A, misleading the CAS check.'
      }
    ],
    stage3Application: [
      {
        id: 'a2-1',
        type: 'FIND_BUG',
        prompt: 'Explain the thread-safety flaw in this double-checked locking singleton without volatile:',
        snippet: `if (instance == null) {\n    synchronized(Helper.class) {\n        if (instance == null) instance = new Helper();\n    }\n}`,
        solutionExplanation: 'Without `volatile`, instruction reordering allows another thread to observe a non-null reference before object construction completes.'
      }
    ],
    stage4Practical: [
      {
        id: 'p2-1',
        title: 'Implement Lock-Free Atomic Counter using AtomicReference',
        instructions: 'Write a non-blocking thread-safe counter using CAS loops with AtomicReference.',
        starterCode: `public class LockFreeCounter {\n    private final AtomicInteger value = new AtomicInteger(0);\n    public void increment() {\n        // TODO: CAS retry loop\n    }\n}`,
        solutionCode: `public class LockFreeCounter {\n    private final AtomicInteger value = new AtomicInteger(0);\n    public void increment() {\n        int current;\n        do {\n            current = value.get();\n        } while (!value.compareAndSet(current, current + 1));\n    }\n}`,
        testCases: [{ input: 'increment() x100 threads', expectedOutput: '100' }],
        hint: 'Use a `do { ... } while (!atomic.compareAndSet(expected, updated));` retry loop.'
      }
    ],
    stage5RealWorld: [
      {
        id: 'rw2-1',
        title: 'High-Throughput Financial Exchange: Thread Contention Bottleneck',
        businessContext: 'Trading gateway experienced high CPU usage and thread starvation under 100,000 requests/sec.',
        problemStatement: 'Redesign order queue from `LinkedBlockingQueue` (synchronized lock) to Disruptor RingBuffer (lock-free CAS).',
        tasks: ['Analyze mutex contention vs lock-free ring buffer', 'Formulate lock-free queue topology'],
        rubric: ['Identifies mutex lock acquisition overhead in high thread count environment.']
      }
    ],
    stage6Challenge: [
      {
        id: 'c2-1',
        title: 'FAANG Interview: Concurrent Bounded Queue without ReentrantLock',
        timeLimitSeconds: 900,
        question: 'Implement a thread-safe Bounded Queue supporting concurrent enqueue/dequeue using atomic CAS arrays.',
        faangTopicTag: 'High-Frequency Trading & Systems Architecture',
        expectedOutputOrBehavior: 'Zero lock locks used. High throughput under 64 parallel threads.'
      }
    ],
    stage7Reflection: [
      {
        id: 'ref2-1',
        prompt: 'How does Lock-Free CAS compare with traditional synchronized blocks in terms of throughput vs contention?',
        category: 'LESSONS_LEARNED'
      }
    ]
  }
};
