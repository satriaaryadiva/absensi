'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type User = {
  uid: string
  nama: string
}

export default function ModalCetakQR({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.trim() === '') return

      const res = await fetch(`/api/users/search?q=${searchTerm}`)
      const data = await res.json()
      setResults(data)
    }

    const delayDebounce = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const downloadQR = () => {
    const svg = document.getElementById('qr-code') as unknown as SVGSVGElement
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = `${selectedUser?.nama || 'qrcode'}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgStr)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded text-black shadow-md w-full max-w-md relative animate-fadeIn">
        <button
          className="absolute top-2 right-3 text-black hover:text-red-500"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-lg font-bold mb-3">Cetak QR Code</h2>

        <input
          type="text"
          placeholder="Cari nama..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setSelectedUser(null)
          }}
          className="w-full border px-3 py-2 rounded mb-2"
        />

        {results.length > 0 && (
          <ul className="border rounded max-h-40 overflow-y-auto">
            {results.map((user) => (
              <li
                key={user.uid}
                onClick={() => {
                  setSelectedUser(user)
                  setSearchTerm('')
                  setResults([])
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {user.nama}
              </li>
            ))}
          </ul>
        )}

        {selectedUser && (
          <div className="mt-4 text-center">
            <p className="font-medium mb-2">{selectedUser.nama}</p>
            <QRCodeSVG id="qr-code" value={selectedUser.uid} size={200} />
            <button
              onClick={downloadQR}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Download QR
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
