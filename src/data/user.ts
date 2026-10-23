// Dummy signed-in user until auth and the users table are wired in.
export type SavedPassenger = {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Transgender";
  berth: string;
};

export const CURRENT_USER = {
  id: 1,
  name: "Abhishek Pal",
  email: "abhishek.pal@example.com",
  phone: "+91 98765 43210",
  irctcId: "abhishek_pal",
  city: "Mumbai",
  memberSince: "March 2024",
  walletBalance: 1250,
  savedPassengers: [
    { name: "Abhishek Pal", age: 29, gender: "Male", berth: "Lower" },
    { name: "Diya Sharma", age: 27, gender: "Female", berth: "Upper" },
    { name: "Kavya Iyer", age: 58, gender: "Female", berth: "Lower" },
  ] as SavedPassenger[],
};

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
