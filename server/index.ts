import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { fileURLToPath } from 'node:url';

import { prisma } from './db.js';
import { encryptText, decryptText } from './utils/crypto.js';
import { getActiveTransporter, sendEmail, testSmtpConnection, sendTestEmailDirect } from './utils/mailer.js';
import { createCalendarEvent, deleteCalendarEvent, fetchExternalBlockedEvents } from './utils/googleCalendar.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'villamaria-jwt-secret-key-2026-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Ensure uploads directory exists
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ----------------------------------------------------
// Middleware Authentication & Authorization
// ----------------------------------------------------
export interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'CLIENT';
  };
}

function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso no proporcionado.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.user = decoded;
    next();
  });
}

function requireAdmin(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
}

// ----------------------------------------------------
// Database Initializer & Seeder
// ----------------------------------------------------
async function initializeDatabase() {
  try {
    // 1. Ensure Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@villamaria.com';
    const rawAdminPass = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminHash = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(rawAdminPass, 10);

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: adminHash,
          name: 'Administrador Villa María',
          role: 'ADMIN',
        },
      });
      console.log(`[Init] Admin user created (${adminEmail})`);
    }

    // 2. Ensure Property Settings Defaults
    const defaultSettings: Record<string, { value: string; category: string }> = {
      price_per_night: { value: '150', category: 'pricing' },
      cleaning_fee: { value: '50', category: 'pricing' },
      minimum_stay_nights: { value: '2', category: 'pricing' },
      max_guests: { value: '8', category: 'property' },
      property_title: { value: 'Villa María - Casa de Campo & Relax', category: 'general' },
      property_subtitle: { value: 'Tu refugio exclusivo en plena naturaleza con piscina privada y vistas panorámicas', category: 'general' },
      property_description: {
        value: 'Villa María es una elegante finca rústica equipada con todas las comodidades modernas. Disfruta de amplios jardines, piscina privada, zona de barbacoa y espacios luminosos diseñados para el descanso perfecto en familia o con amigos.',
        category: 'general',
      },
      check_in_time: { value: '16:00', category: 'policies' },
      check_out_time: { value: '11:00', category: 'policies' },
      cancellation_policy: { value: 'Cancelación gratuita hasta 7 días antes de la fecha de llegada.', category: 'policies' },
      house_rules: { value: 'No se permiten fiestas ni eventos ruidosos. Respetar las horas de descanso de 23:00 a 08:00. Mascotas bajo consulta previa.', category: 'policies' },
      gallery_images: {
        value: JSON.stringify([
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        ]),
        category: 'media',
      },
      amenities: {
        value: JSON.stringify([
          { id: 'wifi', name: 'Wi-Fi de Alta Velocidad', icon: 'Wifi', description: 'Fibra óptica 600Mb en toda la propiedad' },
          { id: 'pool', name: 'Piscina Privada', icon: 'Waves', description: 'Piscina climatizada con hamacas y solárium' },
          { id: 'parking', name: 'Aparcamiento Gratuito', icon: 'Car', description: 'Plaza privada dentro del recinto para 3 vehículos' },
          { id: 'ac', name: 'Aire Acondicionado & Calefacción', icon: 'AirVent', description: 'Climatizador frío/calor en todas las estancias' },
          { id: 'bbq', name: 'Barbacoa & Jardín', icon: 'Flame', description: 'Zona de barbacoa exterior cubierta con comedor' },
          { id: 'kitchen', name: 'Cocina Totalmente Equipada', icon: 'Utensils', description: 'Lavavajillas, horno, microondas y cafetera expreso' },
        ]),
        category: 'amenities',
      },
      location_address: { value: 'Calle 15, Urbanización Privada, Chichiriviche, Estado Falcón, Venezuela', category: 'location' },
      location_description: { value: 'Urbanización privada tranquila y segura a 5 minutos del embarcadero hacia los cayos.', category: 'location' },
      location_maps_link: { value: 'https://maps.google.com/?q=10.9317,-68.2736', category: 'location' },
      contact_phone: { value: '+58 (414) 123-4567', category: 'contact' },
      contact_email: { value: 'reservas.villamaria@gmail.com', category: 'contact' },
      whatsapp_number: { value: '+584141234567', category: 'contact' },
      reviews: {
        value: JSON.stringify([
          { id: '1', author: 'Mariana Silva', location: 'Caracas, Venezuela', date: 'Julio 2026', comment: '¡Excelente estadía! La casa es impecable, super cómoda y los aires congelan. La piscina de la urbanización es limpia y tranquila.', rating: 5 },
          { id: '2', author: 'José Luis Blanco', location: 'Valencia, Venezuela', date: 'Junio 2026', comment: 'Superó nuestras expectativas. La ubicación en la Calle 15 es ideal porque estás cerca de los embarcaderos y bodegones.', rating: 5 },
          { id: '3', author: 'Gabriela Colmenares', location: 'Barquisimeto, Venezuela', date: 'Mayo 2026', comment: 'La casa cuenta con todo lo necesario para cocinar, descansar e ir a los cayos. La parrillera es perfecta para la tarde.', rating: 5 }
        ]),
        category: 'reviews'
      },
      attractions: {
        value: JSON.stringify([
          { id: '1', title: 'Cayo Sombrero', subtitle: 'Imperdible', time: '15 min en lancha', description: 'El cayo más famoso de Morrocoy. Bosque de cocoteros, arenas blancas y aguas cristalinas ideales para snorkel.' },
          { id: '2', title: 'Cayo Sal & Cayo Muerto', subtitle: 'Familiar', time: '8 - 10 min en lancha', description: 'Cayos muy cercanos a la costa de Chichiriviche con suave oleaje, restaurantes playeros y alquiler de toldos.' },
          { id: '3', title: 'Embarcadero Principal & Malecon', subtitle: 'Transporte', time: '5 min en auto', description: 'Punto de salida de lanchas peñeros y cooperativas de transporte marítimo en Chichiriviche.' },
          { id: '4', title: 'Cueva del Indio & Manglares', subtitle: 'Ecoturismo', time: '20 min en lancha', description: 'Paseo místico en lancha entre manglares para ver petroglifos indígenas y fauna autóctona (flamencos y garzas).' }
        ]),
        category: 'attractions'
      },
    };

    for (const [key, obj] of Object.entries(defaultSettings)) {
      const existing = await prisma.propertySetting.findUnique({ where: { key } });
      if (!existing) {
        await prisma.propertySetting.create({
          data: { key, value: obj.value, category: obj.category },
        });
      }
    }

    // 3. Ensure Default Email Templates
    const defaultTemplates = [
      {
        code: 'BOOKING_CONFIRMATION',
        name: 'Confirmación de Reserva (Huésped)',
        subject: '🌴 ¡Tu reserva en Villa María está confirmada!',
        variables: JSON.stringify(['guest_name', 'start_date', 'end_date', 'total_price', 'reservation_id', 'location_address', 'location_maps_link']),
        bodyHtml: `
          <div style="background-color: #F8F5F0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
              
              <!-- Header Banner -->
              <div style="background-color: #1B3B36; padding: 25px 20px; text-align: center; border-bottom: 3px solid #C17D5C;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 1px;">
                  VILLA MARÍA 🌴
                </h1>
                <p style="color: #A3E635; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
                  Casa de Campo & Relax • Chichiriviche
                </p>
              </div>

              <!-- Body Container -->
              <div style="padding: 25px 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="background-color: rgba(27,59,54,0.08); color: #1B3B36; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                    ✨ Reserva Solicitada con Éxito
                  </span>
                  <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 10px 0 5px 0; font-size: 22px;">
                    ¡Hola {{guest_name}}!
                  </h2>
                  <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0; line-height: 1.5;">
                    Nos complace informarte que tus fechas han sido reservadas en nuestro sistema.
                  </p>
                </div>

                <!-- Ticket Voucher Box -->
                <div style="background-color: #EAE3D8; border: 1px solid rgba(27,59,54,0.15); border-radius: 18px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                      <td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Código de Reserva:</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: bold; font-family: monospace; font-size: 14px; color: #1B3B36;">{{reservation_id}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Fecha de Llegada:</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{start_date}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Fecha de Salida:</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{end_date}}</td>
                    </tr>
                    <tr style="border-top: 1px solid rgba(27,59,54,0.15);">
                      <td style="padding: 10px 0 0 0; font-weight: bold; color: #1B3B36; font-size: 14px;">Monto Total Estancia:</td>
                      <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-family: Georgia, serif; font-size: 18px; color: #1B3B36;">{{total_price}}€</td>
                    </tr>
                  </table>
                </div>

                <!-- Dynamic GPS Location Link Box -->
                <div style="background-color: #ffffff; border: 1px solid rgba(27,59,54,0.15); border-radius: 14px; padding: 15px; text-align: center; margin-bottom: 20px;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #1B3B36; font-weight: bold;">
                    📍 Ubicación Exacta de la Propiedad:
                  </p>
                  <p style="margin: 0 0 12px 0; font-size: 12px; color: rgba(27,59,54,0.8);">
                    {{location_address}}
                  </p>
                  <a href="{{location_maps_link}}" target="_blank" style="display: inline-block; background-color: #1B3B36; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; padding: 10px 20px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    🗺️ Abrir en Google Maps GPS
                  </a>
                </div>

                <!-- WhatsApp CTA -->
                <div style="text-align: center;">
                  <p style="font-size: 12px; color: rgba(27,59,54,0.8); margin-bottom: 10px;">
                    ¿Deseas enviar el comprobante o consultar detalles?
                  </p>
                  <a href="{{whatsapp_url}}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 12px 20px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    💬 Enviar Comprobante por WhatsApp
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #F8F5F0; padding: 15px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">
                © Villa María • Chichiriviche, Falcón, Venezuela
              </div>

            </div>
          </div>
        `,
      },
      {
        code: 'ADMIN_NEW_BOOKING',
        name: 'Aviso de Nueva Reserva (Admin)',
        subject: '🔔 NUEVA RESERVA: {{guest_name}} en Villa María',
        variables: JSON.stringify(['guest_name', 'guest_email', 'guest_phone', 'start_date', 'end_date', 'total_price']),
        bodyHtml: `
          <div style="background-color: #F8F5F0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden;">
              
              <div style="background-color: #1B3B36; padding: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-family: Georgia, serif;">
                  🔔 Nueva Solicitud de Reserva
                </h2>
              </div>

              <div style="padding: 20px;">
                <p style="font-size: 13px; margin-bottom: 15px;">Se ha registrado una nueva solicitud de reserva en la web:</p>
                
                <div style="background-color: #EAE3D8; padding: 15px; border-radius: 14px; font-size: 13px;">
                  <p style="margin: 4px 0;"><strong>Huésped:</strong> {{guest_name}}</p>
                  <p style="margin: 4px 0;"><strong>Email:</strong> {{guest_email}}</p>
                  <p style="margin: 4px 0;"><strong>Teléfono:</strong> {{guest_phone}}</p>
                  <p style="margin: 4px 0;"><strong>Fechas:</strong> {{start_date}} ➔ {{end_date}}</p>
                  <p style="margin: 4px 0;"><strong>Monto Total:</strong> {{total_price}}€</p>
                </div>
              </div>

            </div>
          </div>
        `,
      },
      {
        code: 'BOOKING_CANCELLED',
        name: 'Cancelación de Reserva',
        subject: '⚠️ Reserva Cancelada - Villa María',
        variables: JSON.stringify(['guest_name', 'start_date', 'end_date', 'reservation_id']),
        bodyHtml: `
          <div style="background-color: #F8F5F0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden;">
              
              <div style="background-color: #991B1B; padding: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-family: Georgia, serif;">
                  Reserva Cancelada
                </h2>
              </div>

              <div style="padding: 20px; font-size: 13px;">
                <p>Hola {{guest_name}}, tu reserva con código <strong>{{reservation_id}}</strong> para las fechas {{start_date}} al {{end_date}} ha sido cancelada.</p>
              </div>

            </div>
          </div>
        `,
      },
      {
        code: 'PAYMENT_CONFIRMED',
        name: 'Pago Confirmado y Reserva Activada (Huésped)',
        subject: '🎉 ¡Pago Confirmado y Reserva Activada en Villa María!',
        variables: JSON.stringify(['guest_name', 'start_date', 'end_date', 'total_price', 'reservation_id', 'location_address', 'location_maps_link']),
        bodyHtml: `
          <div style="background-color: #F8F5F0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
              
              <!-- Header Banner -->
              <div style="background-color: #1B3B36; padding: 25px 20px; text-align: center; border-bottom: 3px solid #C17D5C;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 1px;">
                  VILLA MARÍA 🌴
                </h1>
                <p style="color: #A3E635; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
                  ¡PAGO RECIBIDO Y RESERVA ACTIVADA!
                </p>
              </div>

              <!-- Body Container -->
              <div style="padding: 25px 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="background-color: #DCFCE7; color: #166534; font-size: 12px; font-weight: bold; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                    ✅ Pago Confirmado 100%
                  </span>
                  <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 12px 0 5px 0; font-size: 22px;">
                    ¡Todo Listo para tu Viaje, {{guest_name}}!
                  </h2>
                  <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0; line-height: 1.5;">
                    Hemos verificado correctamente el pago de tu reserva. Tu estadía en Villa María ha sido oficialmente <strong>CONFIRMADA Y ACTIVADA</strong>.
                  </p>
                </div>

                <!-- Ticket Voucher Box -->
                <div style="background-color: #EAE3D8; border: 1px solid rgba(27,59,54,0.15); border-radius: 18px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                      <td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Código de Reserva:</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: bold; font-family: monospace; font-size: 14px; color: #1B3B36;">{{reservation_id}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Llegada (Check-in):</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{start_date}} (A partir de las 3:00 PM)</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Salida (Check-out):</td>
                      <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{end_date}} (Hasta las 11:00 AM)</td>
                    </tr>
                    <tr style="border-top: 1px solid rgba(27,59,54,0.15);">
                      <td style="padding: 10px 0 0 0; font-weight: bold; color: #1B3B36; font-size: 14px;">Monto Total Pagado:</td>
                      <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-family: Georgia, serif; font-size: 18px; color: #166534;">{{total_price}}€ ✅</td>
                    </tr>
                  </table>
                </div>

                <!-- Dynamic GPS Location Link Box -->
                <div style="background-color: #ffffff; border: 1px solid rgba(27,59,54,0.15); border-radius: 14px; padding: 15px; text-align: center; margin-bottom: 20px;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #1B3B36; font-weight: bold;">
                    📍 Dirección de Llegada:
                  </p>
                  <p style="margin: 0 0 12px 0; font-size: 12px; color: rgba(27,59,54,0.8);">
                    {{location_address}}
                  </p>
                  <a href="{{location_maps_link}}" target="_blank" style="display: inline-block; background-color: #1B3B36; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; padding: 10px 20px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    🗺️ Abrir Navegación GPS Google Maps
                  </a>
                </div>

                <!-- WhatsApp CTA -->
                <div style="text-align: center;">
                  <a href="{{whatsapp_url}}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 12px 20px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    💬 Contactar al Anfitrión por WhatsApp
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #F8F5F0; padding: 15px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">
                © Villa María • Chichiriviche, Falcón, Venezuela
              </div>

            </div>
          </div>
        `,
      },
      {
        code: 'BOOKING_RESCHEDULED',
        name: 'Reserva Reprogramada — Confirmada (Huésped)',
        subject: '📅 Tu reserva en Villa María ha sido reprogramada',
        variables: JSON.stringify(['guest_name', 'reservation_id', 'old_start_date', 'old_end_date', 'new_start_date', 'new_end_date', 'total_price', 'location_address', 'location_maps_link', 'whatsapp_url']),
        bodyHtml: `
          <div style="background-color: #F8F5F0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
              <div style="background-color: #1B3B36; padding: 25px 20px; text-align: center; border-bottom: 3px solid #C17D5C;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 1px;">VILLA MARÍA 🌴</h1>
                <p style="color: #A3E635; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Casa de Campo &amp; Relax • Chichiriviche</p>
              </div>
              <div style="padding: 25px 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="background-color: rgba(27,59,54,0.08); color: #1B3B36; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">📅 Reserva Reprogramada</span>
                  <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 10px 0 5px 0; font-size: 22px;">¡Hola {{guest_name}}!</h2>
                  <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0; line-height: 1.5;">Tu reserva ha sido reprogramada con éxito. Aquí tienes los nuevos detalles:</p>
                </div>
                <div style="background-color: #EAE3D8; border-radius: 18px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Código Reserva:</td><td style="padding: 6px 0; text-align: right; font-weight: bold; font-family: monospace;">{{reservation_id}}</td></tr>
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.5); text-decoration: line-through;">Fechas anteriores:</td><td style="padding: 6px 0; text-align: right; color: rgba(27,59,54,0.5); text-decoration: line-through;">{{old_start_date}} → {{old_end_date}}</td></tr>
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.7); font-weight: bold;">✅ Nueva Llegada:</td><td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{new_start_date}}</td></tr>
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.7); font-weight: bold;">✅ Nueva Salida:</td><td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{new_end_date}}</td></tr>
                    <tr style="border-top: 1px solid rgba(27,59,54,0.15);"><td style="padding: 10px 0 0 0; font-weight: bold; color: #1B3B36;">Total Confirmado:</td><td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-family: Georgia, serif; font-size: 18px;">{{total_price}}€</td></tr>
                  </table>
                </div>
                <div style="background-color: #ffffff; border: 1px solid rgba(27,59,54,0.15); border-radius: 14px; padding: 15px; text-align: center; margin-bottom: 20px;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #1B3B36; font-weight: bold;">📍 Ubicación:</p>
                  <p style="margin: 0 0 12px 0; font-size: 12px; color: rgba(27,59,54,0.8);">{{location_address}}</p>
                  <a href="{{location_maps_link}}" target="_blank" style="display: inline-block; background-color: #1B3B36; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; padding: 10px 20px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">🗺️ Ver en Google Maps</a>
                </div>
                <a href="{{whatsapp_url}}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 12px 20px; border-radius: 12px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">💬 Contactar por WhatsApp</a>
              </div>
              <div style="background-color: #F8F5F0; padding: 15px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">© Villa María • Chichiriviche, Falcón, Venezuela</div>
            </div>
          </div>
        `,
      },
      {
        code: 'BOOKING_RESCHEDULED_PAYMENT',
        name: 'Reserva Reprogramada — Coste Adicional Pendiente (Huésped)',
        subject: '💳 Reprogramación de tu reserva en Villa María — Coste adicional pendiente',
        variables: JSON.stringify(['guest_name', 'reservation_id', 'old_start_date', 'old_end_date', 'new_start_date', 'new_end_date', 'additional_cost', 'whatsapp_url']),
        bodyHtml: `
          <div style="background-color: #F8F5F0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
              <div style="background-color: #7C3AED; padding: 25px 20px; text-align: center; border-bottom: 3px solid #C17D5C;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 1px;">VILLA MARÍA 🌴</h1>
                <p style="color: #DDD6FE; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Reprogramación — Acción Requerida</p>
              </div>
              <div style="padding: 25px 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">💳 Pago Adicional Requerido</span>
                  <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 10px 0 5px 0; font-size: 22px;">¡Hola {{guest_name}}!</h2>
                  <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0; line-height: 1.5;">Tu reserva ha sido reprogramada con nuevas fechas. Para completar la reprogramación es necesario gestionar un coste adicional:</p>
                </div>
                <div style="background-color: #EAE3D8; border-radius: 18px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.7);">Código Reserva:</td><td style="padding: 6px 0; text-align: right; font-weight: bold; font-family: monospace;">{{reservation_id}}</td></tr>
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.5); text-decoration: line-through;">Fechas anteriores:</td><td style="padding: 6px 0; text-align: right; color: rgba(27,59,54,0.5); text-decoration: line-through;">{{old_start_date}} → {{old_end_date}}</td></tr>
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.7); font-weight: bold;">📅 Nueva Llegada:</td><td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{new_start_date}}</td></tr>
                    <tr><td style="padding: 6px 0; color: rgba(27,59,54,0.7); font-weight: bold;">📅 Nueva Salida:</td><td style="padding: 6px 0; text-align: right; font-weight: bold; color: #1B3B36;">{{new_end_date}}</td></tr>
                    <tr style="border-top: 1px solid rgba(27,59,54,0.15);"><td style="padding: 10px 0 0 0; font-weight: bold; color: #D97706; font-size: 14px;">⚠️ Coste Adicional:</td><td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-family: Georgia, serif; font-size: 20px; color: #D97706;">{{additional_cost}}€</td></tr>
                  </table>
                </div>
                <div style="background-color: #FEF9EC; border: 1px solid #FCD34D; border-radius: 14px; padding: 15px; margin-bottom: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #92400E; font-weight: bold;">Por favor, contacta con el anfitrión para gestionar el pago del importe adicional. Una vez confirmado, recibirás la confirmación definitiva de tu nueva reserva.</p>
                </div>
                <a href="{{whatsapp_url}}" target="_blank" style="display: block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 12px 20px; border-radius: 12px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">💬 Gestionar pago por WhatsApp</a>
              </div>
              <div style="background-color: #F8F5F0; padding: 15px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">© Villa María • Chichiriviche, Falcón, Venezuela</div>
            </div>
          </div>
        `,
      },
    ];

    for (const tpl of defaultTemplates) {
      await prisma.emailTemplate.upsert({
        where: { code: tpl.code },
        update: {
          name: tpl.name,
          subject: tpl.subject,
          bodyHtml: tpl.bodyHtml,
          variables: tpl.variables,
        },
        create: tpl,
      });
    }

    console.log('[Init] Database initialization complete.');
  } catch (error) {
    console.error('[Init] Error during database initialization:', error);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Healthcheck endpoint
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (err: any) {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'initializing', note: err.message });
  }
});

// ---------------- Authentication Routes ----------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son obligatorios.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role: 'CLIENT',
      },
    });

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el registro.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al iniciar sesión.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Property Settings Routes ----------------

app.get('/api/property', async (_req, res) => {
  try {
    const settings = await prisma.propertySetting.findMany();
    const map: Record<string, any> = {};

    for (const item of settings) {
      try {
        map[item.key] = JSON.parse(item.value);
      } catch {
        map[item.key] = item.value;
      }
    }

    res.json({ settings: map });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/property', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settingsObj = req.body;
    for (const [key, value] of Object.entries(settingsObj)) {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await prisma.propertySetting.upsert({
        where: { key },
        update: { value: valStr },
        create: { key, value: valStr, category: 'general' },
      });
    }

    res.json({ success: true, message: 'Configuración actualizada correctamente.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Upload Route ----------------

app.post('/api/uploads', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha adjuntado ningún archivo.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// ---------------- Reservations & Availability Routes ----------------

app.get('/api/reservations/availability', async (_req, res) => {
  try {
    const dbReservations = await prisma.reservation.findMany({
      where: { status: { in: ['CONFIRMED', 'PENDING'] } },
      select: { startDate: true, endDate: true, status: true },
    });

    const dbBlocked = await prisma.blockedDate.findMany({
      select: { startDate: true, endDate: true, reason: true },
    });

    const googleBlocked = await fetchExternalBlockedEvents();

    res.json({
      reservations: dbReservations,
      blockedDates: dbBlocked,
      googleCalendarEvents: googleBlocked,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservations', async (req: AuthenticatedRequest, res) => {
  try {
    const { guestName, guestEmail, guestPhone, startDate, endDate, guestsCount, notes } = req.body;
    if (!guestName || !guestEmail || !guestPhone || !startDate || !endDate) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la fecha de entrada.' });
    }

    // Check overlap with existing reservations
    const overlap = await prisma.reservation.findFirst({
      where: {
        status: { in: ['CONFIRMED', 'PENDING'] },
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });

    if (overlap) {
      return res.status(400).json({ error: 'Las fechas seleccionadas ya no están disponibles.' });
    }

    // Calculate total price
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const priceSetting = await prisma.propertySetting.findUnique({ where: { key: 'price_per_night' } });
    const cleaningSetting = await prisma.propertySetting.findUnique({ where: { key: 'cleaning_fee' } });
    const pricePerNight = priceSetting ? parseFloat(priceSetting.value) : 150;
    const cleaningFee = cleaningSetting ? parseFloat(cleaningSetting.value) : 50;
    const totalPrice = nights * pricePerNight + cleaningFee;

    const reservation = await prisma.reservation.create({
      data: {
        userId: req.user ? req.user.id : null,
        guestName,
        guestEmail,
        guestPhone,
        startDate: start,
        endDate: end,
        guestsCount: Number(guestsCount) || 1,
        totalPrice,
        notes,
        status: 'PENDING',
      },
    });

    // Create Google Calendar event if credentials configured
    const googleEventId = await createCalendarEvent({
      guestName,
      guestEmail,
      guestPhone,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      guestsCount: Number(guestsCount) || 1,
      totalPrice,
      notes,
    });

    if (googleEventId) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { googleEventId },
      });
    }

    // Send Confirmation Email to Client using stored template
    const tpl = await prisma.emailTemplate.findUnique({ where: { code: 'BOOKING_CONFIRMATION' } });
    if (tpl) {
      const locAddr = await prisma.propertySetting.findUnique({ where: { key: 'location_address' } });
      const locMap = await prisma.propertySetting.findUnique({ where: { key: 'location_maps_link' } });
      const waPhone = await prisma.propertySetting.findUnique({ where: { key: 'whatsapp_number' } });

      const mapsLinkVal = locMap?.value || 'https://maps.google.com/?q=Chichiriviche,Venezuela';
      const addressVal = locAddr?.value || 'Calle 15, Urbanización Privada, Chichiriviche, Estado Falcón, Venezuela';
      const waVal = (waPhone?.value || '+584141234567').replace(/[^0-9]/g, '');

      let html = tpl.bodyHtml
        .replace(/{{guest_name}}/g, guestName)
        .replace(/{{reservation_id}}/g, reservation.id.slice(0, 8))
        .replace(/{{start_date}}/g, start.toLocaleDateString('es-ES'))
        .replace(/{{end_date}}/g, end.toLocaleDateString('es-ES'))
        .replace(/{{total_price}}/g, totalPrice.toString())
        .replace(/{{location_address}}/g, addressVal)
        .replace(/{{location_maps_link}}/g, mapsLinkVal)
        .replace(/{{whatsapp_url}}/g, `https://wa.me/${waVal}`);

      sendEmail(guestEmail, tpl.subject, html);
    }

    // Send Notification Email to Admin and Partners using ADMIN_NEW_BOOKING template
    const adminTpl = await prisma.emailTemplate.findUnique({ where: { code: 'ADMIN_NEW_BOOKING' } });
    if (adminTpl) {
      const contactEmailSetting = await prisma.propertySetting.findUnique({ where: { key: 'contact_email' } });
      const partnerEmailSetting = await prisma.propertySetting.findUnique({ where: { key: 'partner_emails' } });

      const mainAdminEmail = contactEmailSetting?.value || process.env.SMTP_USER || process.env.SMTP_FROM || 'reservas.villamaria@gmail.com';
      const partnerEmailsRaw = partnerEmailSetting?.value || '';
      
      const recipients = new Set<string>();
      if (mainAdminEmail) recipients.add(mainAdminEmail.trim());
      
      partnerEmailsRaw.split(',').forEach((em) => {
        const cleaned = em.trim();
        if (cleaned && cleaned.includes('@')) {
          recipients.add(cleaned);
        }
      });

      const cleanPhone = (guestPhone || '').replace(/[^0-9]/g, '');

      let adminHtml = adminTpl.bodyHtml
        .replace(/{{guest_name}}/g, guestName)
        .replace(/{{guest_email}}/g, guestEmail || 'No provisto')
        .replace(/{{guest_phone}}/g, guestPhone)
        .replace(/{{guest_phone_clean}}/g, cleanPhone)
        .replace(/{{reservation_id}}/g, reservation.id.slice(0, 8))
        .replace(/{{start_date}}/g, start.toLocaleDateString('es-ES'))
        .replace(/{{end_date}}/g, end.toLocaleDateString('es-ES'))
        .replace(/{{guests_count}}/g, (guestsCount || 1).toString())
        .replace(/{{total_price}}/g, totalPrice.toString())
        .replace(/{{notes}}/g, notes || 'Sin solicitudes especiales');

      for (const targetEmail of recipients) {
        sendEmail(targetEmail, adminTpl.subject.replace(/{{guest_name}}/g, guestName), adminHtml);
      }
    }

    res.json({ success: true, reservation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations/my-bookings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const bookings = await prisma.reservation.findMany({
      where: { userId: req.user!.id },
      orderBy: { startDate: 'desc' },
    });
    res.json({ bookings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Admin Management Routes ----------------

app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const totalReservations = await prisma.reservation.count();
    const pendingReservations = await prisma.reservation.count({ where: { status: 'PENDING' } });
    const confirmedReservations = await prisma.reservation.count({ where: { status: 'CONFIRMED' } });
    const totalUsers = await prisma.user.count({ where: { role: 'CLIENT' } });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthIncome = await prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: {
        status: 'CONFIRMED',
        createdAt: { gte: firstDayOfMonth },
      },
    });

    res.json({
      metrics: {
        totalReservations,
        pendingReservations,
        confirmedReservations,
        totalUsers,
        monthlyIncome: monthIncome._sum.totalPrice || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/reservations', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { user: { select: { id: true, email: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reservations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/reservations/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status, internalNotes },
    });

    // If cancelled: remove Google Event + send cancellation email to client
    if (status === 'CANCELLED') {
      if (reservation.googleEventId) {
        await deleteCalendarEvent(reservation.googleEventId);
      }
      if (reservation.guestEmail) {
        const tpl = await prisma.emailTemplate.findUnique({ where: { code: 'BOOKING_CANCELLED' } });
        if (tpl) {
          const html = tpl.bodyHtml
            .replace(/{{guest_name}}/g, reservation.guestName)
            .replace(/{{reservation_id}}/g, reservation.id.slice(0, 8).toUpperCase())
            .replace(/{{start_date}}/g, new Date(reservation.startDate).toLocaleDateString('es-ES'))
            .replace(/{{end_date}}/g, new Date(reservation.endDate).toLocaleDateString('es-ES'));
          sendEmail(reservation.guestEmail, tpl.subject, html);
        }
      }
    }

    res.json({ success: true, reservation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// RESCHEDULE reservation
app.post('/api/admin/reservations/:id/reschedule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newStartDate, newEndDate, additionalCost, additionalCostAmount } = req.body;

    if (!newStartDate || !newEndDate) {
      return res.status(400).json({ error: 'Se requieren newStartDate y newEndDate.' });
    }

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

    const oldStartDate = new Date(reservation.startDate);
    const oldEndDate = new Date(reservation.endDate);
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    const hasAdditionalCost = Boolean(additionalCost) && Number(additionalCostAmount) > 0;

    // Update reservation: if additional cost → back to PENDING for re-confirmation
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        startDate: newStart,
        endDate: newEnd,
        status: hasAdditionalCost ? 'PENDING' : 'CONFIRMED',
        internalNotes: hasAdditionalCost
          ? `Reprogramada. Coste adicional pendiente: ${additionalCostAmount}€. ${reservation.internalNotes || ''}`
          : `Reprogramada sin coste adicional. ${reservation.internalNotes || ''}`,
      },
    });

    // Update Google Calendar event if exists
    if (reservation.googleEventId) {
      await deleteCalendarEvent(reservation.googleEventId);
      // Re-create event with new dates
      await createCalendarEvent({
        title: `Villa María – ${reservation.guestName}`,
        description: `Huésped: ${reservation.guestName} | Email: ${reservation.guestEmail} | Teléfono: ${reservation.guestPhone}`,
        startDate: newStart,
        endDate: newEnd,
      }).catch(() => null);
    }

    // Send email to client
    if (reservation.guestEmail) {
      const locAddr = await prisma.propertySetting.findUnique({ where: { key: 'location_address' } });
      const locMap = await prisma.propertySetting.findUnique({ where: { key: 'location_maps_link' } });
      const waPhone = await prisma.propertySetting.findUnique({ where: { key: 'whatsapp_number' } });

      const addressVal = locAddr?.value || 'Chichiriviche, Estado Falcón, Venezuela';
      const mapsLinkVal = locMap?.value || 'https://maps.google.com/?q=Chichiriviche,Venezuela';
      const waVal = (waPhone?.value || '+584141234567').replace(/[^0-9]/g, '');

      if (hasAdditionalCost) {
        // Email: additional cost required
        const tpl = await prisma.emailTemplate.findUnique({ where: { code: 'BOOKING_RESCHEDULED_PAYMENT' } });
        if (tpl) {
          const html = tpl.bodyHtml
            .replace(/{{guest_name}}/g, reservation.guestName)
            .replace(/{{reservation_id}}/g, reservation.id.slice(0, 8).toUpperCase())
            .replace(/{{old_start_date}}/g, oldStartDate.toLocaleDateString('es-ES'))
            .replace(/{{old_end_date}}/g, oldEndDate.toLocaleDateString('es-ES'))
            .replace(/{{new_start_date}}/g, newStart.toLocaleDateString('es-ES'))
            .replace(/{{new_end_date}}/g, newEnd.toLocaleDateString('es-ES'))
            .replace(/{{additional_cost}}/g, String(additionalCostAmount))
            .replace(/{{whatsapp_url}}/g, `https://wa.me/${waVal}`);
          sendEmail(reservation.guestEmail, tpl.subject, html);
        }
      } else {
        // Email: rescheduled confirmed
        const tpl = await prisma.emailTemplate.findUnique({ where: { code: 'BOOKING_RESCHEDULED' } });
        if (tpl) {
          const html = tpl.bodyHtml
            .replace(/{{guest_name}}/g, reservation.guestName)
            .replace(/{{reservation_id}}/g, reservation.id.slice(0, 8).toUpperCase())
            .replace(/{{old_start_date}}/g, oldStartDate.toLocaleDateString('es-ES'))
            .replace(/{{old_end_date}}/g, oldEndDate.toLocaleDateString('es-ES'))
            .replace(/{{new_start_date}}/g, newStart.toLocaleDateString('es-ES'))
            .replace(/{{new_end_date}}/g, newEnd.toLocaleDateString('es-ES'))
            .replace(/{{total_price}}/g, String(reservation.totalPrice))
            .replace(/{{location_address}}/g, addressVal)
            .replace(/{{location_maps_link}}/g, mapsLinkVal)
            .replace(/{{whatsapp_url}}/g, `https://wa.me/${waVal}`);
          sendEmail(reservation.guestEmail, tpl.subject, html);
        }
      }
    }

    res.json({ success: true, reservation: updated, hasAdditionalCost });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE reservation
app.delete('/api/admin/reservations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

    if (reservation.googleEventId) {
      await deleteCalendarEvent(reservation.googleEventId);
    }

    await prisma.reservation.delete({ where: { id } });
    res.json({ success: true, message: 'Reserva eliminada correctamente.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CONFIRM PAYMENT — marks as CONFIRMED and sends PAYMENT_CONFIRMED email to client
app.post('/api/admin/reservations/:id/confirm-payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada.' });

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    // Send PAYMENT_CONFIRMED email to client
    if (reservation.guestEmail) {
      const tpl = await prisma.emailTemplate.findUnique({ where: { code: 'PAYMENT_CONFIRMED' } });
      if (tpl) {
        const locAddr = await prisma.propertySetting.findUnique({ where: { key: 'location_address' } });
        const locMap = await prisma.propertySetting.findUnique({ where: { key: 'location_maps_link' } });
        const waPhone = await prisma.propertySetting.findUnique({ where: { key: 'whatsapp_number' } });

        const mapsLinkVal = locMap?.value || 'https://maps.google.com/?q=Chichiriviche,Venezuela';
        const addressVal = locAddr?.value || 'Calle 15, Urbanización Privada, Chichiriviche, Estado Falcón, Venezuela';
        const waVal = (waPhone?.value || '+584141234567').replace(/[^0-9]/g, '');

        const html = tpl.bodyHtml
          .replace(/{{guest_name}}/g, reservation.guestName)
          .replace(/{{reservation_id}}/g, reservation.id.slice(0, 8))
          .replace(/{{start_date}}/g, new Date(reservation.startDate).toLocaleDateString('es-ES'))
          .replace(/{{end_date}}/g, new Date(reservation.endDate).toLocaleDateString('es-ES'))
          .replace(/{{total_price}}/g, reservation.totalPrice.toString())
          .replace(/{{location_address}}/g, addressVal)
          .replace(/{{location_maps_link}}/g, mapsLinkVal)
          .replace(/{{whatsapp_url}}/g, `https://wa.me/${waVal}`);

        sendEmail(reservation.guestEmail, tpl.subject, html);
      }
    }

    res.json({ success: true, reservation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// ─── REVIEWS ────────────────────────────────────────────────────────────────

// PUBLIC: get only visible reviews
app.get('/api/reviews', async (_req, res) => {
  try {
    const reviews = await (prisma as any).review.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC: submit a new review (starts as visible:false, admin must approve)
app.post('/api/reviews', async (req, res) => {
  try {
    const { author, location, date, rating, comment, avatarUrl } = req.body;
    if (!author || !comment) return res.status(400).json({ error: 'author y comment son requeridos.' });

    const review = await (prisma as any).review.create({
      data: {
        author,
        location: location || '',
        date: date || new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment,
        avatarUrl: avatarUrl || null,
        visible: false,
      },
    });
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: get ALL reviews (visible + hidden) for management
app.get('/api/admin/reviews', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const reviews = await (prisma as any).review.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: toggle review visibility
app.patch('/api/admin/reviews/:id/visible', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { visible } = req.body;
    const review = await (prisma as any).review.update({
      where: { id },
      data: { visible: Boolean(visible) },
    });
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: delete review
app.delete('/api/admin/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await (prisma as any).review.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── ADMIN USERS ─────────────────────────────────────────────────────────────
app.get('/api/admin/users', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Blocked dates
app.get('/api/admin/blocked-dates', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const blocked = await prisma.blockedDate.findMany({ orderBy: { startDate: 'asc' } });
    res.json({ blockedDates: blocked });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/blocked-dates', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const item = await prisma.blockedDate.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        createdBy: req.user!.email,
      },
    });
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/blocked-dates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.blockedDate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Email templates
app.get('/api/admin/email-templates', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany();
    res.json({ templates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/email-templates/:code', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const { subject, bodyHtml } = req.body;
    const tpl = await prisma.emailTemplate.update({
      where: { code },
      data: { subject, bodyHtml },
    });
    res.json({ success: true, template: tpl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/send-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { to, subject, bodyHtml } = req.body;
    const ok = await sendEmail(to, subject, bodyHtml);
    if (!ok) return res.status(500).json({ error: 'No se pudo enviar el email. Verifica la configuración SMTP.' });
    res.json({ success: true, message: 'Email enviado correctamente.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- GUI SMTP Configuration Routes ----------------

app.get('/api/admin/smtp', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const dbSmtp = await prisma.smtpSetting.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!dbSmtp) {
      return res.json({ configured: false, settings: null });
    }

    res.json({
      configured: true,
      settings: {
        host: dbSmtp.host,
        port: dbSmtp.port,
        user: dbSmtp.user,
        passwordMasked: '********',
        fromEmail: dbSmtp.fromEmail,
        fromName: dbSmtp.fromName,
        security: dbSmtp.security,
        replyTo: dbSmtp.replyTo,
        isActive: dbSmtp.isActive,
        updatedAt: dbSmtp.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/smtp', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { host, port, user, password, fromEmail, fromName, security, replyTo } = req.body;
    if (!host || !port || !user || !fromEmail || !fromName) {
      return res.status(400).json({ error: 'Host, puerto, usuario, remitente y nombre son obligatorios.' });
    }

    // Check existing
    const existing = await prisma.smtpSetting.findFirst({ where: { isActive: true } });
    let encryptedPassword = existing ? existing.encryptedPassword : '';

    if (password && password !== '********') {
      encryptedPassword = encryptText(password);
    }

    let item;
    if (existing) {
      item = await prisma.smtpSetting.update({
        where: { id: existing.id },
        data: {
          host,
          port: Number(port),
          user,
          encryptedPassword,
          fromEmail,
          fromName,
          security: security || 'STARTTLS',
          replyTo,
          updatedBy: req.user!.email,
        },
      });
    } else {
      item = await prisma.smtpSetting.create({
        data: {
          host,
          port: Number(port),
          user,
          encryptedPassword: encryptText(password || ''),
          fromEmail,
          fromName,
          security: security || 'STARTTLS',
          replyTo,
          isActive: true,
          updatedBy: req.user!.email,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SMTP_CONFIG',
        performedBy: req.user!.email,
        details: `Configuración SMTP actualizada: ${host}:${port} (${fromEmail})`,
      },
    });

    res.json({ success: true, message: 'Configuración SMTP guardada correctamente.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/smtp/test-connection', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { host, port, user, password, security } = req.body;

    let clearPassword = password;
    if (password === '********' || !password) {
      const existing = await prisma.smtpSetting.findFirst({ where: { isActive: true } });
      if (existing) {
        clearPassword = decryptText(existing.encryptedPassword);
      }
    }

    const result = await testSmtpConnection({
      host,
      port: Number(port),
      user,
      password: clearPassword,
      fromEmail: '',
      fromName: '',
      security: security || 'STARTTLS',
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/smtp/test-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { host, port, user, password, fromEmail, fromName, security, targetEmail } = req.body;

    let clearPassword = password;
    if (password === '********' || !password) {
      const existing = await prisma.smtpSetting.findFirst({ where: { isActive: true } });
      if (existing) {
        clearPassword = decryptText(existing.encryptedPassword);
      }
    }

    const result = await sendTestEmailDirect(
      {
        host,
        port: Number(port),
        user,
        password: clearPassword,
        fromEmail,
        fromName,
        security: security || 'STARTTLS',
      },
      targetEmail
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// Serve Production Static Files
// ----------------------------------------------------
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ----------------------------------------------------
// Server Start & DB Initialization
// ----------------------------------------------------
app.listen(PORT, async () => {
  console.log(`[Server] Villa María backend listening on port ${PORT}`);
  await initializeDatabase();
});
