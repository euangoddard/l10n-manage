import { component$, $ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";

export interface EditValueProps {
  keyName: string;
  value: string;
  onChange$: QRL<(newValue: string) => void>;
}

export const EditValue = component$<EditValueProps>(
  ({ keyName, value, onChange$ }) => {
    const handleInput = $((e: Event) => {
      const newValue = (e.target as HTMLInputElement).value;
      onChange$(newValue);
    });

    return (
      <>
        <span class="badge badge-soft badge-secondary badge-sm font-mono">
          {keyName}
        </span>
        <input
          type="text"
          class="input input-bordered w-full"
          value={value}
          onInput$={handleInput}
        />
      </>
    );
  },
);
