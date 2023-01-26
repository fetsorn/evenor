import React from "react";
import { Button } from "../../../../../../components";
import styles from "./single_edit_toolbar.module.css";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../../../../store";

export default function SingleEditToolbar() {
  const { t } = useTranslation();

  const onRevert = useStore((state) => state.onRevert)

  const onSave = useStore((state) => state.onSave)

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
