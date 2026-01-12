import { getDb, getMongoClient } from "./mongo.js";
import { GridFSBucket, ObjectId } from "mongodb";

function bucket(db) {
  return new GridFSBucket(db, { bucketName: "scripts" });
}

export async function listScripts() {
  const db = await getDb();
  return db.collection("scripts_meta").find({ active: true }).sort({ createdAt: -1 }).toArray();
}

export async function getScriptMetaById(id) {
  const db = await getDb();
  return db.collection("scripts_meta").findOne({ _id: new ObjectId(id) });
}

export async function uploadScriptZip({ filename, displayName, price, buffer }) {
  const db = await getDb();
  const b = bucket(db);

  const uploadStream = b.openUploadStream(filename, {
    metadata: { displayName, price },
    contentType: "application/zip",
  });

  await new Promise((resolve, reject) => {
    uploadStream.end(buffer, (err) => (err ? reject(err) : resolve()));
  });

  const fileId = uploadStream.id;

  const meta = {
    filename,
    displayName: displayName || filename,
    price: Number(price) || null,
    active: true,
    fileId,
    createdAt: new Date(),
  };
  const result = await db.collection("scripts_meta").insertOne(meta);
  return { ...meta, _id: result.insertedId };
}

export async function downloadScriptZip(fileId) {
  const db = await getDb();
  const b = bucket(db);
  const _id = typeof fileId === "string" ? new ObjectId(fileId) : fileId;

  const dl = b.openDownloadStream(_id);
  const chunks = [];
  await new Promise((resolve, reject) => {
    dl.on("data", (c) => chunks.push(c));
    dl.on("error", reject);
    dl.on("end", resolve);
  });
  return Buffer.concat(chunks);
}

export async function deleteScript(id) {
  const db = await getDb();
  const meta = await db.collection("scripts_meta").findOne({ _id: new ObjectId(id) });
  if (!meta) return false;

  // mark inactive
  await db.collection("scripts_meta").updateOne({ _id: new ObjectId(id) }, { $set: { active: false } });
  return true;
}
