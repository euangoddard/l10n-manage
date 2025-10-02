import { component$, $ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import { type Items } from "~/models/item";

export interface AddFileProps {
  onData$: QRL<(items: Items) => void>;
}

export const AddFile = component$<AddFileProps>((props) => {
  const handleFileChange = $(async (e: Event) => {
    // Helper to flatten JSON keys
    const flatten = (
      obj: any,
      prefix = "",
    ): { key: string; value: string }[] => {
      let result: { key: string; value: string }[] = [];
      for (const k in obj) {
        const newKey = prefix ? `${prefix}.${k}` : k;
        if (typeof obj[k] === "object" && obj[k] !== null) {
          result = result.concat(flatten(obj[k], newKey));
        } else {
          result.push({ key: newKey, value: String(obj[k]) });
        }
      }
      return result;
    };

    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const data = flatten(json);
      props.onData$(data);
    } catch (err) {
      console.error("Invalid JSON", err);
    }
  });

  return (
    <div class="hero bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Add a file</h1>
          <p class="py-6">
            Upload a JSON file to import key-value pairs. Nested keys will be
            flattened.
          </p>
          <input
            type="file"
            accept="application/json"
            class="file-input file-input-bordered file-input-primary w-full max-w-xs"
            onChange$={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
});
