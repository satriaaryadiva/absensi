/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

const db = admin.firestore();

export async function GET(
  req: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    let query = db
      .collection("users")
      .doc(uid)
      .collection("absensi")
      .orderBy(admin.firestore.FieldPath.documentId());

    if (from && to) query = query.startAt(from).endAt(to);
    const snap = await query.get();

    const data: Record<string, any> = {};
    snap.forEach((doc) => (data[doc.id] = doc.data()));

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
