import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-8 pb-24 text-sm sm:pb-8 text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="font-semibold text-gray-800">RailBook</span> - train
          tickets, PNR and live status in one place.
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="hover:text-brand-700">
            Dashboard
          </Link>
          <Link href="/booking/trips" className="hover:text-brand-700">
            My Trips
          </Link>
          <Link href="/admin" className="hover:text-brand-700">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
