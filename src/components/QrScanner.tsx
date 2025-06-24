'use client'
import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QrScanner({ onScan }: { onScan: (uid: string) => Promise<void> }) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('reader')
    scannerRef.current = scanner

    const startScanner = () => {
      scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: 350,
        },
        async (decodedText) => {
          if (scanningRef.current) return
          scanningRef.current = true

          try {
            await onScan(decodedText)
          } catch (err) {
            console.error('Scan error', err)
          }

          // Delay biar user selesai baca feedback sebelum lanjut
          setTimeout(() => {
            scanningRef.current = false
          }, 4000)
        },
        (err) => console.log('Scan error', err)
      )
    }

    startScanner()

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return <div id="reader" className="w-full" />
}
