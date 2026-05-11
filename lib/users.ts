export type UserRole = "owner" | "demo";

export interface AriaUser {
  id:   string;
  name: string;
  role: UserRole;
  pin:  string;
}

export const USERS: AriaUser[] = [
  { id: "raph",  name: "Raph",  role: "owner", pin: "1999" },
  { id: "demo",  name: "Demo",  role: "demo",  pin: "2000" },
];

export function getUserByPin(pin: string): AriaUser | undefined {
  return USERS.find((u) => u.pin === pin);
}
