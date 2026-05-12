import { NextRequest, NextResponse } from "next/server"

// TODO: Replace mock with Twilio when ready
// import twilio from 'twilio'
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const SMS_TEMPLATE = (firstName: string) =>
  `Bonjour ${firstName}, votre véhicule est prêt chez Autolavaggio. Vous pouvez venir le récupérer en tout temps. Merci!`

export async function POST(req: NextRequest) {
  const { bookingId, phone, firstName } = await req.json()

  const message = SMS_TEMPLATE(firstName ?? 'client')

  // Mock: log to console
  console.log(`[SMS MOCK] To: ${phone} | Message: ${message} | BookingId: ${bookingId}`)

  // TODO: Twilio integration:
  // const result = await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_FROM_NUMBER,
  //   to: phone,
  // })
  // return NextResponse.json({ success: true, sid: result.sid })

  return NextResponse.json({
    success: true,
    sid: 'mock_' + Date.now(),
    message,
    to: phone,
  })
}
