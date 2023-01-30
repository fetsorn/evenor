import React, { useMemo } from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import {
  AssetView,
  Button,
  Title,
} from "@/components";
import { useStore } from "@/store";
import {
  EditInput,
} from "./components";
import styles from "./profile_single_edit.module.css";

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return isDate(title) ? title : title
}

export default function ProfileSingleEdit() {
  const { t } = useTranslation();

  const [
    entry,
    schema,
    group,
    index,
    onEntryRevert,
    onEntrySave,
    onFieldAdd,
    onFieldRemove,
    onFieldChange,
    onFieldUpload,
    onFieldUploadElectron
  ] = useStore((state) => [
    state.entry,
    state.schema,
    state.group,
    state.index,
    state.onEntryRevert,
    state.onEntrySave,
    state.onFieldAdd,
    state.onFieldRemove,
    state.onFieldChange,
    state.onFieldUpload,
    state.onFieldUploadElectron
  ])

  const addedFields = useMemo(() => (entry ? Object.keys(entry) : []), [entry]);

  // always list array items
  // list schema props that are not in the entry
  // never list arrays or object fields
  const notAddedFields = useMemo(
    () =>
      entry
        ? Object.keys(schema).filter((prop: any) => {
          return (
            schema[schema[prop].trunk]?.type === "array" ||
              (!Object.prototype.hasOwnProperty.call(
                entry,
                schema[prop].label
              ) &&
                schema[prop].type !== "array" &&
                schema[schema[prop].trunk]?.type !== "object")
          );
        })
        : [],
    [entry]
  );

  const title = formatDate(group);

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <Title>
              {title} {index}
            </Title>

            <div className={styles.buttonbar}>
              <Button type="button" title={t("line.button.save")} onClick={() => onEntrySave()}>
                💾
              </Button>

              <Button type="button" title={t("line.button.revert")} onClick={onEntryRevert}>
                ↩
              </Button>
            </div>

            <div>
              {addedFields.map((label: any, index: any) => (
                <div key={index}>
                  <EditInput
                    {...{
                      schema,
                      label,
                      onFieldChange,
                      onFieldRemove,
                      onFieldUpload,
                      onFieldUploadElectron,
                      onFieldAdd,
                      notAddedFields,
                    }}
                    value={entry[label]}
                  />
                </div>
              ))}
            </div>

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
