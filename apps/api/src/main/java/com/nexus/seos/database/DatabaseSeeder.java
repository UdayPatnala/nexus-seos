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
            // Seed Course 1
            Course c1 = new Course();
            c1.setTitle("Software Engineering & System Design");
            c1.setDescription("Learn the fundamentals of software architecture, design patterns, and SOLID principles.");
            c1.setDifficulty("INTERMEDIATE");
            c1 = courseRepository.save(c1);

            // Lesson 1.1
            Lesson l1_1 = new Lesson();
            l1_1.setCourse(c1);
            l1_1.setTitle("SOLID Design Principles");
            l1_1.setOrderNo(1);
            l1_1 = lessonRepository.save(l1_1);

            // Concept 1.1.1
            Concept con1_1_1 = new Concept();
            con1_1_1.setLesson(l1_1);
            con1_1_1.setTitle("Single Responsibility & Open-Closed Principles");
            con1_1_1.setContent("Single Responsibility Principle (SRP) states that a class should have one, and only one, reason to change.\nOpen-Closed Principle (OCP) states that software entities should be open for extension but closed for modification.");
            conceptRepository.save(con1_1_1);

            // Concept 1.1.2
            Concept con1_1_2 = new Concept();
            con1_1_2.setLesson(l1_1);
            con1_1_2.setTitle("Liskov Substitution & Dependency Inversion");
            con1_1_2.setContent("Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of its subclasses without breaking the application.\nDependency Inversion Principle (DIP) states that high-level modules should not import anything from low-level modules. Both should depend on abstractions.");
            conceptRepository.save(con1_1_2);

            // Quiz 1.1
            Quiz q1_1 = new Quiz();
            q1_1.setLessonId(l1_1.getId());
            q1_1.setTitle("SOLID Principles Basics Quiz");
            quizRepository.save(q1_1);

            // Lesson 1.2
            Lesson l1_2 = new Lesson();
            l1_2.setCourse(c1);
            l1_2.setTitle("Design Patterns");
            l1_2.setOrderNo(2);
            l1_2 = lessonRepository.save(l1_2);

            // Concept 1.2.1
            Concept con1_2_1 = new Concept();
            con1_2_1.setLesson(l1_2);
            con1_2_1.setTitle("Creational Design Patterns");
            con1_2_1.setContent("Creational design patterns provide various object creation mechanisms, which increase flexibility and reuse of existing code. Examples include Singleton, Factory Method, Abstract Factory, Builder, and Prototype.");
            conceptRepository.save(con1_2_1);

            // Quiz 1.2
            Quiz q1_2 = new Quiz();
            q1_2.setLessonId(l1_2.getId());
            q1_2.setTitle("Creational Patterns Quiz");
            quizRepository.save(q1_2);

            // Seed Course 2
            Course c2 = new Course();
            c2.setTitle("Introduction to Java Programming");
            c2.setDescription("Learn the syntax, semantics, and object-oriented programming paradigm in Java.");
            c2.setDifficulty("BEGINNER");
            c2 = courseRepository.save(c2);

            // Lesson 2.1
            Lesson l2_1 = new Lesson();
            l2_1.setCourse(c2);
            l2_1.setTitle("Java Basics & OOP");
            l2_1.setOrderNo(1);
            l2_1 = lessonRepository.save(l2_1);

            // Concept 2.1.1
            Concept con2_1_1 = new Concept();
            con2_1_1.setLesson(l2_1);
            con2_1_1.setTitle("Classes, Objects, and Polymorphism");
            con2_1_1.setContent("Classes are blueprints for objects. Polymorphism allows us to perform a single action in different ways. In Java, polymorphism is achieved by method overloading and method overriding.");
            conceptRepository.save(con2_1_1);

            // Quiz 2.1
            Quiz q2_1 = new Quiz();
            q2_1.setLessonId(l2_1.getId());
            q2_1.setTitle("Java OOP Concepts Quiz");
            quizRepository.save(q2_1);
        }
    }
}
