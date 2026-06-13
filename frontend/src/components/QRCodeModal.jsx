import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QRCodeModal({ isOpen, onClose, shortUrl, shortCode }) {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${shortCode || 'link'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="glass relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <CardHeader>
                <CardTitle className="text-center">QR Code</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center gap-4">
                <div className="p-6 bg-white rounded-xl shadow-lg">
                  <QRCodeCanvas
                    id="qr-code-canvas"
                    value={shortUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground break-all">
                    {shortUrl}
                  </p>
                  {(shortUrl.includes('localhost') || shortUrl.includes('127.0.0.1')) && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md p-2 max-w-sm">
                      ⚠️ <strong>Localhost Scan Note:</strong> Since you're running locally, scanning this QR code requires your mobile device to be connected to the same Wi-Fi network using your computer's local IP address (e.g., <code>http://192.168.x.x:5000</code>).
                    </p>
                  )}
                </div>
                <Button onClick={downloadQR} className="w-full gap-2">
                  <Download className="w-4 h-4" /> Download PNG
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}