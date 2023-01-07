import React from "react";
import cn from "classnames";
import styles from "./profile_single_view.module.css";
import {
  AssetView,
  SingleViewTitle,
  SingleViewToolbar,
  SingleViewForm,
} from "..";

interface IProfileSingleViewProps {
  entry: any;
  index: any;
  group: any;
  onEdit: any;
}

export default function ProfileSingleView({
  entry,
  index,
  group,
  onEdit,
}: IProfileSingleViewProps) {
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      <div className={styles.container}>
        <div id="scrollcontainer" className={styles.sticky}>
          <SingleViewTitle {...{ group, index }}></SingleViewTitle>

          <SingleViewToolbar {...{ onEdit }} />

          <SingleViewForm {...{ entry }} />

          <AssetView filepath={entry?.FILE_PATH} />
        </div>
      </div>
    </div>
  );
}
