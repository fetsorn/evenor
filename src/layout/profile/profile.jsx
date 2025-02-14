import cn from "classnames";
import styles from "./profile.module.css";
import { useContext } from "solid-js";
import { StoreContext } from "@/store.js";

export function ProfileView() {
  return <div>profile view</div>;
}

export function ProfileEdit() {
  return <div>profile view</div>;
}

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
          {store.isEdit ? <ProfileEdit /> : <ProfileView />}
        </div>
      </div>
    </div>
  );
}
