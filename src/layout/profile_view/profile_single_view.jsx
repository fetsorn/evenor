import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { schemaRoot } from "../../api/index.js";
import { Button, Title } from "../../components/index.js";
import { useStore } from "../../store/index.js";
import { ViewField } from "./components/index.js";
import styles from "./profile_single_view.module.css";

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return isDate(title) ? title : title;
}

export function ProfileSingleView() {
  const { t } = useTranslation();

  const [
    record,
    group,
    index,
    repoUUID,
    setRepoName,
    onRecordEdit,
    onRecordClose,
    onRecordDelete,
    // onRecordCommit,
    isSettings,
    schemaRepo,
  ] = useStore((state) => [
    state.record,
    state.group,
    state.index,
    state.repoUUID,
    state.setRepoName,
    state.onRecordEdit,
    state.onRecordClose,
    state.onRecordDelete,
    // state.onRecordCommit,
    state.isSettings,
    state.schema,
  ]);

  const title = formatDate(group);

  const schema = isSettings ? schemaRoot : schemaRepo;
  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !record },
        "profile-view__sidebar view__sidebar",
      )}
    >
      {record && (
        <div className={cn(styles.container, "view-sidebar__container")}>
          <div
            id="scrollcontainer"
            className={cn(styles.sticky, "view-sidebar__sticky")}
          >
            <Title>
              {title} {index}
            </Title>

            <div className={cn(styles.buttonbar, "view-sidebar__btn-bar")}>
              <Button
                type="button"
                title={t("line.button.edit")}
                onClick={() => onRecordEdit(record)}
              >
                ✏️
              </Button>

              {/* {(isSettings || repoUUID === 'root') && ( */}
              {/*   <Button type="button" title={t('line.button.commit')} onClick={() => onRecordCommit(record.UUID)}> */}
              {/*     ⬆️ */}
              {/*   </Button> */}
              {/* )} */}

              <Button
                type="button"
                title={t("line.button.delete")}
                onClick={onRecordDelete}
              >
                🗑️
              </Button>

              <Button
                type="button"
                title={t("line.button.close")}
                onClick={onRecordClose}
              >
                X
              </Button>
            </div>

            {repoUUID === "root" && __BUILD_MODE__ !== "server" && (
              <button
                type="button"
                title={t("line.button.open")}
                onClick={() => setRepoName(record.reponame)}
              >
                {t("line.button.open")}
              </button>
            )}
            <ViewField
              {...{
                record,
                schema,
                isBaseObject: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
