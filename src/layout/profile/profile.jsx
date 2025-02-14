import cn from "classnames";
import styles from "./profile.module.css";
import { useContext } from "solid-js";
import { StoreContext } from "@/store.js";
import {
  EditBar,
  EditRecord,
  ViewBar,
  ViewRecord,
} from "./components/index.js";

export function Profile() {
  const { store } = useContext(StoreContext);

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !store.record },
        "profile-view__sidebar view__sidebar",
      )}
    >
      <div className={cn(styles.container, "view-sidebar__container")}>
        <div
          id="scrollcontainer"
          className={cn(styles.sticky, "view-sidebar__sticky")}
        >
          <div className={cn(styles.buttonbar, "view-sidebar__btn-bar")}>
            {store.isEdit ? <EditBar /> : <ViewBar />}
          </div>

          {store.isEdit ? <EditRecord /> : <ViewRecord />}
        </div>
      </div>
    </div>
  );
}
