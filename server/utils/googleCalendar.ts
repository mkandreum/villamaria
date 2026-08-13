import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || '';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

function getCalendarClient() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface CalendarEventPayload {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  startDate: string; // ISO or YYYY-MM-DD
  endDate: string;
  guestsCount: number;
  totalPrice: number;
  notes?: string;
}

export async function createCalendarEvent(payload: CalendarEventPayload): Promise<string | null> {
  const calendar = getCalendarClient();
  if (!calendar) {
    console.log('[GoogleCalendar] Credentials missing, skipping Google Calendar event creation.');
    return null;
  }

  try {
    const summary = `Reserva Villa Maria: ${payload.guestName}`;
    const description = `
Huésped: ${payload.guestName}
Email: ${payload.guestEmail}
Teléfono: ${payload.guestPhone}
Huéspedes: ${payload.guestsCount}
Precio Total: ${payload.totalPrice}€
Notas: ${payload.notes || 'Sin notas'}
    `.trim();

    const startDateTime = new Date(payload.startDate).toISOString();
    const endDateTime = new Date(payload.endDate).toISOString();

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        attendees: payload.guestEmail ? [{ email: payload.guestEmail }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 120 },
          ],
        },
      },
    });

    return response.data.id || null;
  } catch (error) {
    console.error('[GoogleCalendar] Error creating event:', error);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const calendar = getCalendarClient();
  if (!calendar || !eventId) return false;

  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });
    return true;
  } catch (error) {
    console.error('[GoogleCalendar] Error deleting event:', error);
    return false;
  }
}

export async function fetchExternalBlockedEvents(): Promise<{ startDate: string; endDate: string; title: string }[]> {
  const calendar = getCalendarClient();
  if (!calendar) return [];

  try {
    const now = new Date();
    const future = new Date();
    future.setFullYear(now.getFullYear() + 2);

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    return events
      .filter((item) => item.start && item.end)
      .map((item) => {
        const start = item.start?.dateTime || item.start?.date || '';
        const end = item.end?.dateTime || item.end?.date || '';
        return {
          startDate: start,
          endDate: end,
          title: item.summary || 'Reserva externa Google Calendar',
        };
      });
  } catch (error) {
    console.error('[GoogleCalendar] Error fetching external events:', error);
    return [];
  }
}
