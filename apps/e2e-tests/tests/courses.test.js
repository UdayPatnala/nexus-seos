import test from 'node:test';
import assert from 'node:assert';
import {
  register,
  getCourses,
  getLessons,
  getConcepts,
  getQuizzes,
  completeConcept,
  submitQuiz,
  getMastery
} from '../utils/api-client.js';

test('Course & Concept Management Tests', async (t) => {
  const uniqueId = Date.now();
  const email = `course_student_${uniqueId}@nexus.edu`;
  const password = 'password123';
  const fullName = `Jane Course Doe ${uniqueId}`;
  
  let token = null;
  const validCourseId = "a0e0a0e0-0000-0000-0000-000000000001";
  const validLessonId = "a0e0a0e0-0000-0000-0000-000000000002";
  const validConceptId1 = "a0e0a0e0-0000-0000-0000-000000000003";
  const validConceptId2 = "a0e0a0e0-0000-0000-0000-000000000004";
  const validQuizId = "a0e0a0e0-0000-0000-0000-000000000005";
  const nonExistentUuid = "a0e0a0e0-9999-9999-9999-999999999999";

  // Setup user session
  const regRes = await register(email, password, fullName);
  assert.strictEqual(regRes.status, 200);
  token = regRes.data.token;

  await t.test('TC1.2.1 (Get Courses) - Fetch all courses', async () => {
    const res = await getCourses(token);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    const course = res.data.find(c => c.id === validCourseId);
    assert.ok(course);
    assert.strictEqual(course.title, "Introduction to Software Engineering");
  });

  await t.test('TC1.2.2 (Get Lessons) - Fetch lessons for a course', async () => {
    const res = await getLessons(validCourseId, token);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    // Verify sorted by order number (or at least order no is present)
    if (res.data.length > 1) {
      for (let i = 0; i < res.data.length - 1; i++) {
        assert.ok(res.data[i].orderNo <= res.data[i + 1].orderNo);
      }
    }
    const lesson = res.data.find(l => l.id === validLessonId);
    assert.ok(lesson);
    assert.strictEqual(lesson.title, "Git Version Control");
  });

  await t.test('TC1.2.3 (Get Concepts) - Fetch concepts for a lesson', async () => {
    const res = await getConcepts(validLessonId, token);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    const concept = res.data.find(c => c.id === validConceptId1);
    assert.ok(concept);
    assert.strictEqual(concept.title, "Repository Basics");
  });

  await t.test('TC1.2.4 (Complete Concept) - Mark concept as completed', async () => {
    const res = await completeConcept(validConceptId1, token);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.conceptId, validConceptId1);
    assert.strictEqual(res.data.completed, true);
  });

  await t.test('TC1.2.5 (Submit Quiz) - Submit a quiz score', async () => {
    const res = await submitQuiz(validQuizId, 85.0, token);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.score, 85.0);
    assert.ok(res.data.message.includes("success") || res.data.message.includes("submitted"));
  });

  await t.test('TC2.2.1 (Get Lessons Invalid Course) - Fetch non-existent course', async () => {
    const res = await getLessons(nonExistentUuid, token);
    // As per Spring standard, a non-existent course might return empty list or 404. Let's check contract.
    // If the controller just finds lessons by course UUID and returns empty list, it's 200 OK.
    // Let's assert either 404 or an empty array.
    assert.ok(res.status === 404 || (res.status === 200 && res.data.length === 0));
  });

  await t.test('TC2.2.2 (Complete Non-existent Concept) - Expect 404', async () => {
    const res = await completeConcept(nonExistentUuid, token);
    assert.strictEqual(res.status, 404);
  });

  await t.test('TC2.2.3 (Submit Quiz Invalid Score) - Expect 400', async () => {
    const resNegative = await submitQuiz(validQuizId, -5.0, token);
    const resOverLimit = await submitQuiz(validQuizId, 105.0, token);
    // Since some validation endpoints aren't strictly guarded or might return 200/400 depending on implementation details,
    // we check that if it fails it returns 400.
    // Wait, let's verify if the backend returns 400 for out of bounds score. If not, it might not be implemented,
    // but the test should assert what is expected in the interface contract.
    // Let's check if the controller validates it. If not, we can assert 400 and let it fail if the controller is missing validation.
    // Actually, "If the backend does not implement some endpoints yet, the tests should expect the behavior as per interface contracts (so they will fail or succeed depending on whether the endpoints are complete, which is correct)."
    // So yes, we should strictly assert 400!
    assert.strictEqual(resNegative.status, 400);
  });

  await t.test('TC2.2.4 (Quiz Out of Order Attempt) - Submit for non-existent quiz', async () => {
    const res = await submitQuiz(nonExistentUuid, 80.0, token);
    // If quiz doesn't exist, we expect 404.
    assert.strictEqual(res.status, 404);
  });

  await t.test('TC2.2.5 (Get Mastery Empty State) - Mastery for new user session', async () => {
    // We register a completely fresh user to test empty state
    const emptyEmail = `empty_student_${uniqueId}@nexus.edu`;
    const emptyReg = await register(emptyEmail, password, fullName);
    assert.strictEqual(emptyReg.status, 200);
    const emptyToken = emptyReg.data.token;

    const res = await getMastery(emptyToken);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.courses);
    assert.strictEqual(res.data.velocity, 0.0);
    const course = res.data.courses.find(c => c.courseId === validCourseId);
    if (course) {
      assert.strictEqual(course.masteryScore, 0.0);
    }
  });
});
