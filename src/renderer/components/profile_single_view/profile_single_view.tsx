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
  schema: any;
  entry: any;
  index: any;
  group: any;
  onEdit: any;
  onClose: any;
  onDelete: any;
}

export default function ProfileSingleView({
  schema,
  entry,
  index,
  group,
  onEdit,
  onClose,
  onDelete,
}: IProfileSingleViewProps) {
  console.log(entry);
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <SingleViewTitle {...{ group, index }} />

            <SingleViewToolbar {...{ onEdit, onClose, onDelete }} />

            <SingleViewForm {...{ schema, entry }} />

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
