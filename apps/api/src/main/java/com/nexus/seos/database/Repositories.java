package com.nexus.seos.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class Repositories {

    @Repository
    public interface UserRepository extends JpaRepository<User, UUID> {
        Optional<User> findByEmail(String email);
    }

    @Repository
    public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    }

    @Repository
    public interface CourseRepository extends JpaRepository<Course, UUID> {
    }

    @Repository
    public interface LessonRepository extends JpaRepository<Lesson, UUID> {
        List<Lesson> findByCourseIdOrderByOrderNoAsc(UUID courseId);
    }

    @Repository
    public interface ConceptRepository extends JpaRepository<Concept, UUID> {
        List<Concept> findByLessonId(UUID lessonId);
    }

    @Repository
    public interface NoteRepository extends JpaRepository<Note, UUID> {
        List<Note> findByUserId(UUID userId);
        Optional<Note> findByUserIdAndConceptId(UUID userId, UUID conceptId);
    }

    @Repository
    public interface ProjectRepository extends JpaRepository<Project, UUID> {
        List<Project> findByUserId(UUID userId);
    }

    @Repository
    public interface ExecutionRepository extends JpaRepository<Execution, UUID> {
        List<Execution> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    }

    @Repository
    public interface QuizRepository extends JpaRepository<Quiz, UUID> {
        List<Quiz> findByLessonId(UUID lessonId);
    }

    @Repository
    public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
        List<QuizAttempt> findByUserId(UUID userId);
        List<QuizAttempt> findByQuizIdAndUserId(UUID quizId, UUID userId);
    }

    @Repository
    public interface ConceptCompletionRepository extends JpaRepository<ConceptCompletion, UUID> {
        List<ConceptCompletion> findByUserId(UUID userId);
        Optional<ConceptCompletion> findByUserIdAndConceptId(UUID userId, UUID conceptId);
        List<ConceptCompletion> findByUserIdAndConceptIdIn(UUID userId, java.util.Collection<UUID> conceptIds);
    }
}
