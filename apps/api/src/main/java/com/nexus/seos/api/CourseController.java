package com.nexus.seos.api;

import com.nexus.seos.database.*;
import com.nexus.seos.database.Repositories.*;
import com.nexus.seos.core.MasteryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ConceptRepository conceptRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ConceptCompletionRepository conceptCompletionRepository;
    private final MasteryService masteryService;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public CourseController(CourseRepository courseRepository, LessonRepository lessonRepository,
                            ConceptRepository conceptRepository, QuizRepository quizRepository,
                            QuizAttemptRepository quizAttemptRepository, ConceptCompletionRepository conceptCompletionRepository,
                            MasteryService masteryService, JwtTokenProvider tokenProvider) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.conceptRepository = conceptRepository;
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.conceptCompletionRepository = conceptCompletionRepository;
        this.masteryService = masteryService;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping
    public ResponseEntity<?> getCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/{courseId}/lessons")
    public ResponseEntity<?> getLessons(@PathVariable UUID courseId) {
        return ResponseEntity.ok(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId));
    }

    @GetMapping("/lessons/{lessonId}/concepts")
    public ResponseEntity<?> getConcepts(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(conceptRepository.findByLessonId(lessonId));
    }

    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<?> getQuizzes(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(quizRepository.findByLessonId(lessonId));
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuizAttempt(
            @PathVariable UUID quizId,
            @RequestBody Map<String, Double> request,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);
        Double score = request.get("score"); // 0.0 to 100.0

        if (score == null || score < 0.0 || score > 100.0) {
            return ResponseEntity.status(400).body(Map.of("error", "Quiz score must be between 0.0 and 100.0."));
        }

        if (!quizRepository.existsById(quizId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Quiz not found."));
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quizId);
        attempt.setUserId(userId);
        attempt.setScore(score);
        quizAttemptRepository.save(attempt);

        return ResponseEntity.ok(Map.of("message", "Quiz attempt submitted successfully.", "score", score));
    }

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
}
