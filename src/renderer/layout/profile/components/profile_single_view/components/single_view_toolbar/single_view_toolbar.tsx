import React from "react";
import { Button } from "../../../../../../components";
import styles from "./single_view_toolbar.module.css";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../../../../store";

export default function SingleViewToolbar() {
  const { t } = useTranslation();

  const onEdit = useStore((state) => state.onEdit)

  const onClose = useStore((state) => state.onClose)

  const onDelete = useStore((state) => state.onDelete)

  return (
    <div className={styles.buttonbar}>
      <Button type="button" title={t("line.button.edit")} onClick={onEdit}>
        ✏️
      </Button>

      <Button type="button" title={t("line.button.delete")} onClick={onDelete}>
        🗑️
      </Button>

      <Button type="button" title={t("line.button.close")} onClick={onClose}>
        X
      </Button>
    </div>
  );
}
