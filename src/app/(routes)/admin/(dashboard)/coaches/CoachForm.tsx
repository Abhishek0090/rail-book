"use client";

import { useActionState, useState } from "react";
import {
  Field,
  FormMessage,
  inputClass,
  SubmitButton,
} from "@/components/admin/AdminUi";
import type { ClassCode } from "@/data/trains";
import { addCoachAction } from "../../actions";

type TrainOption = {
  number: string;
  name: string;
  classes: ClassCode[];
  // Next free coach code per class, e.g. { "3A": "B6" }
  nextCode: Partial<Record<ClassCode, string>>;
};

export default function CoachForm({
  trains,
  seatsPerClass,
  defaultTrain,
}: {
  trains: TrainOption[];
  seatsPerClass: Record<ClassCode, number>;
  defaultTrain?: string;
}) {
  const [state, action, pending] = useActionState(addCoachAction, null);
  const [trainNo, setTrainNo] = useState(defaultTrain ?? trains[0]?.number);
  const train = trains.find((t) => t.number === trainNo);
  const [classCode, setClassCode] = useState<ClassCode | undefined>(
    train?.classes[0],
  );
  const cls = train?.classes.includes(classCode!) ? classCode! : train?.classes[0];

  return (
    // key resets the suggested code and seat count when the selection changes
    <form action={action} className="space-y-4" key={`${trainNo}-${cls}-${state?.message}`}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Train">
          <select
            name="trainNo"
            value={trainNo}
            onChange={(e) => setTrainNo(e.target.value)}
            className={inputClass}
          >
            {trains.map((t) => (
              <option key={t.number} value={t.number}>
                {t.number} {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Class">
          <select
            name="classCode"
            value={cls}
            onChange={(e) => setClassCode(e.target.value as ClassCode)}
            className={inputClass}
          >
            {train?.classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Coach code" hint="e.g. B6, S9">
          <input
            name="code"
            required
            defaultValue={cls ? train?.nextCode[cls] : ""}
            className={`${inputClass} uppercase`}
          />
        </Field>
        <Field label="Seats">
          <input
            name="totalSeats"
            type="number"
            min={1}
            max={120}
            required
            defaultValue={cls ? seatsPerClass[cls] : 72}
            className={inputClass}
          />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending}>Add coach</SubmitButton>
    </form>
  );
}
