import Link from "next/link";
import { Mail, MapPin, Phone, User, Wallet } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getBookings, isUpcoming } from "@/data/bookings";
import { CURRENT_USER } from "@/data/user";

export const metadata = { title: "Profile" };

const ProfilePage = () => {
  const user = CURRENT_USER;
  const bookings = getBookings();
  const upcoming = bookings.filter((b) => isUpcoming(b)).length;

  const details = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Mobile", value: user.phone },
    { icon: User, label: "IRCTC ID", value: user.irctcId },
    { icon: MapPin, label: "City", value: user.city },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-gradient-dark p-6 text-white sm:flex-row">
          <Avatar size={72} />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <p className="text-sm text-white/75">
              Member since {user.memberSince}
            </p>
          </div>
          <div className="flex gap-6 sm:ml-auto">
            <Stat label="Bookings" value={bookings.length} />
            <Stat label="Upcoming" value={upcoming} />
            <Stat label="Wallet" value={`Rs ${user.walletBalance}`} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal details */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Personal Details</h2>
            <dl className="space-y-4">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon size={16} />
                  </span>
                  <div>
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Saved passengers */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Saved Passengers</h2>
            <ul className="divide-y">
              {user.savedPassengers.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500">
                    {p.age} - {p.gender} - {p.berth} berth
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/booking/trips"
            className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            View My Trips
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-brand-200 bg-white px-5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            Dashboard
          </Link>
          <span className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm text-gray-600">
            <Wallet size={16} /> Wallet balance Rs {user.walletBalance}
          </span>
        </div>
      </div>
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

export default ProfilePage;
