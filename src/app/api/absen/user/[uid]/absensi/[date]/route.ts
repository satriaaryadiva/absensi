/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/verifyUser";

export const runtime = "nodejs"; // ✅ wajib biar firebase-admin gak error di Edge runtime

const db = admin.firestore();

export async function POST(req: Request, context: any) {
  try {
    const requesterUid = await verifyUser(req);

    // ✅ Ambil param dari context
    const { uid, date } = context.params;

    if (requesterUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    await db
      .collection("users")
      .doc(uid)
      .collection("absensi")
      .doc(date)
      .set(body, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("🔥 Error in POST absensi:", err.message);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
