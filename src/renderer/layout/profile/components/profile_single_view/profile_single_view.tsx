import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import {
  AssetView,
  Button,
  Title,
} from "@/components";
import { useStore } from "@/store";
import {
  ViewField,
} from "./components";
import styles from "./profile_single_view.module.css";

// TODO: replace with Day.js
function isDate(title: string): boolean {
  return true;
}

// TODO: replace with Day.js
function formatDate(title: string): string {
  return isDate(title) ? title : title
}

export default function ProfileSingleView() {
  const { t } = useTranslation();

  const [
    entry,
    schema,
    group,
    index,
    onEntryEdit,
    onEntryClose,
    onEntryDelete,
  ] = useStore((state) => [
    state.entry,
    state.schema,
    state.group,
    state.index,
    state.onEntryEdit,
    state.onEntryClose,
    state.onEntryDelete,
  ])

  const title = formatDate(group);

  const addedBranches = entry ? Object.keys(entry).filter((b) => b !== '|') : [];

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <Title>
              {title} {index}
            </Title>

            <div className={styles.buttonbar}>
              <Button type="button" title={t("line.button.edit")} onClick={onEntryEdit}>
                ✏️
              </Button>

              <Button type="button" title={t("line.button.delete")} onClick={onEntryDelete}>
                🗑️
              </Button>

              <Button type="button" title={t("line.button.close")} onClick={onEntryClose}>
                X
              </Button>
            </div>

            <div>
              {addedBranches.map((branch: string, index: any) => (
                <div key={index}>
                  <ViewField entry={
                    schema[branch]?.type === 'array' || schema[branch]?.type === 'object'
                      ? entry[branch]
                      : {'|': branch, [branch]: entry[branch]}
                  }/>
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
