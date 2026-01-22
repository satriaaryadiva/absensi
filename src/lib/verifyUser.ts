/* eslint-disable @typescript-eslint/no-unused-vars */
import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function verifyUser(req: Request) {
  // 1. Try Session Cookie first
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value, true);
      return decodedClaims.uid;
    } catch (error) {
      // Session verification failed (expired/invalid), fall through to header check
      // or we could throw here if we want strict behavior. 
      // For now, let's try header backup or throw invalid.
      console.log("Session cookie verification failed:", error);
    }
  }

  // 2. Fallback to Authorization Header (Bearer Token)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return decoded.uid;
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  }

  throw new Error("Unauthorized: No valid session or token found");
}
