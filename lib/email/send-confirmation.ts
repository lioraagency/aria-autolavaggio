import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL ?? ''

const SERVICE_FR: Record<string, string> = {
  exterior: 'Lavage extérieur',
  interior: 'Lavage intérieur',
  complete: 'Lavage complet',
}

const SUPPLEMENT_FR: Record<string, string> = {
  calcium: 'Traitement calcium',
  moteur: 'Shampoing moteur',
}

export interface BookingEmailPayload {
  bookingNumber: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  serviceType: string
  supplements: string[]
  scheduledAt: string   // ISO string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  vehicleType: string
  totalPriceCents: number
}

export async function sendOwnerConfirmation(p: BookingEmailPayload): Promise<void> {
  if (!OWNER_EMAIL) {
    console.warn('[email] OWNER_NOTIFICATION_EMAIL not set — skipping')
    return
  }

  const dateStr = new Date(p.scheduledAt).toLocaleString('fr-CA', {
    timeZone: 'America/Toronto',
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const supplementsLine = p.supplements.length > 0
    ? p.supplements.map(s => SUPPLEMENT_FR[s] ?? s).join(', ')
    : 'Aucun'

  const totalDisplay = Math.round(p.totalPriceCents / 100)

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <h2 style="background:#0A0A0A;color:#D4FF3F;padding:20px 24px;margin:0;font-size:18px;letter-spacing:1px">
        NOUVELLE RÉSERVATION — ${p.bookingNumber}
      </h2>
      <div style="padding:24px;border:1px solid #e5e5e5;border-top:none">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#666;width:140px">Client</td>
              <td style="padding:8px 0;font-weight:600">${p.firstName} ${p.lastName}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Téléphone</td>
              <td style="padding:8px 0">${p.phone}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Courriel</td>
              <td style="padding:8px 0">${p.email ?? '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Date</td>
              <td style="padding:8px 0;font-weight:600;color:#0070f3">${dateStr}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Service</td>
              <td style="padding:8px 0">${SERVICE_FR[p.serviceType] ?? p.serviceType}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Suppléments</td>
              <td style="padding:8px 0">${supplementsLine}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Véhicule</td>
              <td style="padding:8px 0">${p.vehicleMake} ${p.vehicleModel} ${p.vehicleYear} — ${p.vehicleColor}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Total</td>
              <td style="padding:8px 0;font-weight:700;font-size:16px">${totalDisplay} $</td></tr>
        </table>
      </div>
      <div style="padding:12px 24px;background:#f9f9f9;font-size:12px;color:#999">
        Auto Lavaggio — Généré automatiquement
      </div>
    </div>
  `

  await resend.emails.send({
    from: 'Auto Lavaggio <notifications@liora.services>',
    to: OWNER_EMAIL,
    subject: `🚗 Nouvelle réservation ${p.bookingNumber} — ${p.firstName} ${p.lastName} (${dateStr})`,
    html,
  })
}
