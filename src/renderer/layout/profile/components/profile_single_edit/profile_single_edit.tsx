import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import {
  AssetView,
  Button,
  Title,
} from "@/components";
import { useStore } from "@/store";
import { manifestRoot } from "@/../lib/git_template";
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
    group,
    index,
    isSettings,
    onEntryRevert,
    onEntrySave,
    onFieldAdd,
    onFieldRemove,
    onFieldChange,
    onFieldUpload,
    onFieldUploadElectron
  ] = useStore((state) => [
    state.entry,
    state.group,
    state.index,
    state.isSettings,
    state.onEntryRevert,
    state.onEntrySave,
    state.onFieldAdd,
    state.onFieldRemove,
    state.onFieldChange,
    state.onFieldUpload,
    state.onFieldUploadElectron
  ])

  const schema = isSettings ? JSON.parse(manifestRoot) : useStore((state) => state.schema);

  const addedBranches = entry ? Object.keys(entry).filter((b) => b !== '|') : [];

  // list all missing entry fields
  // in case the field is array, list all its items
  const notAddedBranches = entry
    ? Object.keys(schema).filter((branch: any) => {
      const { trunk } = schema[branch];

      const isEntryLeaf = trunk === entry['|'] || branch === entry['|'];

      const isEntryField = Object.prototype.hasOwnProperty.call(
        entry,
        branch
      );

      const isArray = schema[branch]?.type === "array";

      const trunkIsLeaf = schema[trunk]?.trunk === entry['|'];

      const isArrayItem = schema[trunk]?.type === "array";

      return (isEntryLeaf && !isEntryField && !isArray) || (trunkIsLeaf && isArrayItem);
    })
    : [];

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
              {addedBranches.map((branch: any, index: any) => (
                <div key={index}>
                  <EditInput
                    {...{
                      schema,
                      onFieldChange,
                      onFieldRemove,
                      onFieldUpload,
                      onFieldUploadElectron,
                      onFieldAdd,
                      notAddedFields: notAddedBranches,
                    }}
                    entry={
                      schema[branch]?.type === 'array' || schema[branch]?.type === 'object'
                        ? entry[branch]
                        : {'|': branch, [branch]: entry[branch]}
                    }
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
