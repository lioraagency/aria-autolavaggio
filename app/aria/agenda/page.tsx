import { getCockpitData } from "@/lib/supabase/data";
import AgendaClient from "./AgendaClient";

// Données lues en base à chaque requête, pas figées au build
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { bookings, customerMap, vehicleMap } = await getCockpitData('all');

  return (
    <AgendaClient
      initialBookings={bookings}
      customerMap={customerMap}
      vehicleMap={vehicleMap}
    />
  );
}
