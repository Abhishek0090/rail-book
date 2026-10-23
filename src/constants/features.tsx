import {
  CheckCircle,
  ShieldCheck,
  Headphones,
  IndianRupee,
  Clock,
  MapPin,
} from "lucide-react";

export const FEATURES = [
  {
    icon: <CheckCircle className="text-brand-600" />,
    title: "Get Confirmed Train Tickets",
    desc: "With same-train alternates and confirmation predictions, improve your chances of a confirmed ticket.",
  },
  {
    icon: <ShieldCheck className="text-brand-600" />,
    title: "UPI Enabled Secured Payment",
    desc: "Payments on RailBook are secured. Pay with UPI, cards, net banking or the RailBook wallet.",
  },
  {
    icon: <Clock className="text-brand-600" />,
    title: "Free Cancellation on Train Tickets",
    desc: "Get a full refund on train tickets by opting for free cancellation.",
  },
  {
    icon: <Headphones className="text-brand-600" />,
    title: "Train Booking & Enquiry Support",
    desc: "24x7 customer support for any train enquiry or booking query.",
  },
  {
    icon: <IndianRupee className="text-brand-600" />,
    title: "Instant Refund & Cancellation",
    desc: "Get an instant refund and book your next train ticket with confidence.",
  },
  {
    icon: <MapPin className="text-brand-600" />,
    title: "Live Train Status Tracking",
    desc: "Live running status and notifications for the trains you have booked.",
  },
];
