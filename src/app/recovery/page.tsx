/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleReset = async () => {
    if (!email) return toast.error('Masukkan email kamu!')
    const loading = toast.loading('Mengirim email reset...')

    try {
      await sendPasswordResetEmail(auth, email)
      setSubmitted(true)
      toast.success('Email reset dikirim! Cek inbox/spam ya!', { id: loading })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Gagal kirim email reset.', { id: loading })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h1 className="text-2xl font-bold  text-blue-500 mb-4 text-center">🔑 Lupa Password</h1>
        {submitted ? (
          <p className="text-green-600 text-center">Email reset telah dikirim ke: <br /><b>{email}</b></p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Masukkan email..."
              className="border px-3 py-2 w-full mb-4 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
            >
              Kirim Email Reset
            </button>
          </>
        )}
      </div>
    </div>
  )
}
