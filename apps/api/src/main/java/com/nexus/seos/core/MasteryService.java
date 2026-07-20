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
    private final SpacedRepetitionRepository spacedRepetitionRepository;

    @Autowired
    public MasteryService(QuizAttemptRepository quizAttemptRepository,
                          ConceptCompletionRepository conceptCompletionRepository,
                          LessonRepository lessonRepository,
                          QuizRepository quizRepository,
                          ConceptRepository conceptRepository,
                          SpacedRepetitionRepository spacedRepetitionRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.conceptCompletionRepository = conceptCompletionRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
        this.conceptRepository = conceptRepository;
        this.spacedRepetitionRepository = spacedRepetitionRepository;
    }

    /**
     * Calculate mastery score (0-100) for a given user on a specific module/course.
     * Simple Mastery Algorithm: 
     * - Base (40% weight): Ratio of attempted quizzes to total quizzes
     * - Performance (60% weight): Average score of the latest attempts
     */
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
                List<QuizAttempt> mutableAttempts = new ArrayList<>(attempts);
                mutableAttempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
                totalScoreSum += mutableAttempts.get(0).getScore(); // Assuming score is 0.0 to 100.0
            }
        }

        double attemptRatio = (double) attemptedCount / quizIds.size();
        double averageScore = attemptedCount > 0 ? (totalScoreSum / attemptedCount) : 0.0;

        // Mastery Score formula: 40% completion weight + 60% performance weight
        double mastery = (attemptRatio * 40.0) + ((averageScore / 100.0) * 60.0);
        return Math.min(100.0, Math.max(0.0, mastery));
    }

    /**
     * Calculate mastery score (0-100) combining:
     * - 20% concept completion
     * - 20% quiz completion
     * - 60% average latest quiz scores
     */
    public double calculateMasteryScore(UUID userId, List<UUID> quizIds, List<UUID> conceptIds) {
        if (quizIds.isEmpty() && conceptIds.isEmpty()) {
            return 0.0;
        }

        // 1. Concept Completion Ratio (20% weight)
        double conceptCompletionRatio = 0.0;
        if (!conceptIds.isEmpty()) {
            List<ConceptCompletion> completions = conceptCompletionRepository.findByUserIdAndConceptIdIn(userId, conceptIds);
            conceptCompletionRatio = (double) completions.size() / conceptIds.size();
        }

        // 2. Quiz Performance and Completion (20% completion weight + 60% performance weight)
        double quizAttemptRatio = 0.0;
        double averageScore = 0.0;
        if (!quizIds.isEmpty()) {
            int attemptedCount = 0;
            double totalScoreSum = 0.0;

            for (UUID quizId : quizIds) {
                List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
                if (!attempts.isEmpty()) {
                    attemptedCount++;
                    // Find latest attempt score
                    List<QuizAttempt> mutableAttempts = new ArrayList<>(attempts);
                    mutableAttempts.sort(Comparator.comparing(QuizAttempt::getSubmittedAt).reversed());
                    totalScoreSum += mutableAttempts.get(0).getScore();
                }
            }
            quizAttemptRatio = (double) attemptedCount / quizIds.size();
            averageScore = attemptedCount > 0 ? (totalScoreSum / attemptedCount) : 0.0;
        }

        // 3. Combined Mastery Score calculation
        double mastery = 0.0;
        if (!conceptIds.isEmpty() && !quizIds.isEmpty()) {
            mastery = (conceptCompletionRatio * 20.0) + (quizAttemptRatio * 20.0) + ((averageScore / 100.0) * 60.0);
        } else if (!conceptIds.isEmpty()) {
            mastery = conceptCompletionRatio * 100.0; // Fallback: no quizzes in course
        } else {
            mastery = (quizAttemptRatio * 40.0) + ((averageScore / 100.0) * 60.0); // Fallback: no concepts in course
        }

        return Math.min(100.0, Math.max(0.0, mastery));
    }

    /**
     * Calculate mastery score (0-100) for a user in a specific course by loading concepts and quizzes.
     */
    public double calculateMasteryScore(UUID userId, UUID courseId) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderNoAsc(courseId);
        List<UUID> conceptIds = new ArrayList<>();
        List<UUID> quizIds = new ArrayList<>();

        for (Lesson lesson : lessons) {
            conceptRepository.findByLessonId(lesson.getId()).forEach(c -> conceptIds.add(c.getId()));
            quizRepository.findByLessonId(lesson.getId()).forEach(q -> quizIds.add(q.getId()));
        }

        return calculateMasteryScore(userId, quizIds, conceptIds);
    }

    /**
     * Calculate learning velocity (e.g. average mastery gain per day over last 7 days).
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

    /**
     * Calculate Retention Index (%) based on Ebbinghaus memory decay curve.
     */
    public double calculateRetentionIndex(UUID userId) {
        List<ConceptCompletion> completions = conceptCompletionRepository.findByUserId(userId);
        if (completions.isEmpty()) {
            return 85.0; // Default baseline retention
        }
        long overdueCount = spacedRepetitionRepository.findByUserIdAndNextReviewAtBefore(userId, java.time.LocalDateTime.now()).size();
        double total = completions.size();
        double retention = Math.max(40.0, 100.0 - ((overdueCount / Math.max(1.0, total)) * 40.0));
        return Math.round(retention * 10.0) / 10.0;
    }

    /**
     * Calculate FAANG Interview Readiness Index (0-100%).
     */
    public double calculateInterviewReadiness(UUID userId) {
        List<ConceptCompletion> completions = conceptCompletionRepository.findByUserId(userId);
        double velocity = calculateLearningVelocity(userId);
        double baseScore = (completions.size() * 5.0) + (velocity * 10.0);
        return Math.min(100.0, Math.max(15.0, Math.round(baseScore * 10.0) / 10.0));
    }

    /**
     * Get count of concepts overdue for Spaced Repetition active recall review.
     */
    public int getOverdueSpacedReviewsCount(UUID userId) {
        return spacedRepetitionRepository.findByUserIdAndNextReviewAtBefore(userId, java.time.LocalDateTime.now()).size();
    }
}
