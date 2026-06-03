import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

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
      <h2 style="background:#0A0A0A;color:#D5FC96;padding:20px 24px;margin:0;font-size:18px;letter-spacing:1px">
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

  await getResend().emails.send({
    from: 'Auto Lavaggio <notifications@liora.services>',
    to: OWNER_EMAIL,
    subject: `🚗 Nouvelle réservation ${p.bookingNumber} — ${p.firstName} ${p.lastName} (${dateStr})`,
    html,
  })
}

export interface ClientEmailPayload {
  bookingNumber: string
  firstName: string
  email: string
  serviceType: string
  supplements: string[]
  scheduledAt: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  totalPriceCents: number
}

export async function sendClientConfirmation(p: ClientEmailPayload): Promise<void> {
  if (!p.email) return

  const dateStr = new Date(p.scheduledAt).toLocaleString('fr-CA', {
    timeZone: 'America/Toronto',
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const SERVICE_FR: Record<string, string> = {
    exterior: 'Lavage extérieur',
    interior: 'Lavage intérieur',
    complete: 'Lavage complet',
  }

  const SUPPLEMENT_FR: Record<string, string> = {
    calcium: 'Traitement calcium (+20 $)',
    moteur: 'Shampoing moteur (+35 $)',
  }

  const totalDisplay = Math.round(p.totalPriceCents / 100)
  const supplementsHtml = p.supplements.length > 0
    ? `<div style="padding:16px 28px;background:#fffbf7;border-bottom:1px solid #f0f0f0;border-left:3px solid #E8651A">
        <div style="font-size:11px;color:#E8651A;font-weight:700;margin-bottom:4px">Suppléments inclus</div>
        ${p.supplements.map(s => `<div style="font-size:13px;color:#555">+ ${SUPPLEMENT_FR[s] ?? s}</div>`).join('')}
       </div>`
    : ''

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#fff">
      <div style="background:#0A0A0A;padding:24px 28px;text-align:center">
        <img src="https://aria-autolavaggio.vercel.app/logo-autolavaggio.png" alt="Autolavaggio" style="height:56px;width:auto" />
      </div>
      <div style="background:#111;padding:32px 28px 24px">
        <div style="color:#D5FC96;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px">Réservation confirmée</div>
        <div style="color:#fff;font-size:24px;font-weight:900;line-height:1.15">Bonjour ${p.firstName},<br>vous êtes attendu.</div>
        <div style="color:#666;font-size:12px;margin-top:8px">Confirmation N° ${p.bookingNumber}</div>
      </div>
      <div style="padding:28px;border-bottom:1px solid #f0f0f0">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:11px 0;color:#666;border-bottom:1px solid #f5f5f5;width:130px;font-weight:500">📅 Date</td>
              <td style="padding:11px 0;border-bottom:1px solid #f5f5f5;font-weight:700;color:#111;text-transform:capitalize">${dateStr}</td></tr>
          <tr><td style="padding:11px 0;color:#666;border-bottom:1px solid #f5f5f5;font-weight:500">🧼 Service</td>
              <td style="padding:11px 0;border-bottom:1px solid #f5f5f5;color:#111">${SERVICE_FR[p.serviceType] ?? p.serviceType}</td></tr>
          <tr><td style="padding:11px 0;color:#666;border-bottom:1px solid #f5f5f5;font-weight:500">🚗 Véhicule</td>
              <td style="padding:11px 0;border-bottom:1px solid #f5f5f5;color:#111">${p.vehicleMake} ${p.vehicleModel} ${p.vehicleYear} — ${p.vehicleColor}</td></tr>
          <tr><td style="padding:11px 0;color:#666;font-weight:500">💳 Total</td>
              <td style="padding:11px 0;font-weight:900;font-size:18px;color:#111">${totalDisplay} $</td></tr>
        </table>
      </div>
      ${supplementsHtml}
      <div style="padding:22px 28px;background:#f9f9f9;border-bottom:1px solid #f0f0f0">
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:#aaa;text-transform:uppercase;margin-bottom:8px">Nous vous attendons au</div>
        <div style="font-size:15px;font-weight:700;color:#111">Autolavaggio — Lavage à la main</div>
        <div style="font-size:13px;color:#555;margin-top:4px">2125 chemin Sainte-Foy, Québec, QC</div>
        <div style="font-size:12px;color:#999;margin-top:6px">Le paiement se fait sur place. Aucune carte requise.</div>
      </div>
      <div style="padding:22px 28px">
        <p style="font-size:13px;color:#888;line-height:1.6">Des questions? Appelez-nous directement.</p>
        <p style="font-size:11px;color:#ccc;margin-top:14px">Autolavaggio · Sainte-Foy, Québec</p>
        <p style="font-size:10px;color:#ccc;margin-top:8px">Propulsé par <a href="https://liora.services" style="color:#999;text-decoration:none">LIORA</a></p>
      </div>
    </div>
  `

  await getResend().emails.send({
    from: 'Autolavaggio <notifications@liora.services>',
    to: p.email,
    subject: `✅ Réservation confirmée — ${dateStr}`,
    html,
  })
}
