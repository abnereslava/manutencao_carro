import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';

let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'appcarro-d3c92',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});
beforeEach(async () => env.clearFirestore());
afterAll(async () => env.cleanup());

describe('Firestore allowlist', () => {
  it('nega usuário anônimo', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'vehicles/sandero')));
  });
  it('nega conta fora da allowlist', async () => {
    const db = env
      .authenticatedContext('outsider', {
        email: 'fora@example.com',
        email_verified: true,
        firebase: { sign_in_provider: 'google.com' }
      })
      .firestore();
    await assertFails(getDoc(doc(db, 'vehicles/sandero')));
  });
  it('permite as duas contas Google verificadas', async () => {
    const db = env
      .authenticatedContext('allowed', {
        email: 'abner.eslava@gmail.com',
        email_verified: true,
        firebase: { sign_in_provider: 'google.com' }
      })
      .firestore();
    await assertSucceeds(setDoc(doc(db, 'vehicles/sandero'), { model: 'Sandero' }));
  });
  it('mantém coleções fora do escopo em default deny', async () => {
    const db = env
      .authenticatedContext('allowed', {
        email: 'abner.eslava@gmail.com',
        email_verified: true,
        firebase: { sign_in_provider: 'google.com' }
      })
      .firestore();
    await assertFails(setDoc(doc(db, 'public/test'), { leaked: true }));
  });
});
