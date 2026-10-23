import FeaturesCard from "@/components/common/FeaturesCard";
import TrainNumberSearch from "@/components/common/TrainNumberSearch";
import { FEATURES } from "@/constants/features";
import { trainOptions } from "@/data/trains";

const TrainRunningPage = () => {
  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      {/* HERO */}
      <section className="py-20 text-center">
        <TrainNumberSearch
          heading="Train Running Status"
          buttonText="Check Train Status"
          basePath="/train/running-status"
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

export default TrainRunningPage;
