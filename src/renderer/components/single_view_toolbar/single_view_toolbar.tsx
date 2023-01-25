import React from "react";
import { Button } from "..";
import styles from "./single_view_toolbar.module.css";
import { useTranslation } from "react-i18next";

interface ISingleViewToolbarProps {
  onEdit: any;
  onClose: any;
  onDelete: any;
}

export default function SingleViewToolbar({
  onEdit,
  onClose,
  onDelete,
}: ISingleViewToolbarProps) {
  const { t } = useTranslation();

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
