"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import {
  Field,
  FormMessage,
  inputClass,
  SubmitButton,
} from "@/components/admin/AdminUi";
import type { Station } from "@/constants/stations";
import { CLASS_NAMES } from "@/data/trains";
import { addTrainAction } from "../../../actions";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TYPES = ["Express", "Superfast", "Rajdhani", "Shatabdi", "Duronto", "Vande Bharat"];

type StopRow = {
  code: string;
  arrive: string;
  depart: string;
  day: number;
  distanceKm: number;
  platform: number;
};

const emptyStop = (day = 1, distanceKm = 0): StopRow => ({
  code: "",
  arrive: "",
  depart: "",
  day,
  distanceKm,
  platform: 1,
});

export default function TrainForm({ stations }: { stations: Station[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(addTrainAction, null);
  const [stops, setStops] = useState<StopRow[]>([emptyStop(), emptyStop()]);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message);
      router.push("/admin/trains");
    }
  }, [state, router]);

  const update = (index: number, patch: Partial<StopRow>) =>
    setStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="route" value={JSON.stringify(stops)} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Train number" hint="5 digits">
          <input name="number" required inputMode="numeric" maxLength={5} placeholder="12627" className={inputClass} />
        </Field>
        <Field label="Train name">
          <input name="name" required placeholder="Karnataka Express" className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="type" className={inputClass}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Running days</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {DAYS.map((d) => (
            <label key={d} className="flex items-center gap-1">
              <input type="checkbox" name="runningDays" value={d} defaultChecked className="accent-brand-600" />
              {d}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Classes</legend>
        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(CLASS_NAMES).map(([code, name]) => (
            <label key={code} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="classes"
                value={code}
                defaultChecked={["SL", "3A", "2A"].includes(code)}
                className="accent-brand-600"
              />
              {code} <span className="text-gray-400">({name})</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="pantry" defaultChecked className="accent-brand-600" />
        Pantry car available
      </label>

      {/* Route editor */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          Route stops (in order)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="pb-2">#</th>
                <th className="pb-2">Station</th>
                <th className="pb-2">Arrives</th>
                <th className="pb-2">Departs</th>
                <th className="pb-2">Day</th>
                <th className="pb-2">Distance km</th>
                <th className="pb-2">PF</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {stops.map((s, i) => {
                const first = i === 0;
                const last = i === stops.length - 1;
                return (
                  <tr key={i} className="align-top">
                    <td className="py-1 pr-2 pt-3 text-gray-400">{i + 1}</td>
                    <td className="py-1 pr-2">
                      <select
                        value={s.code}
                        onChange={(e) => update(i, { code: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select</option>
                        {stations.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.code} - {st.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="time"
                        disabled={first}
                        value={first ? "" : s.arrive}
                        onChange={(e) => update(i, { arrive: e.target.value })}
                        className={`${inputClass} disabled:bg-gray-50`}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="time"
                        disabled={last}
                        value={last ? "" : s.depart}
                        onChange={(e) => update(i, { depart: e.target.value })}
                        className={`${inputClass} disabled:bg-gray-50`}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={s.day}
                        onChange={(e) => update(i, { day: Number(e.target.value) })}
                        className={`${inputClass} w-16`}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="number"
                        min={0}
                        disabled={first}
                        value={first ? 0 : s.distanceKm}
                        onChange={(e) => update(i, { distanceKm: Number(e.target.value) })}
                        className={`${inputClass} w-24 disabled:bg-gray-50`}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="number"
                        min={1}
                        value={s.platform}
                        onChange={(e) => update(i, { platform: Number(e.target.value) })}
                        className={`${inputClass} w-16`}
                      />
                    </td>
                    <td className="py-1">
                      <button
                        type="button"
                        disabled={stops.length <= 2}
                        aria-label={`Remove stop ${i + 1}`}
                        onClick={() => setStops((prev) => prev.filter((_, j) => j !== i))}
                        className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => {
            const prev = stops[stops.length - 1];
            setStops([...stops, emptyStop(prev.day, prev.distanceKm + 50)]);
          }}
          className="mt-2 flex items-center gap-1 rounded-lg border border-dashed border-brand-300 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
        >
          <Plus size={14} /> Add stop
        </button>
      </div>

      <FormMessage state={state} />
      <SubmitButton pending={pending}>Save train</SubmitButton>
    </form>
  );
}
