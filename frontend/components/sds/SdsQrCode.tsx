'use client';
import { QRCodeSVG } from 'qrcode.react';

export default function SdsQrCode({ sdsId, chemicalName }: { sdsId: string; chemicalName: string }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/en/sds/${sdsId}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><body style="text-align:center;padding:40px;font-family:sans-serif">
      <h2 style="font-size:14px;margin-bottom:8px">${chemicalName}</h2>
      <p style="font-size:11px;color:#666;margin-bottom:16px">Scan to view Safety Data Sheet</p>
      <div id="qr"></div>
      <p style="font-size:9px;color:#999;margin-top:12px">${url}</p>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG value={url} size={128} level="M" />
      <p className="text-xs text-gray-500 text-center">Scan to access SDS on mobile</p>
      <button onClick={handlePrint} className="text-xs text-gray-600 hover:text-gray-900 underline">Print QR label</button>
    </div>
  );
}
