import { component$, $ } from "@builder.io/qwik";
import { Items } from "~/models/item";

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
interface JSONObject {
  [key: string]: JSONValue;
}
type JSONArray = JSONValue[];

export interface DownloadJsonProps {
  items: Items;
}

const unflatten = (items: Items): JSONObject => {
  const result: JSONObject = {};
  for (const { key, value } of items) {
    const keys = key.split(".");
    let current: JSONObject = result;
    keys.forEach((k: string, i: number) => {
      if (i === keys.length - 1) {
        current[k] = value;
      } else {
        if (!(k in current)) current[k] = {};
        current = current[k] as JSONObject;
      }
    });
  }
  return result;
};

export const DownloadJson = component$<DownloadJsonProps>(({ items }) => {
  const handleDownload = $(() => {
    const nested = unflatten(items);
    const json = JSON.stringify(nested, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  return (
    <button class="btn btn-primary btn-sm" onClick$={handleDownload}>
      Download JSON
    </button>
  );
});
