import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import styles from "./profile_single_view.module.css";
import {
  AssetView,
  Button,
  Title,
} from "../../../../components";
import {
  ViewField,
} from "./components";
import { useStore } from "../../../../store";
import { useParams } from "react-router-dom";
import { dispenserUpdate } from "../../../../api";

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

  const { repoRoute } = useParams();

  const [
    entry,
    schema,
    group,
    index,
    onEntryEdit,
    onEntryClose,
    onEntryDelete
  ] = useStore((state) => [
    state.entry,
    state.schema,
    state.group,
    state.index,
    state.onEntryEdit,
    state.onEntryClose,
    state.onEntryDelete
  ])

  const title = formatDate(group);

  const addedFields = useMemo(() => (entry ? Object.keys(entry) : []), [entry]);

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
              {true && (
                <a onClick={() => dispenserUpdate(repoRoute, schema, "export_root", entry)}>🔄</a>
              ) }

              {addedFields.map((label: string, index: any) => (
                <div key={index}>
                  <ViewField {...{ schema, label }} value={entry[label]} />
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
