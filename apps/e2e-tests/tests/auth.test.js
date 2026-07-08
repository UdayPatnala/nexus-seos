import test from 'node:test';
import assert from 'node:assert';
import { register, login, getMe, getNotes } from '../utils/api-client.js';

test('Authentication & Session Tests', async (t) => {
  const uniqueId = Date.now();
  const emailA = `student_a_${uniqueId}@nexus.edu`;
  const emailB = `student_b_${uniqueId}@nexus.edu`;
  const password = 'password123';
  const fullNameA = `Jane Doe A ${uniqueId}`;
  const fullNameB = `Jane Doe B ${uniqueId}`;
  
  let tokenA = null;
  let tokenB = null;

  await t.test('TC1.1.1 (Register Happy Path) - Register User A', async () => {
    const res = await register(emailA, password, fullNameA);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.email, emailA);
    assert.strictEqual(res.data.fullName, fullNameA);
    tokenA = res.data.token;
  });

  await t.test('TC1.1.2 (Login Happy Path) - Login User A', async () => {
    const res = await login(emailA, password);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.email, emailA);
    assert.strictEqual(res.data.fullName, fullNameA);
  });

  await t.test('TC1.1.3 (Fetch Current User) - Fetch User A details', async () => {
    const res = await getMe(tokenA);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.email, emailA);
    assert.strictEqual(res.data.fullName, fullNameA);
  });

  await t.test('TC1.1.4 (Different User Sessions) - Register User B and compare profiles', async () => {
    const resRegB = await register(emailB, password, fullNameB);
    assert.strictEqual(resRegB.status, 200);
    tokenB = resRegB.data.token;

    const resMeA = await getMe(tokenA);
    const resMeB = await getMe(tokenB);

    assert.notStrictEqual(resMeA.data.id, resMeB.data.id);
    assert.strictEqual(resMeA.data.email, emailA);
    assert.strictEqual(resMeB.data.email, emailB);
  });

  await t.test('TC1.1.5 (Auth Header & Cookie Support) - Use cookie authorization', async () => {
    const res = await getMe(tokenA, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.email, emailA);
  });

  await t.test('TC2.1.1 (Register Email Duplicate) - Expect 400 or 409', async () => {
    const res = await register(emailA, password, fullNameA);
    assert.ok(res.status === 400 || res.status === 409, `Expected 400 or 409, got ${res.status}`);
  });

  await t.test('TC2.1.2 (Login Invalid Password) - Expect 401', async () => {
    const res = await login(emailA, 'wrong_password');
    assert.strictEqual(res.status, 401);
  });

  await t.test('TC2.1.3 (Auth Token Expired/Malformed) - Expect 401 or 403', async () => {
    const res = await getMe('malformed_or_expired_token');
    assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
  });

  await t.test('TC2.1.4 (Register Invalid Inputs) - Empty fields', async () => {
    const res = await register('', '', '');
    assert.strictEqual(res.status, 400);
  });

  await t.test('TC2.1.5 (Access Secure Route Without Token) - Expect 401 or 403', async () => {
    const res = await getNotes(null);
    assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
  });
});
