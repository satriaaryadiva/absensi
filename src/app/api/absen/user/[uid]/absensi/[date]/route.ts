/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/verifyUser";

const db = admin.firestore();

export async function GET(
  req: Request,
  { params }: { params: { uid: string; date: string } }
) {
  try {
    const requesterUid = await verifyUser(req); // 🔒 cek token user
    const { uid, date } = params;

    // optional: pastikan user hanya bisa akses datanya sendiri
    if (requesterUid !== uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const docRef = db.collection("users").doc(uid).collection("absensi").doc(date);
    const doc = await docRef.get();

    if (!doc.exists)
      return NextResponse.json({ message: "Data not found" }, { status: 404 });

    return NextResponse.json(doc.data());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { uid: string; date: string } }
) {
  try {
    const requesterUid = await verifyUser(req);
    const { uid, date } = params;

    if (requesterUid !== uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    await db.collection("users").doc(uid).collection("absensi").doc(date).set(body, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
