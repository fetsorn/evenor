import React from "react";
import cn from "classnames";
import styles from "./profile_single_view.module.css";
import {
  AssetView,
} from "../../../../components";
import {
  SingleViewForm,
  SingleViewTitle,
  SingleViewToolbar,
} from "./components";

export default function ProfileSingleView() {
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <SingleViewTitle />

            <SingleViewToolbar />

            <SingleViewForm />

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
