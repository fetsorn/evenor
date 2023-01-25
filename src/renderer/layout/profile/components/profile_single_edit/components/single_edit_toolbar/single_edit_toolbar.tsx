import React from "react";
import { Button } from "../../../../../../components";
import styles from "./single_edit_toolbar.module.css";
import { useTranslation } from "react-i18next";

interface ISingleEditToolbarProps {
  onRevert: any;
  onSave: any;
}

export default function SingleEditToolbar({
  onRevert,
  onSave,
}: ISingleEditToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.buttonbar}>
      <Button type="button" title={t("line.button.save")} onClick={onSave}>
        💾
      </Button>

      <Button type="button" title={t("line.button.revert")} onClick={onRevert}>
        ↩
      </Button>
    </div>
  );
}
