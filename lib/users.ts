export type UserRole = "owner" | "demo";

export interface AriaUser {
  id:   string;
  name: string;
  role: UserRole;
  pin:  string;
}

export const USERS: AriaUser[] = [
  { id: "raph", name: "Raph", role: "owner", pin: process.env.ARIA_OWNER_PIN ?? "1999" },
  { id: "demo", name: "Demo", role: "demo",  pin: process.env.ARIA_DEMO_PIN  ?? "2000" },
];

export function getUserByPin(pin: string): AriaUser | undefined {
  return USERS.find((u) => u.pin === pin);
}
