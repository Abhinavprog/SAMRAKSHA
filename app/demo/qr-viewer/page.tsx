import { Suspense } from 'react';
import QRCodeViewerClient from './QRCodeViewerClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading QR Viewer...</p>
          </div>
        </div>
      }
    >
      <QRCodeViewerClient />
    </Suspense>
  );
}
