import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, SupabaseConfigError } from "@/lib/supabase/service";
import { SERVICE_DURATIONS, SERVICE_PRICES, type ServiceType } from "@/lib/types";

const VALID_SERVICE: ServiceType[] = ["exterior", "interior", "complete"];

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function bookingNumberFromId(id: string): string {
  return `R-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, error: "JSON invalide" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (e) {
    if (e instanceof SupabaseConfigError) {
      console.error("[api/reservations] config:", e.message);
      return NextResponse.json({ success: false, error: e.message }, { status: 503 });
    }
    throw e;
  }

  const serviceType = body.serviceType as string | undefined;
  const supplements = (Array.isArray(body.supplements) ? body.supplements : []) as string[];
  const totalPriceRaw = body.totalPrice;
  const vehicleType = (body.vehicleType as string) || "sedan";
  const vehicleMake = String(body.vehicleMake ?? "").trim();
  const vehicleModel = String(body.vehicleModel ?? "").trim();
  const vehicleYear = Number(body.vehicleYear);
  const vehicleColor = String(body.vehicleColor ?? "").trim();
  const vehicleNotes = body.vehicleNotes != null ? String(body.vehicleNotes).trim() : "";
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const emailRaw = body.email != null ? String(body.email).trim() : "";
  const email = emailRaw.length > 0 ? emailRaw : null;
  const smsOptIn = Boolean(body.smsOptIn);
  const isFirstVisit = Boolean(body.isFirstVisit);

  if (!serviceType || !date || !time || !firstName || !lastName || !phone) {
    return NextResponse.json(
      { success: false, error: "Champs requis manquants (service, date, heure, nom, téléphone)." },
      { status: 400 }
    );
  }

  if (!VALID_SERVICE.includes(serviceType as ServiceType)) {
    return NextResponse.json({ success: false, error: "Type de service invalide." }, { status: 400 });
  }

  const st = serviceType as ServiceType;

  if (!vehicleMake || !vehicleModel || !Number.isFinite(vehicleYear) || vehicleYear < 1950 || vehicleYear > 2100) {
    return NextResponse.json(
      { success: false, error: "Informations véhicule invalides (marque, modèle, année)." },
      { status: 400 }
    );
  }

  const phoneNorm = normalizePhone(phone);
  if (phoneNorm.length < 10) {
    return NextResponse.json(
      { success: false, error: "Numéro de téléphone invalide (minimum 10 chiffres)." },
      { status: 400 }
    );
  }

  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if (!y || !mo || !d || !Number.isFinite(h) || !Number.isFinite(mi)) {
    return NextResponse.json({ success: false, error: "Date ou heure invalide." }, { status: 400 });
  }
  const scheduledAt = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ success: false, error: "Date ou heure invalide." }, { status: 400 });
  }

  const defaultPrice = SERVICE_PRICES[st];
  const priceCents =
    typeof totalPriceRaw === "number" && Number.isFinite(totalPriceRaw) && totalPriceRaw > 0
      ? Math.round(totalPriceRaw)
      : defaultPrice;

  const duration = SERVICE_DURATIONS[st] ?? 60;

  const supplementLabels: Record<string, string> = {
    calcium: "Traitement calcium",
    moteur: "Shampoing moteur",
  };
  const supplementNotes =
    supplements.length > 0
      ? `Suppléments: ${supplements.map((s) => supplementLabels[s] ?? s).join(", ")}`
      : null;

  const customerNotes = isFirstVisit ? "Première visite" : null;

  try {
    let customerId: string;
    let prevVisits = 0;
    let prevSpent = 0;

    const { data: existing, error: findErr } = await supabase
      .from("customers")
      .select("id,total_visits,total_spent_cents")
      .eq("phone_normalized", phoneNorm)
      .maybeSingle();

    if (findErr) {
      console.error("[api/reservations] find customer:", findErr);
      return NextResponse.json(
        { success: false, error: "Impossible de vérifier le client. Réessayez plus tard." },
        { status: 502 }
      );
    }

    if (existing) {
      customerId = existing.id;
      prevVisits = existing.total_visits ?? 0;
      prevSpent = existing.total_spent_cents ?? 0;
    } else {
      const { data: created, error: insErr } = await supabase
        .from("customers")
        .insert({
          first_name: firstName,
          last_name: lastName,
          phone,
          phone_normalized: phoneNorm,
          email,
          total_visits: 0,
          total_spent_cents: 0,
          notes: customerNotes,
        })
        .select("id")
        .single();

      if (insErr) {
        if (insErr.code === "23505") {
          const { data: raced, error: raceErr } = await supabase
            .from("customers")
            .select("id,total_visits,total_spent_cents")
            .eq("phone_normalized", phoneNorm)
            .single();
          if (raceErr || !raced) {
            console.error("[api/reservations] race fetch customer:", raceErr);
            return NextResponse.json(
              { success: false, error: "Conflit de création client. Réessayez." },
              { status: 409 }
            );
          }
          customerId = raced.id;
          prevVisits = raced.total_visits ?? 0;
          prevSpent = raced.total_spent_cents ?? 0;
        } else {
          console.error("[api/reservations] insert customer:", insErr);
          return NextResponse.json(
            { success: false, error: "Impossible d'enregistrer le client." },
            { status: 502 }
          );
        }
      } else if (!created) {
        return NextResponse.json({ success: false, error: "Création client inattendue." }, { status: 500 });
      } else {
        customerId = created.id;
      }
    }

    const { data: reservation, error: resErr } = await supabase
      .from("reservations")
      .insert({
        customer_id: customerId,
        service_type: st,
        scheduled_at: scheduledAt.toISOString(),
        estimated_duration_minutes: duration,
        operational_status: "scheduled",
        payment_status: "unpaid",
        price_cents: priceCents,
        notes: supplementNotes,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_year: vehicleYear,
        vehicle_color: vehicleColor,
        vehicle_type: vehicleType,
        vehicle_notes: vehicleNotes || null,
        supplements,
        sms_opt_in: smsOptIn,
        is_first_visit: isFirstVisit,
      })
      .select("id")
      .single();

    if (resErr || !reservation) {
      console.error("[api/reservations] insert reservation:", resErr);
      return NextResponse.json(
        { success: false, error: "Impossible d'enregistrer la réservation." },
        { status: 502 }
      );
    }

    const reservationId = reservation.id as string;

    const { error: alertErr } = await supabase.from("alerts").insert({
      reservation_id: reservationId,
      alert_type: "new_reservation",
      title: "Nouvelle réservation",
      body: `${firstName} ${lastName} — ${st} — ${scheduledAt.toISOString()}`,
    });

    if (alertErr) {
      console.error("[api/reservations] insert alert:", alertErr);
      await supabase.from("reservations").delete().eq("id", reservationId);
      return NextResponse.json(
        { success: false, error: "Impossible de finaliser la réservation (alerte). Réessayez." },
        { status: 502 }
      );
    }

    const { error: logErr } = await supabase.from("system_logs").insert({
      level: "info",
      event_type: "reservation.created",
      message: "Public reservation submitted",
      metadata: {
        service_type: st,
        scheduled_at: scheduledAt.toISOString(),
        price_cents: priceCents,
      },
      reservation_id: reservationId,
      customer_id: customerId,
    });

    if (logErr) {
      console.error("[api/reservations] insert system_logs:", logErr);
      await supabase.from("alerts").delete().eq("reservation_id", reservationId);
      await supabase.from("reservations").delete().eq("id", reservationId);
      return NextResponse.json(
        { success: false, error: "Impossible de finaliser la réservation (journal). Réessayez." },
        { status: 502 }
      );
    }

    const { error: updErr } = await supabase
      .from("customers")
      .update({
        total_visits: prevVisits + 1,
        total_spent_cents: prevSpent + priceCents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (updErr) {
      console.error("[api/reservations] update customer stats:", updErr);
    }

    return NextResponse.json({
      success: true,
      bookingId: reservationId,
      bookingNumber: bookingNumberFromId(reservationId),
      customerId,
    });
  } catch (e) {
    console.error("[api/reservations] POST error:", e);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
