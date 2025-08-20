import { getFilterQueries, getFilterOptions } from "@/store/index.js";
import { useContext } from "solid-js";
import { StoreContext, onSearchBar, getSearchBar } from "@/store/index.js";
import { Spoiler } from "@/layout/components/index.js";
import styles from "./overview_filter.module.css";

export function OverviewFilter() {
  const { store } = useContext(StoreContext);

  return (
    <>
      <input value={getSearchBar(store.searchParams)} />

      <button
        onClick={async (event) => {
          await onSearchBar(event.currentTarget.value);
        }}
      >
        search
      </button>
    </>
  );
}
