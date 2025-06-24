'use client';
import { QRCodeSVG } from 'qrcode.react';

export default function QRGenerator({ uid }: { uid: string }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">QR Code Anda:</h3>
      <QRCodeSVG value={uid} size={200} />
    </div>
  );
}
