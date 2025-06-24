'use client'
import { useState } from 'react'
import ModalCetakQR from '@/components/modalQr'

export default function AdminPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Cetak QR Code
      </button>

      {showModal && <ModalCetakQR onClose={() => setShowModal(false)} />}
    </div>
  )
}
