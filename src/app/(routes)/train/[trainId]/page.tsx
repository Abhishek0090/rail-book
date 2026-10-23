import { notFound, redirect } from "next/navigation";
import { getTrain } from "@/data/trains";

// /train/12951 -> that train's schedule.
export default async function TrainPage({
  params,
}: {
  params: Promise<{ trainId: string }>;
}) {
  const { trainId } = await params;
  if (!getTrain(trainId)) notFound();
  redirect(`/train/schedule/${trainId}`);
}
