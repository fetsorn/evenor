import React from "react";
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
  waypoint: any;
  onEdit: any;
}

export default function ProfileSingleView({
  schema,
  entry,
  index,
  waypoint,
  onEdit,
}: IProfileSingleViewProps) {
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      <div className={styles.container}>
        <div id="scrollcontainer" className={styles.sticky}>
          <SingleViewTitle {...{ waypoint, index }}></SingleViewTitle>

          <SingleViewToolbar {...{ onEdit }} />

          <SingleViewForm {...{ schema, entry, addedFields }} />

          <AssetView />
        </div>
      </div>
    </div>
  );
}
