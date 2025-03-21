import { useContext } from "solid-js";
import { StoreContext } from "@/store/index.js";
import { onRepoChange, onRecordEdit } from "@/store/index.js";
import { OverviewFilter, OverviewList } from "./components/index.js";
import styles from "./overview.module.css";

export function Overview() {
  const { store } = useContext(StoreContext);

  return (
    <div className={styles.overview}>
      <div className={styles.button_bar}>
        {store.repo.repo === "root" ? (
          <span></span>
        ) : (
          <a onClick={() => onRepoChange("root")}>back</a>
        )}

        <a onClick={() => onRecordEdit(undefined)}>add</a>
      </div>

      <OverviewFilter />

      <OverviewList />
    </div>
  );
}
