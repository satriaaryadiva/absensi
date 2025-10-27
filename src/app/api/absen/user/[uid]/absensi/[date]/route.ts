/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/verifyUser";

export const runtime = "nodejs"; // ⚡ wajib biar firebase-admin bisa jalan di Vercel

const db = admin.firestore();

export async function GET(request: Request, context: any) {
  try {
    const requesterUid = await verifyUser(request);
    const { uid, date } = context.params;

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
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const requesterUid = await verifyUser(request);
    const { uid, date } = context.params;

    if (requesterUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    await db.collection("users").doc(uid).collection("absensi").doc(date).set(body, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
