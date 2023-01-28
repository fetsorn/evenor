import React, { useMemo } from "react";
import cn from "classnames";
import { useParams } from "react-router-dom";
import styles from "./profile_single_edit.module.css";
import {
  AssetView,
  Button,
  Title,
} from "../../../../components";
import {
  EditInput,
} from "./components";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../../store";

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

  const { repoRoute } = useParams();

  const entry = useStore((state) => state.entry)

  const schema = useStore((state) => state.schema)

  const group = useStore((state) => state.group)

  const index = useStore((state) => state.index)

  const onRevert = useStore((state) => state.onRevert)

  const onSave = useStore((state) => state.onSave)

  const onAddProp = useStore((state) => state.onAddProp)

  const onInputUpload = useStore((state) => state.onInputUpload)

  const onInputUploadElectron = useStore((state) => state.onInputUploadElectron)

  const onInputRemove = useStore((state) => state.onInputRemove)

  const onInputChange = useStore((state) => state.onInputChange)

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
              <Button type="button" title={t("line.button.save")} onClick={() => onSave(repoRoute)}>
                💾
              </Button>

              <Button type="button" title={t("line.button.revert")} onClick={onRevert}>
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
                      onInputChange,
                      onInputRemove,
                      onInputUpload,
                      onInputUploadElectron,
                      onAddProp,
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
