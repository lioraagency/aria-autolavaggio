import type { Metadata } from "next";
import DispoClient from "./DispoClient";

export const metadata: Metadata = {
  title: "ARIA — Disponibilités",
};

export default function DispoPage() {
  return <DispoClient />;
}
