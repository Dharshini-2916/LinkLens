import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function QRCodeCard({ shortUrl }) {
  const qrRef = useRef(null);

  const downloadQR = () => {
    const canvas = qrRef.current;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'linklens-qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <QRCodeCanvas
            ref={qrRef}
            value={shortUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>
        {(shortUrl.includes('localhost') || shortUrl.includes('127.0.0.1')) && (
          <p className="text-[11px] text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md p-2 text-center max-w-[240px]">
            ⚠️ <strong>Scanning info:</strong> Set local IP in your hosts file or connect to the same Wi-Fi using your local machine IP.
          </p>
        )}
        <Button variant="outline" className="w-full gap-2" onClick={downloadQR}>
          <Download className="w-4 h-4" /> Download PNG
        </Button>
      </CardContent>
    </Card>
  );
}