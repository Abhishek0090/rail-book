import FeaturesCard from "@/components/common/FeaturesCard";
import { FEATURES } from "@/constants/features";
import { getBookings } from "@/data/bookings";
import PnrSearch from "./PnrSearch";

export const metadata = { title: "PNR Status" };

const PNRPage = () => {
  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      {/* HERO */}
      <section className="py-20 text-center">
        <PnrSearch
          samples={getBookings()
            .slice(0, 3)
            .map((b) => b.pnr)}
        />
      </section>

      {/* WHY BOOK */}
      <section className="bg-white py-16">
        <FeaturesCard
          heading="#1 Platform to check PNR Status & Train Ticket booking"
          features={FEATURES}
        />
      </section>
    </div>
  );
};

export default PNRPage;
