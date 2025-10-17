/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // pastikan kamu udah setup firebase config
import {  collection, getDocs } from "firebase/firestore";

export async function GET(
  req: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    // ambil subkoleksi absensi user
    const absensiRef = collection(db, "users", uid, "absensi");
    const snapshot = await getDocs(absensiRef);

    const absensi: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      absensi.push({
        tanggal: docSnap.id, // id dokumen biasanya pakai format tanggal
        datang: data.in || data.datang || null,
        pulang: data.out || data.pulang || null,
      });
    });

    return NextResponse.json({
      uid,
      absensi,
    });
  } catch (error: any) {
    console.error("Error get absensi:", error);
    return NextResponse.json(
      { error: "Gagal ambil data absensi" },
      { status: 500 }
    );
  }
}
