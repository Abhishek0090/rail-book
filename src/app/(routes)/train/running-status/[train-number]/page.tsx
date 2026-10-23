import { notFound } from "next/navigation";
import TrainNumberSearch from "@/components/common/TrainNumberSearch";
import TrainRunningInfo from "@/components/common/TrainRunningInfo";
import TrainStationTimeline from "@/components/common/TrainStationTimeline";
import TrainStatusHeader from "@/components/common/TrainStatusHeader";
import { getLiveStatus, getTrain, trainOptions } from "@/data/trains";

export const dynamic = "force-dynamic";

const TrainRunningStatusPage = async ({
  params,
}: {
  params: Promise<{ "train-number": string }>;
}) => {
  const { "train-number": trainNumber } = await params;
  const train = getTrain(trainNumber);
  if (!train) notFound();

  const live = getLiveStatus(train, new Date());

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 w-full flex flex-col items-center">
      {/* HERO */}
      <section className="py-10 text-center w-full">
        <TrainNumberSearch
          heading="Train Running Status"
          buttonText="Check Train Status"
          basePath="/train/running-status"
          trains={trainOptions()}
        />
      </section>
      <div className="w-full max-w-5xl space-y-6">
        <TrainStatusHeader train={train} />
        <TrainRunningInfo
          current={live.current}
          lastUpdated={live.lastUpdated}
        />
        <TrainStationTimeline stops={live.stops} />
      </div>
    </div>
  );
};

export default TrainRunningStatusPage;
