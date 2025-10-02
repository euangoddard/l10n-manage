import {
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
  useComputed$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { AddFile } from "~/components/add-file/add-file";
import { EditValue } from "~/components/edit-value";
import { DownloadJson } from "~/components/download-json";
import type { Item, Items } from "~/models/item";

export default component$(() => {
  const LOCAL_STORAGE_KEY = "items";
  const items = useSignal<Items>([]);
  const loading = useSignal(true);

  // Computed signal for grouping items by top-level key
  const groupedItems = useComputed$(() => {
    const groups: Record<string, Item[]> = {};
    items.value.forEach((item) => {
      const topKey = item.key.split(".")[0];
      if (!groups[topKey]) groups[topKey] = [];
      groups[topKey].push(item);
    });
    return groups;
  });

  // Computed signal for human-readable top-level keys
  const humanReadableTopKeys = useComputed$(() => {
    return Object.keys(groupedItems.value).map((key) => ({
      key,
      label: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " "),
    }));
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    items.value = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]");
    loading.value = false;
  });

  useTask$(({ track }) => {
    const changedItems = track(() => items.value);
    if (globalThis?.localStorage !== undefined && changedItems) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(changedItems));
    }
  });

  return (
    <div class="mx-auto min-h-screen max-w-5xl p-8">
      {loading.value ? (
        <div class="flex h-screen items-center justify-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      ) : items.value.length === 0 ? (
        <AddFile onData$={(data) => (items.value = data)} />
      ) : (
        <>
          <header class="bg-base-100 sticky top-0 z-10 mb-6 flex items-center justify-between py-4">
            <span class="flex items-center">
              <h2 class="text-lg font-medium">
                Editing: {items.value.length} items
              </h2>
              <button
                class="btn btn-sm btn-error ml-2"
                onClick$={() => {
                  if (
                    confirm(
                      "Are you sure you want to clear all items? This cannot be undone.",
                    )
                  ) {
                    items.value = [];
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                  }
                }}
              >
                Clear
              </button>
            </span>

            <select
              class="select select-sm select-bordered w-auto"
              onChange$={(e) => {
                const key = (e.target as HTMLSelectElement).value;
                const el = document.getElementById(`section-${key}`);
                if (el)
                  el.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                  });
              }}
            >
              <option value="" disabled>
                Jump to section
              </option>
              {humanReadableTopKeys.value.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <DownloadJson items={items.value} />
          </header>
          <div class="mb-4 grid grid-cols-[auto_1fr] gap-4">
            {Object.entries(groupedItems.value)
              .map(([topKey, group]) => {
                const label =
                  humanReadableTopKeys.value.find((tk) => tk.key === topKey)
                    ?.label ?? topKey;
                return [
                  <hr
                    class="invisible"
                    id={`section-${topKey}`}
                    key={topKey + "-divider"}
                  />,
                  <div
                    key={topKey + "-header"}
                    class="bg-base-200 border-base-300 sticky top-16 z-10 col-span-2 border-b px-4 py-2 font-medium"
                  >
                    {label}
                  </div>,
                  ...group.map((item) => (
                    <EditValue
                      key={item.key}
                      keyName={item.key}
                      value={item.value}
                      onChange$={(newValue) => {
                        const itemIdx = items.value.findIndex(
                          (i) => i.key === item.key,
                        );
                        items.value[itemIdx].value = newValue;
                        items.value = [...items.value];
                      }}
                    />
                  )),
                ];
              })
              .flat()}
          </div>
        </>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "l10n string manager",
  meta: [
    {
      name: "description",
      content: "l10n string manager",
    },
  ],
};
