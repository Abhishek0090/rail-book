import FeaturesCard from "@/components/common/FeaturesCard";
import TrainNumberSearch from "@/components/common/TrainNumberSearch";
import { FEATURES } from "@/constants/features";
import { trainOptions } from "@/data/trains";

const TrainSchedulePage = () => {
  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      {/* HERO */}
      <section className="py-20 text-center">
        <TrainNumberSearch
          heading="Train Schedule | Train Time Table"
          buttonText="Check Train Schedule"
          basePath="/train/schedule"
          trains={trainOptions()}
        />
      </section>

      {/* WHY BOOK */}
      <section className="bg-white py-16">
        <FeaturesCard
          heading="Why Book Train Tickets With RailBook?"
          features={FEATURES}
        />
      </section>
    </div>
  );
};

export default TrainSchedulePage;
