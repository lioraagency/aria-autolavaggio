import { redirect } from "next/navigation";

// Root redirects to ARIA login (dashboard app)
export default function RootPage() {
  redirect("/aria/login");
}
