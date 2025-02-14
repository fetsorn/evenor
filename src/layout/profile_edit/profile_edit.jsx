import cn from "classnames";
import { useContext } from "solid-js";
import { StoreContext } from "@/store.js";
import styles from "./profile_edit.module.css";

export function ProfileEdit() {
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
          profile
        </div>
      </div>
    </div>
  );
}
