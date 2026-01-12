import { getDb } from "./mongo.js";

export async function createOrder(order) {
  const db = await getDb();
  const now = new Date();
  const doc = {
    ...order,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  await db.collection("orders").insertOne(doc);
  return doc;
}

export async function getOrderById(orderId) {
  const db = await getDb();
  return db.collection("orders").findOne({ orderId });
}

export async function updateOrder(orderId, patch) {
  const db = await getDb();
  await db.collection("orders").updateOne(
    { orderId },
    { $set: { ...patch, updatedAt: new Date() } }
  );
}

export async function listExpiredPendingOrders(now = new Date()) {
  const db = await getDb();
  return db
    .collection("orders")
    .find({
      status: "pending",
      expiredAt: { $ne: null, $lt: now },
    })
    .limit(100)
    .toArray();
}
