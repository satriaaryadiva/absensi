'use client'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'sonner'

export default function QrScanner({ onScan }: { onScan: (uid: string) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    // QR Scanner requires HTTPS or localhost
    if (typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1') {
      setError('QR Scanner requires a secure connection (HTTPS)')
      toast.error('Kamera memerlukan koneksi HTTPS yang aman')
      return
    }

    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            if (scanningRef.current) return
            scanningRef.current = true

            try {
              await onScan(decodedText)
            } catch (err) {
              console.error('Scan processing error', err)
            } finally {
              // Delay biar user selesai baca feedback sebelum lanjut
              setTimeout(() => {
                scanningRef.current = false
              }, 3000)
            }
          },
          (err) => {
            // Ignore common scanning noise/errors
          }
        )
      } catch (err: any) {
        console.error('Failed to start scanner:', err)
        setError(err.message || 'Gagal memulai kamera')
        toast.error('Gagal mengakses kamera. Pastikan izin kamera diberikan.')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.error('Error stopping scanner', e))
      }
    }
  }, [onScan])

  return (
    <div className="relative w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden rounded-xl">
      <div id="reader" className="w-full h-full" />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white z-10">
          <p className="text-red-400 font-medium mb-2">Error Kamera</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}
    </div>
  )
}
