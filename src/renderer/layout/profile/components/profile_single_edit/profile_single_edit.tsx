import React from "react";
import cn from "classnames";
import styles from "./profile_single_edit.module.css";
import {
  AssetView,
} from "../../../../components";
import {
  SingleEditToolbar,
  SingleEditTitle,
  SingleEditForm,
} from "./components";

interface IProfileSingleEditProps {
  schema: any;
  group: any;
  entry: any;
  index: any;
  onSave: any;
  onRevert: any;
  onAddProp: any;
  onInputChange: any;
  onInputRemove: any;
  onInputUpload: any;
  onInputUploadElectron: any;
}

export default function ProfileSingleEdit({
  schema,
  group,
  entry,
  index,
  onSave,
  onRevert,
  onAddProp,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
}: IProfileSingleEditProps) {
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <SingleEditTitle {...{ group, index }} />

            <SingleEditToolbar {...{ onRevert, onSave }} />

            <SingleEditForm
              {...{
                schema,
                entry,
                onInputChange,
                onInputRemove,
                onInputUpload,
                onInputUploadElectron,
                onAddProp,
              }}
            />

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
