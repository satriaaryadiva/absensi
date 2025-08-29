/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const loading = toast.loading('Masuk...')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Berhasil masuk!', { id: loading })
      router.push('/admin/dashboard') // redirect ke dashboard
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Gagal login', { id: loading })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded text-black shadow max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">🔐 Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-3 py-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
        >
          Masuk
        </button>
        <p className="text-sm text-center mt-4">
  Lupa password?{' '}
  <Link  href="recovery" className="text-blue-600 hover:underline">
    Reset di sini
  </Link>
</p>

      </div>
      
    </div>
  )
}
