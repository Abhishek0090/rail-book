"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Check, Trash2, X } from "lucide-react";
import type { PublicUser } from "@/data/user";
import { encodePassenger } from "../passengers";

export type Trip = {
  trainNo: string;
  trainName: string;
  classCode: string;
  className: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  departTime: string;
  date: string; // yyyy-MM-dd
};

type Passenger = {
  name: string;
  age: string;
  gender: string;
  berth: string;
  nationality: string;
};

const MAX_PASSENGERS = 6;

export default function PassengerForm({
  trip,
  user,
}: {
  trip: Trip;
  user: PublicUser;
}) {
  const router = useRouter();
  const { trainNo, classCode, fromCode, toCode, date } = trip;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);

  const isAdded = (name: string) => passengers.some((p) => p.name === name);

  const addPassenger = (passenger: Passenger) => {
    if (passengers.length >= MAX_PASSENGERS) {
      toast.error(`You can add up to ${MAX_PASSENGERS} passengers`);
      return;
    }
    setPassengers((prev) => [...prev, passenger]);
    setIsModalOpen(false);
  };

  const proceed = () => {
    if (passengers.length === 0) {
      toast.error("Add at least one passenger");
      return;
    }
    const next = new URLSearchParams({
      train: trainNo,
      cls: classCode,
      from: fromCode,
      to: toCode,
      date,
      pax: String(passengers.length),
    });
    passengers.forEach((p) => next.append("p", encodePassenger(p)));
    router.push(`/booking/passenger-details/summary?${next}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* Two columns on large screens: passengers left, journey + pay right */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="rounded-xl bg-brand-gradient-dark p-4 text-white">
          <h1 className="text-lg font-semibold">
            {trainNo} {trip.trainName.toUpperCase()}
          </h1>
          <p className="text-xs text-white/75">
            {classCode} ({trip.className}) - GN -{" "}
            {format(parseISO(date), "EEE, dd MMM")}
          </p>
        </div>

        {/* Select Passengers */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-medium">Select Passengers</h2>
            <span className="text-xs text-gray-500">
              {passengers.length}/{MAX_PASSENGERS} Selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.savedPassengers.map((p) => (
              <button
                key={p.name}
                disabled={isAdded(p.name)}
                onClick={() =>
                  addPassenger({
                    name: p.name,
                    age: String(p.age),
                    gender: p.gender,
                    berth: p.berth,
                    nationality: "India",
                  })
                }
                className="flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50 disabled:border-brand-600 disabled:bg-brand-gradient disabled:text-white"
              >
                {isAdded(p.name) && <Check size={12} />}
                {p.name}
              </button>
            ))}
          </div>

          {passengers.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between border rounded-lg p-2 text-sm"
            >
              <span>
                {p.name}, {p.age}, {p.gender}, {p.berth}
              </span>
              <button
                aria-label={`Remove ${p.name}`}
                onClick={() =>
                  setPassengers((prev) => prev.filter((_, j) => j !== i))
                }
                className="text-gray-400 hover:text-rose-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full border border-dashed border-brand-400 text-brand-700 py-2 rounded-lg hover:bg-brand-50"
          >
            + Add New Passenger
          </button>
        </section>

        {/* Contact Details */}
        <section className="space-y-2">
          <h2 className="font-medium">Contact Details</h2>
          <input
            className="w-full border rounded-lg p-2 text-sm outline-none focus:border-brand-500"
            placeholder="+91 Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full border rounded-lg p-2 text-sm outline-none focus:border-brand-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </section>
      </div>

      <aside className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
        {/* Journey */}
        <section className="space-y-2">
          <h2 className="font-medium">Journey</h2>
          <div className="flex items-center justify-between rounded-lg bg-brand-50 p-3 text-sm">
            <div>
              <p className="font-semibold">{fromCode}</p>
              <p className="text-xs text-gray-500">{trip.departTime}</p>
            </div>
            <span className="text-xs text-gray-400">
              {format(parseISO(date), "EEE, dd MMM")}
            </span>
            <div className="text-right">
              <p className="font-semibold">{toCode}</p>
              <p className="text-xs text-gray-500">{trip.toName}</p>
            </div>
          </div>
        </section>

        {/* IRCTC ID */}
        <section className="space-y-2">
          <h2 className="font-medium">Your IRCTC ID</h2>
          <div className="flex justify-between items-center border rounded-lg p-2">
            <span className="text-sm">{user.irctcId}</span>
            <button className="text-brand-600 text-sm">Change</button>
          </div>
        </section>

        {/* Boarding Station */}
        <section className="space-y-2">
          <h2 className="font-medium">Boarding Station</h2>
          <div className="border rounded-lg p-2 text-sm">
            {fromCode} - {trip.fromName} ({format(parseISO(date), "dd MMM")},{" "}
            {trip.departTime})
          </div>
          <p className="text-xs bg-amber-50 text-amber-800 p-2 rounded">
            You are booking this train from {trip.fromName} to {trip.toName}
          </p>
        </section>

        {/* Auto Upgradation */}
        <section className="space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 accent-brand-600"
            />
            <span>
              <span className="font-medium">Consider for auto upgradation</span>
              <p className="text-xs text-gray-500 mt-1">
                By clicking on &apos;Proceed to Pay&apos;, I confirm that I have
                read, understood and agree with the{" "}
                <span className="text-brand-600">
                  Cancellation & Refund Policy
                </span>
                , <span className="text-brand-600">Privacy Policy</span> and{" "}
                <span className="text-brand-600">Terms of Use</span>.
              </p>
            </span>
          </label>
        </section>

        {/* Proceed */}
        <button
          onClick={proceed}
          className="block w-full bg-brand-gradient text-center text-white py-3 rounded-xl font-medium hover:brightness-110"
        >
          Proceed to Pay ({passengers.length} passenger
          {passengers.length === 1 ? "" : "s"})
        </button>
      </aside>
      </div>

      {isModalOpen && (
        <AddPassengerModal
          onClose={() => setIsModalOpen(false)}
          onSave={addPassenger}
        />
      )}
    </div>
  );
}

function AddPassengerModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (passenger: Passenger) => void;
}) {
  const [form, setForm] = useState<Passenger>({
    name: "",
    age: "",
    gender: "Male",
    berth: "No Preference",
    nationality: "India",
  });

  const save = () => {
    const age = Number(form.age);
    if (form.name.trim().length < 3) {
      toast.error("Enter the full name as per Govt. ID");
      return;
    }
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      toast.error("Enter a valid age");
      return;
    }
    onSave({ ...form, name: form.name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center sm:items-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Add New Passenger</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <input
          className="w-full border rounded-lg p-2 text-sm outline-none focus:border-brand-500"
          placeholder="Full name as per Govt. ID"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border rounded-lg p-2 text-sm outline-none focus:border-brand-500"
          placeholder="Age"
          type="number"
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        {/* Gender */}
        <div className="flex gap-4 text-sm">
          {["Male", "Female", "Transgender"].map((g) => (
            <label key={g} className="flex items-center gap-1">
              <input
                type="radio"
                className="accent-brand-600"
                checked={form.gender === g}
                onChange={() => setForm({ ...form, gender: g })}
              />
              {g}
            </label>
          ))}
        </div>

        <select
          className="w-full border rounded-lg p-2 text-sm"
          onChange={(e) => setForm({ ...form, berth: e.target.value })}
        >
          <option>No Preference</option>
          <option>Lower</option>
          <option>Middle</option>
          <option>Upper</option>
          <option>Side Lower</option>
          <option>Side Upper</option>
        </select>

        <select
          className="w-full border rounded-lg p-2 text-sm"
          onChange={(e) => setForm({ ...form, nationality: e.target.value })}
        >
          <option>India</option>
          <option>Other</option>
        </select>

        <p className="text-xs bg-gray-100 p-2 rounded">
          No concessions are allowed in this train
        </p>

        <button
          onClick={save}
          className="w-full bg-brand-gradient text-white py-2 rounded-lg hover:brightness-110"
        >
          Save Passenger
        </button>
      </div>
    </div>
  );
}
