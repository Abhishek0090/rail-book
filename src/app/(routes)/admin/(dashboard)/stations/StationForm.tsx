"use client";

import { useActionState } from "react";
import {
  Field,
  FormMessage,
  inputClass,
  SubmitButton,
  useResetOnSuccess,
} from "@/components/admin/AdminUi";
import { addStationAction } from "../../actions";

export default function StationForm() {
  const [state, action, pending] = useActionState(addStationAction, null);
  const ref = useResetOnSuccess(state);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Code" hint="2-5 letters">
          <input name="code" required maxLength={5} placeholder="PUNE" className={`${inputClass} uppercase`} />
        </Field>
        <Field label="Station name">
          <input name="name" required placeholder="Pune Jn" className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required placeholder="Pune" className={inputClass} />
        </Field>
        <Field label="State">
          <input name="state" required placeholder="Maharashtra" className={inputClass} />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending={pending}>Add station</SubmitButton>
    </form>
  );
}
