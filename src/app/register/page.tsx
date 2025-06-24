'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import qrc from 'qrcode'
 

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: '',
    nim: '',
    email: '',
    password: '',
    jabatan: '',
  })

  const handleRegister = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )
      const uid = userCred.user.uid

      // generate QR dari UID dalam bentuk DataURL (base64)
      const qrUrl = await qrc.toDataURL(uid)

      // simpan ke Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        nama: form.nama,
        nim: form.nim,
        email: form.email,
        jabatan: form.jabatan,
        qr: qrUrl,
      })

      alert('Pendaftaran berhasil!')
    } catch (err) {
      console.error(err)
      alert('Gagal daftar! Cek kembali datamu.')
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Daftar Akun</h1>

      <input
        placeholder="Nama"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, nama: e.target.value })}
      />
      <input
        placeholder="NIM"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, nim: e.target.value })}
      />
      <input
        placeholder="Email"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        className="border p-2 w-full mb-2"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <select
        className="border p-2 w-full mb-4"
        onChange={e => setForm({ ...form, jabatan: e.target.value })}
      >
        <option value="">Pilih Jabatan</option>
        <option value="murid">Murid</option>
        <option value="guru">Guru</option>
        <option value="staf">Staf</option>
      </select>

      <button
        onClick={handleRegister}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded"
      >
        Daftar
      </button>
    </div>
  )
}
