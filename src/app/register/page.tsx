/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nama: '',
    nim: '',
    email: '',
    password: '',
    jabatan: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async () => {
    if (!form.nama || !form.nim || !form.email || !form.password || !form.jabatan) {
      toast.error('Semua field wajib diisi!')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Mendaftarkan akun...')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar')

      toast.success('✅ Pendaftaran berhasil!', { id: toastId })
      router.push('/login')
    } catch (err: any) {
      console.error(err)
      toast.error(`❌ ${err.message}`, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Daftar Akun 🚀
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Buat akun baru untuk mengakses sistem absensi
        </p>

        <div className="space-y-4">
          <InputField
            label="Nama Lengkap"
            name="nama"
            value={form.nama}
            onChange={handleChange}
          />
          <InputField
            label="NIM"
            name="nim"
            value={form.nim}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <select
              name="jabatan"
              value={form.jabatan}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Pilih Jabatan</option>
              <option value="murid">Murid</option>
              <option value="guru">Guru</option>
              <option value="staf">Staf</option>
            </select>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-sm ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <span
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => router.push('/login')}
          >
            Login di sini
          </span>
        </p>
      </div>
    </div>
  )
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  )
}
