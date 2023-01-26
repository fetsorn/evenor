import React from "react";
import cn from "classnames";
import styles from "./profile_single_edit.module.css";
import {
  AssetView,
} from "../../../../components";
import {
  SingleEditForm,
  SingleEditTitle,
  SingleEditToolbar,
} from "./components";

export default function ProfileSingleEdit() {
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <SingleEditTitle />

            <SingleEditToolbar />

            <SingleEditForm />

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
