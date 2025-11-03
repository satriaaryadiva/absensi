/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/verifyUser";

const db = admin.firestore();

export async function 
GET(req: Request, context: any) {
  try {
    const { uid, date } = context.params;
    const requesterUid = await verifyUser(req);

    if (requesterUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const docRef = db.collection("users").doc(uid).collection("absensi").doc(date);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: "Data not found" }, { status: 404 });
    }

    return NextResponse.json(doc.data());
  } catch (err: any) {
    console.error("🔥 Error GET absensi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, context: any) {
  try {
    const { uid, date } = context.params;
    const requesterUid = await verifyUser(req);

    if (requesterUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    await db.collection("users").doc(uid).collection("absensi").doc(date).set(body, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("🔥 Error POST absensi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
