package com.nexus.seos.core;

import com.nexus.seos.database.*;
import com.nexus.seos.database.Repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MasteryServiceTest {

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private ConceptCompletionRepository conceptCompletionRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private ConceptRepository conceptRepository;

    @InjectMocks
    private MasteryService masteryService;

    @Test
    public void testCalculateMasteryScore_EmptyCourse() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        when(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId)).thenReturn(Collections.emptyList());

        double score = masteryService.calculateMasteryScore(userId, courseId);
        assertEquals(0.0, score, 0.001);
    }

    @Test
    public void testCalculateMasteryScore_NoConceptsAndQuizzes() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        Lesson lesson = new Lesson();
        lesson.setId(UUID.randomUUID());

        when(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId)).thenReturn(List.of(lesson));
        when(conceptRepository.findByLessonId(lesson.getId())).thenReturn(Collections.emptyList());
        when(quizRepository.findByLessonId(lesson.getId())).thenReturn(Collections.emptyList());

        double score = masteryService.calculateMasteryScore(userId, courseId);
        assertEquals(0.0, score, 0.001);
    }

    @Test
    public void testCalculateMasteryScore_PartialCompletion() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        
        Lesson lesson = new Lesson();
        UUID lessonId = UUID.randomUUID();
        lesson.setId(lessonId);

        Concept concept1 = new Concept();
        concept1.setId(UUID.randomUUID());
        Concept concept2 = new Concept();
        concept2.setId(UUID.randomUUID());

        Quiz quiz1 = new Quiz();
        quiz1.setId(UUID.randomUUID());
        Quiz quiz2 = new Quiz();
        quiz2.setId(UUID.randomUUID());

        when(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId)).thenReturn(List.of(lesson));
        when(conceptRepository.findByLessonId(lessonId)).thenReturn(List.of(concept1, concept2));
        when(quizRepository.findByLessonId(lessonId)).thenReturn(List.of(quiz1, quiz2));

        // Concept 1 is completed, Concept 2 is not
        ConceptCompletion completion1 = new ConceptCompletion();
        completion1.setUserId(userId);
        completion1.setConceptId(concept1.getId());

        when(conceptCompletionRepository.findByUserIdAndConceptIdIn(eq(userId), anyCollection()))
                .thenReturn(List.of(completion1));

        // Quiz 1 is attempted (score 80), Quiz 2 is not attempted
        QuizAttempt attempt1 = new QuizAttempt();
        attempt1.setQuizId(quiz1.getId());
        attempt1.setUserId(userId);
        attempt1.setScore(80.0);
        attempt1.setSubmittedAt(LocalDateTime.now());

        when(quizAttemptRepository.findByQuizIdAndUserId(quiz1.getId(), userId)).thenReturn(List.of(attempt1));
        when(quizAttemptRepository.findByQuizIdAndUserId(quiz2.getId(), userId)).thenReturn(Collections.emptyList());

        // Calculation:
        // Concept completion ratio = 1/2 = 0.5 (weight 20% -> 10.0 points)
        // Quiz completion ratio = 1/2 = 0.5 (weight 20% -> 10.0 points)
        // Average quiz score = 80.0 (weight 60% -> 48.0 points)
        // Total expected = 10.0 + 10.0 + 48.0 = 68.0
        double score = masteryService.calculateMasteryScore(userId, courseId);
        assertEquals(68.0, score, 0.001);
    }

    @Test
    public void testCalculateMasteryScore_FullCompletion() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        
        Lesson lesson = new Lesson();
        UUID lessonId = UUID.randomUUID();
        lesson.setId(lessonId);

        Concept concept1 = new Concept();
        concept1.setId(UUID.randomUUID());

        Quiz quiz1 = new Quiz();
        quiz1.setId(UUID.randomUUID());

        when(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId)).thenReturn(List.of(lesson));
        when(conceptRepository.findByLessonId(lessonId)).thenReturn(List.of(concept1));
        when(quizRepository.findByLessonId(lessonId)).thenReturn(List.of(quiz1));

        ConceptCompletion completion1 = new ConceptCompletion();
        completion1.setUserId(userId);
        completion1.setConceptId(concept1.getId());

        when(conceptCompletionRepository.findByUserIdAndConceptIdIn(eq(userId), anyCollection()))
                .thenReturn(List.of(completion1));

        QuizAttempt attempt1 = new QuizAttempt();
        attempt1.setQuizId(quiz1.getId());
        attempt1.setUserId(userId);
        attempt1.setScore(100.0);
        attempt1.setSubmittedAt(LocalDateTime.now());

        when(quizAttemptRepository.findByQuizIdAndUserId(quiz1.getId(), userId)).thenReturn(List.of(attempt1));

        // Calculation:
        // Concept completion ratio = 1/1 = 1.0 (weight 20% -> 20.0 points)
        // Quiz completion ratio = 1/1 = 1.0 (weight 20% -> 20.0 points)
        // Average quiz score = 100.0 (weight 60% -> 60.0 points)
        // Total expected = 20.0 + 20.0 + 60.0 = 100.0
        double score = masteryService.calculateMasteryScore(userId, courseId);
        assertEquals(100.0, score, 0.001);
    }

    @Test
    public void testCalculateMasteryScore_FallbackNoQuizzes() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        
        Lesson lesson = new Lesson();
        UUID lessonId = UUID.randomUUID();
        lesson.setId(lessonId);

        Concept concept1 = new Concept();
        concept1.setId(UUID.randomUUID());

        when(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId)).thenReturn(List.of(lesson));
        when(conceptRepository.findByLessonId(lessonId)).thenReturn(List.of(concept1));
        when(quizRepository.findByLessonId(lessonId)).thenReturn(Collections.emptyList());

        ConceptCompletion completion1 = new ConceptCompletion();
        completion1.setUserId(userId);
        completion1.setConceptId(concept1.getId());

        when(conceptCompletionRepository.findByUserIdAndConceptIdIn(eq(userId), anyCollection()))
                .thenReturn(List.of(completion1));

        // Calculation:
        // Concept completion ratio = 1/1 = 1.0
        // No quizzes -> Fallback concept completion weight 100% -> 100.0
        double score = masteryService.calculateMasteryScore(userId, courseId);
        assertEquals(100.0, score, 0.001);
    }

    @Test
    public void testCalculateMasteryScore_FallbackNoConcepts() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        
        Lesson lesson = new Lesson();
        UUID lessonId = UUID.randomUUID();
        lesson.setId(lessonId);

        Quiz quiz1 = new Quiz();
        quiz1.setId(UUID.randomUUID());

        when(lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId)).thenReturn(List.of(lesson));
        when(conceptRepository.findByLessonId(lessonId)).thenReturn(Collections.emptyList());
        when(quizRepository.findByLessonId(lessonId)).thenReturn(List.of(quiz1));

        QuizAttempt attempt1 = new QuizAttempt();
        attempt1.setQuizId(quiz1.getId());
        attempt1.setUserId(userId);
        attempt1.setScore(90.0);
        attempt1.setSubmittedAt(LocalDateTime.now());

        when(quizAttemptRepository.findByQuizIdAndUserId(quiz1.getId(), userId)).thenReturn(List.of(attempt1));

        // Calculation:
        // No concepts -> Fallback to original formula (40% completion + 60% performance)
        // Quiz completion ratio = 1.0 (weight 40% -> 40.0 points)
        // Average score = 90.0 (weight 60% -> 54.0 points)
        // Total expected = 40.0 + 54.0 = 94.0
        double score = masteryService.calculateMasteryScore(userId, courseId);
        assertEquals(94.0, score, 0.001);
    }
}
