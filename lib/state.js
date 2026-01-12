import { getDb } from "./mongo.js";

const COLL = "user_states";

/**
 * Upsert user state with TTL (expires in minutes)
 */
export async function setUserState(userId, state, ttlMinutes = 10) {
  const db = await getDb();
  const expireAt = new Date(Date.now() + ttlMinutes * 60_000);
  await db.collection(COLL).updateOne(
    { userId },
    { $set: { userId, ...state, expireAt } },
    { upsert: true }
  );
}

export async function getUserState(userId) {
  const db = await getDb();
  const state = await db.collection(COLL).findOne({ userId });
  if (!state) return null;
  if (state.expireAt && state.expireAt < new Date()) {
    await db.collection(COLL).deleteOne({ userId });
    return null;
  }
  return state;
}

export async function clearUserState(userId) {
  const db = await getDb();
  await db.collection(COLL).deleteOne({ userId });
}

/**
 * Ensure TTL index exists (safe to call many times).
 */
export async function ensureStateTTL() {
  const db = await getDb();
  await db.collection(COLL).createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
}
