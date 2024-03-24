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
    entry,
    group,
    index,
    repoUUID,
    setRepoName,
    onEntryEdit,
    onEntryClose,
    onEntryDelete,
    // onEntryCommit,
    isSettings,
    schemaRepo,
  ] = useStore((state) => [
    state.entry,
    state.group,
    state.index,
    state.repoUUID,
    state.setRepoName,
    state.onEntryEdit,
    state.onEntryClose,
    state.onEntryDelete,
    // state.onEntryCommit,
    state.isSettings,
    state.schema,
  ]);

  const title = formatDate(group);

  const schema = isSettings ? schemaRoot : schemaRepo;
  return (
    <div
      className={cn(
        styles.sidebar,
        { [styles.invisible]: !entry },
        "profile-view__sidebar view__sidebar",
      )}
    >
      {entry && (
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
                onClick={onEntryEdit}
              >
                ✏️
              </Button>

              {/* {(isSettings || repoUUID === 'root') && ( */}
              {/*   <Button type="button" title={t('line.button.commit')} onClick={() => onEntryCommit(entry.UUID)}> */}
              {/*     ⬆️ */}
              {/*   </Button> */}
              {/* )} */}

              <Button
                type="button"
                title={t("line.button.delete")}
                onClick={onEntryDelete}
              >
                🗑️
              </Button>

              <Button
                type="button"
                title={t("line.button.close")}
                onClick={onEntryClose}
              >
                X
              </Button>
            </div>

            {repoUUID === "root" && __BUILD_MODE__ !== "server" && (
              <button
                type="button"
                title={t("line.button.open")}
                onClick={() => setRepoName(entry.reponame)}
              >
                {t("line.button.open")}
              </button>
            )}
            <ViewField
              {...{
                entry,
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
