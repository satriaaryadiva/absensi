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

  return (
    <div className="fixed inset-0 bg-black    bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded  text-black shadow-md w-full max-w-md relative">
        <button
          className="absolute top-2  right-3 text-black hover:text-red-500"
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
            <QRCodeSVG value={selectedUser.uid} size={200} />
          </div>
        )}
      </div>
    </div>
  )
}
