/* eslint-disable @typescript-eslint/no-unused-vars */
import admin from "@/lib/firebaseAdmin";

export async function verifyUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Missing Authorization header");

  const token = authHeader.split("Bearer ")[1];
  if (!token) throw new Error("Missing token");

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

