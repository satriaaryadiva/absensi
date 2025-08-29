/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import qrc from 'qrcode'
import toast from 'react-hot-toast'

type FormData = {
  nama: string
  nim: string
  email: string
  password: string
  jabatan: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    nama: '',
    nim: '',
    email: '',
    password: '',
    jabatan: '',
  })
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (
      !form.nama ||
      !form.nim ||
      !form.email ||
      !form.password ||
      !form.jabatan
    ) {
      toast.error('Semua field wajib diisi!')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Mendaftarkan akun...')

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )
      const uid = userCred.user.uid

      const qrUrl = await qrc.toDataURL(uid)

      await setDoc(doc(db, 'users', uid), {
        uid,
        nama: form.nama,
        nim: form.nim,
        email: form.email,
        jabatan: form.jabatan,
        qr: qrUrl,
      })

      toast.success('✅ Pendaftaran berhasil!', { id: loadingToast })
      router.push('/login')
      setForm({
        nama: '',
        nim: '',
        email: '',
        password: '',
        jabatan: '',
      })
    } catch (err: any) {
      console.error(err)
      toast.error(`❌ Gagal daftar: ${err.message}`, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Daftar Akun</h1>

      <input
        placeholder="Nama"
        className="border p-2 w-full mb-2"
        value={form.nama}
        onChange={e => setForm({ ...form, nama: e.target.value })}
      />
      <input
        placeholder="NIM"
        className="border p-2 w-full mb-2"
        value={form.nim}
        onChange={e => setForm({ ...form, nim: e.target.value })}
      />
      <input
        placeholder="Email"
        type="email"
        className="border p-2 w-full mb-2"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        className="border p-2 w-full mb-2"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <select
        className="border p-2 w-full mb-4"
        value={form.jabatan}
        onChange={e => setForm({ ...form, jabatan: e.target.value })}
      >
        <option value="">Pilih Jabatan</option>
        <option value="murid">Murid</option>
        <option value="guru">Guru</option>
        <option value="staf">Staf</option>
      </select>

      <button
        onClick={handleRegister}
        disabled={loading}
        className={`${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        } text-white p-2 w-full rounded`}
      >
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>
    </div>
  )
}
