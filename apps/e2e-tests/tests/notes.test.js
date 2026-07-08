import test from 'node:test';
import assert from 'node:assert';
import {
  register,
  createNote,
  getNotes,
  getNoteByConcept
} from '../utils/api-client.js';

test('Notes Management Tests', async (t) => {
  const uniqueId = Date.now();
  const emailA = `notes_student_a_${uniqueId}@nexus.edu`;
  const emailB = `notes_student_b_${uniqueId}@nexus.edu`;
  const password = 'password123';
  
  let tokenA = null;
  let tokenB = null;

  const validConceptId = "a0e0a0e0-0000-0000-0000-000000000003";
  const nonExistentConceptId = "a0e0a0e0-9999-9999-9999-999999999999";
  
  // Setup user sessions
  const regResA = await register(emailA, password, `Student A ${uniqueId}`);
  assert.strictEqual(regResA.status, 200);
  tokenA = regResA.data.token;

  const regResB = await register(emailB, password, `Student B ${uniqueId}`);
  assert.strictEqual(regResB.status, 200);
  tokenB = regResB.data.token;

  await t.test('TC1.3.1 (Create Note) - Save new Markdown note for User A', async () => {
    const res = await createNote(validConceptId, '# My Git Note', tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.conceptId, validConceptId);
    assert.strictEqual(res.data.markdown, '# My Git Note');
  });

  await t.test('TC1.3.2 (Get Notes List) - Fetch all notes for User A', async () => {
    const res = await getNotes(tokenA);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    const note = res.data.find(n => n.conceptId === validConceptId);
    assert.ok(note);
    assert.strictEqual(note.markdown, '# My Git Note');
  });

  await t.test('TC1.3.3 (Get Note by Concept) - Fetch note by concept ID', async () => {
    const res = await getNoteByConcept(validConceptId, tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.markdown, '# My Git Note');
  });

  await t.test('TC1.3.4 (Update Note) - Modify existing note', async () => {
    const res = await createNote(validConceptId, '# Updated Git Note', tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.markdown, '# Updated Git Note');

    const check = await getNoteByConcept(validConceptId, tokenA);
    assert.strictEqual(check.status, 200);
    assert.strictEqual(check.data.markdown, '# Updated Git Note');
  });

  await t.test('TC1.3.5 (Note Markdown Rendering) - Save complex Markdown', async () => {
    const complexMd = '# Header\n- List item\n`codeblock`\n**bold**';
    const res = await createNote(validConceptId, complexMd, tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.markdown, complexMd);
  });

  await t.test('TC2.3.1 (Get Note Non-existent Concept) - Should return empty markdown gracefully', async () => {
    const res = await getNoteByConcept(nonExistentConceptId, tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.markdown, '');
  });

  await t.test('TC2.3.2 (Create Note Empty Body) - Save note with empty markdown', async () => {
    const res = await createNote(validConceptId, '', tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.markdown, '');
  });

  await t.test('TC2.3.3 (Create Note Duplicate Concept) - Idempotency test (update existing)', async () => {
    const res1 = await createNote(validConceptId, 'Initial Content', tokenA);
    assert.strictEqual(res1.status, 200);
    
    const res2 = await createNote(validConceptId, 'Overwritten Content', tokenA);
    assert.strictEqual(res2.status, 200);

    const notes = await getNotes(tokenA);
    const matchedNotes = notes.data.filter(n => n.conceptId === validConceptId);
    // There should only be one note for this concept because of idempotency
    assert.strictEqual(matchedNotes.length, 1);
    assert.strictEqual(matchedNotes[0].markdown, 'Overwritten Content');
  });

  await t.test('TC2.3.4 (Access Note of Another User) - User B should not see User A\'s note', async () => {
    // User A has saved a note. User B gets note by concept ID. It should return empty note or deny.
    const res = await getNoteByConcept(validConceptId, tokenB);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.markdown, '');
  });

  await t.test('TC2.3.5 (Create Note Invalid Concept ID) - Expect 404', async () => {
    const res = await createNote(nonExistentConceptId, 'Should Fail', tokenA);
    assert.strictEqual(res.status, 404);
  });
});
