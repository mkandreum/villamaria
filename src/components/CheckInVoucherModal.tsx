import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Wifi,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Phone,
} from 'lucide-react';
import QRCode from 'qrcode';

export interface VoucherReservationData {
  id: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  guestsCount?: number;
  totalPrice?: number;
  status?: string;
  propertyAddress?: string;
  mapsUrl?: string;
  wifiSsid?: string;
  wifiPass?: string;
  hostPhone?: string;
}

interface CheckInVoucherModalProps {
  reservation: VoucherReservationData;
  onClose: () => void;
}

export const CheckInVoucherModal: React.FC<CheckInVoucherModalProps> = ({ reservation, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

  const wifiSsid = reservation.wifiSsid || 'VillaMaria_Privada_5G';
  const wifiPass = reservation.wifiPass || 'MorrocoySol2026!';
  const address = reservation.propertyAddress || 'Calle 15, Urbanización Privada, Chichiriviche, Edo. Falcón';
  const mapsUrl = reservation.mapsUrl || 'https://maps.google.com/?q=10.9317,-68.2736';
  const hostPhone = reservation.hostPhone || '+58 414 1234567';

  // Generate QR Code on mount
  useEffect(() => {
    const qrPayload = JSON.stringify({
      id: reservation.id,
      guest: reservation.guestName,
      in: reservation.checkIn,
      out: reservation.checkOut,
      status: reservation.status || 'CONFIRMED',
      type: 'VILLA_MARIA_CHECKIN_PASS',
    });

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#1B3B36',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [reservation]);

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(wifiPass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reservation.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download Voucher as Image using HTML Canvas
  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      // Create an offline high-res canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 1100;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1100);
      bgGrad.addColorStop(0, '#1B3B36');
      bgGrad.addColorStop(1, '#0C201D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 1100);

      // Inner card
      ctx.fillStyle = '#F8F5F0';
      ctx.roundRect ? ctx.roundRect(30, 30, 740, 1040, 28) : ctx.fillRect(30, 30, 740, 1040);
      ctx.fill();

      // Top banner
      ctx.fillStyle = '#1B3B36';
      ctx.roundRect ? ctx.roundRect(30, 30, 740, 140, [28, 28, 0, 0]) : ctx.fillRect(30, 30, 740, 140);
      ctx.fill();

      // Title in banner
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('VILLA MARÍA 🌴', 400, 90);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('PASE DIGITAL DE ACCESO & CHECK-IN • CHICHIRIVICHE', 400, 130);

      // Guest Name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1B3B36';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(reservation.guestName, 60, 220);

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('● RESERVA CONFIRMADA & ACCESO GARANTIZADO', 60, 250);

      // Code Box
      ctx.fillStyle = '#EAE3D8';
      ctx.fillRect(60, 275, 680, 50);
      ctx.fillStyle = '#1B3B36';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`CÓDIGO: ${reservation.id}`, 80, 307);

      // Dates Info
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#4B5563';
      ctx.fillText('LLEGADA (CHECK-IN):', 60, 365);
      ctx.fillText('SALIDA (CHECK-OUT):', 420, 365);

      ctx.fillStyle = '#1B3B36';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(new Date(reservation.checkIn).toLocaleDateString('es-ES', { dateStyle: 'full' }), 60, 400);
      ctx.fillText(new Date(reservation.checkOut).toLocaleDateString('es-ES', { dateStyle: 'full' }), 420, 400);

      // Wi-Fi Box
      ctx.fillStyle = '#E6F4EA';
      ctx.fillRect(60, 435, 680, 80);
      ctx.fillStyle = '#1B3B36';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`📶 RED WI-FI: ${wifiSsid}`, 80, 470);
      ctx.fillText(`🔑 CONTRASEÑA: ${wifiPass}`, 80, 498);

      // QR Code image
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((res) => {
          qrImg.onload = res;
        });
        ctx.drawImage(qrImg, 270, 540, 260, 260);
      }

      // Security Garita text
      ctx.fillStyle = '#1B3B36';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Presenta este código en la garita de seguridad de la Calle 15', 400, 840);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Urb. Privada con vigilancia 24/7 y acceso controlado', 400, 865);

      // Address & Phone footer
      ctx.fillStyle = '#EAE3D8';
      ctx.fillRect(60, 890, 680, 120);
      ctx.fillStyle = '#1B3B36';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`📍 ${address}`, 400, 935);
      ctx.fillText(`📞 Anfitrión / WhatsApp: ${hostPhone}`, 400, 975);

      // Trigger download
      const link = document.createElement('a');
      link.download = `Voucher-CheckIn-VillaMaria-${reservation.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading voucher image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalGuests = reservation.guestsCount || ((reservation.adults || 0) + (reservation.children || 0)) || 1;

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-emerald-950 sm:border sm:border-emerald-500/30 sm:rounded-3xl max-w-xl w-full p-3 sm:p-6 shadow-2xl relative my-2 text-emerald-100 font-sans max-h-[96vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:p-0 print:bg-white">
        
        {/* Close Button - Hidden in Print */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors z-10 print:hidden min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-3 sm:mb-4 pr-8 sm:pr-0 print:hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pase Digital Oficial</span>
          </span>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
            Voucher de Check-in & Acceso
          </h3>
        </div>

        {/* Scrollable Printable Voucher Card */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 print:overflow-visible" ref={voucherRef}>
          <div className="bg-[#F8F5F0] text-[#1B3B36] rounded-2xl sm:rounded-3xl border border-[#1B3B36]/15 shadow-xl overflow-hidden print:border-2 print:border-black">
            
            {/* Voucher Header Banner */}
            <div className="bg-[#1B3B36] text-white p-4 sm:p-5 text-center border-b-2 border-emerald-500">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                VILLA MARÍA 🌴
              </h2>
              <p className="text-[10px] sm:text-xs text-emerald-300 uppercase tracking-widest font-bold mt-0.5">
                Pase de Entrada & Check-In Garita
              </p>
            </div>

            {/* Guest & Status Header */}
            <div className="p-4 sm:p-5 space-y-3.5 border-b border-[#1B3B36]/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#1B3B36]/60 block">
                    Huésped Principal
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold font-serif text-[#1B3B36] leading-tight">
                    {reservation.guestName}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reserva Autorizada</span>
                </div>
              </div>

              {/* Booking Reference Code */}
              <div className="flex items-center justify-between bg-[#EAE3D8] rounded-xl p-2.5 sm:p-3 border border-[#1B3B36]/10">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#1B3B36]/70 block">
                    Código de Entrada
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base text-[#1B3B36]">
                    {reservation.id}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-[#1B3B36]/15 transition-all print:hidden"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Dates & Guests Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#1B3B36]/10">
                  <span className="text-[10px] text-[#1B3B36]/60 font-semibold block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-700" /> Check-in
                  </span>
                  <span className="font-bold text-sm text-[#1B3B36] block mt-0.5">
                    {new Date(reservation.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">Desde las 3:00 PM</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#1B3B36]/10">
                  <span className="text-[10px] text-[#1B3B36]/60 font-semibold block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-700" /> Check-out
                  </span>
                  <span className="font-bold text-sm text-[#1B3B36] block mt-0.5">
                    {new Date(reservation.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">Hasta las 12:00 PM</span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white p-2.5 rounded-xl border border-[#1B3B36]/10 flex flex-col justify-between">
                  <span className="text-[10px] text-[#1B3B36]/60 font-semibold block flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-700" /> Ocupantes
                  </span>
                  <span className="font-bold text-sm text-[#1B3B36]">
                    {totalGuests} persona{totalGuests > 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">Casa completa</span>
                </div>
              </div>
            </div>

            {/* QR Code & Garita Instructions */}
            <div className="p-4 sm:p-5 bg-white text-center space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {qrDataUrl && (
                  <div className="p-2 bg-white border-2 border-emerald-900/20 rounded-2xl shadow-inner shrink-0">
                    <img src={qrDataUrl} alt="QR Check-in" className="w-36 h-36 sm:w-40 sm:h-40 mx-auto" />
                  </div>
                )}

                <div className="text-left space-y-2 max-w-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Control de Garita</span>
                  </div>
                  <p className="text-xs text-[#1B3B36]/80 leading-relaxed">
                    Muestra este código QR o menciona el código al vigilante de turno en la garita principal de la <strong>Calle 15</strong>.
                  </p>
                  <p className="text-[11px] text-[#1B3B36]/60">
                    El personal tiene tu nombre y matrícula autorizados en la lista de huéspedes.
                  </p>
                </div>
              </div>
            </div>

            {/* Wi-Fi & House Quick Access */}
            <div className="p-4 sm:p-5 bg-[#EAE3D8]/60 border-t border-[#1B3B36]/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1B3B36] flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-emerald-800" />
                  <span>Wi-Fi de Alta Velocidad (Fibra)</span>
                </span>
                <button
                  onClick={handleCopyWifi}
                  className="text-[11px] font-bold text-emerald-900 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded-lg border border-[#1B3B36]/15 flex items-center gap-1 print:hidden"
                >
                  {copiedWifi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedWifi ? 'Clave copiada' : 'Copiar Clave'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-[#1B3B36]/10">
                  <span className="text-[10px] text-[#1B3B36]/60 block">Red:</span>
                  <span className="font-mono font-bold text-[#1B3B36]">{wifiSsid}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#1B3B36]/10">
                  <span className="text-[10px] text-[#1B3B36]/60 block">Contraseña:</span>
                  <span className="font-mono font-bold text-[#1B3B36]">{wifiPass}</span>
                </div>
              </div>
            </div>

            {/* Footer Address & Emergency Contact */}
            <div className="p-3.5 sm:p-4 bg-[#1B3B36] text-white text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div className="space-y-0.5">
                <p className="font-semibold flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{address}</span>
                </p>
                <p className="text-[11px] text-emerald-300">
                  Atención / Anfitrión: {hostPhone}
                </p>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-[11px] uppercase tracking-wide transition-all print:hidden"
              >
                <span>GPS Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons (Download PNG, Print PDF, Close) - Hidden in Print */}
        <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando Pase...' : 'Guardar Imagen'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition-colors min-h-[44px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
