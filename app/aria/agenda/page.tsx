import { getCockpitData } from "@/lib/supabase/data";
import AgendaClient from "./AgendaClient";

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
