import type { HomeworkAssignment } from '../types/homeworkTypes';

export const staticHomeworkAssignments: Record<string, HomeworkAssignment> = {
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
        explanation: 'The Mark phase traverses object references starting from GC Roots (stack references, static fields) to label reachable objects.'
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
          'Formulate hotfix for Spring proxy generation.',
          'Explain how GC handles Metaspace vs Heap.'
        ],
        rubric: [
          'Correctly identifies disabling proxy caching as root cause.',
          'Explains class metadata lifetime in Metaspace.'
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
  }
};
