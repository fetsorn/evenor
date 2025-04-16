import cn from "classnames";
import styles from "./profile.module.css";
import { useContext, createSignal } from "solid-js";
import {
  StoreContext,
  onRecordEdit,
  onRecordWipe,
  onRecordSave,
} from "@/store/index.js";
import { ProfileRecord } from "./components/index.js";
import { Spoiler } from "@/layout/components/index.js";

export function Profile() {
  const { store } = useContext(StoreContext);

  const [recordBackup] = createSignal(store.record);

  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: store.record === undefined },
        "profile-view__sidebar view__sidebar",
      )}
    >
      <div className={cn(styles.container, "view-sidebar__container")}>
        <div
          id="scrollcontainer"
          className={cn(styles.sticky, "view-sidebar__sticky")}
        >
          <div className={cn(styles.buttonbar, "view-sidebar__btn-bar")}>
            <a title={""} onClick={() => onRecordEdit(undefined)}>
              revert
            </a>
            <span>{/* store.record */}</span>
            <a
              title={""}
              onClick={() => onRecordSave(recordBackup(), store.record)}
            >
              save
            </a>
          </div>

          <Spoiler index="_" title={store.record._} isOpenDefault={true}>
            <ProfileRecord
              index="_"
              baseRecord={store.record}
              record={store.record}
              onRecordChange={onRecordEdit}
            />
          </Spoiler>
        </div>
      </div>
    </div>
  );
}
