import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import styles from "./input_upload.module.css";

export default function InputUpload({
  branch,
  value,
  onFieldChange,
  onFieldUpload,
  onFieldUploadElectron,
}) {
  const { t } = useTranslation();

  return (
    <div>
      {__BUILD_MODE__ === "electron" ? (
        <div>
          <input
            className={styles.input}
            type="text"
            value={value}
            onChange={(e) => onFieldChange(branch, e.target.value)}
          />
          <Button type="button" onClick={() => onFieldUploadElectron(branch)}>
            {t("line.button.upload")}
          </Button>
        </div>
      ) : (
        <input
          type="file"
          onChange={(e) => onFieldUpload(branch, e.target.files[0])}
        />
      )}
    </div>
  );
}
