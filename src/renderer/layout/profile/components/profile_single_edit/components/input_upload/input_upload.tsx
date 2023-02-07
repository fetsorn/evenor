import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import styles from "./input_upload.module.css";

interface IInputUploadProps {
  label: any;
  description: any;
  value: any;
  onFieldRemove: any;
  onFieldChange: any;
  onFieldUpload?: any;
  onFieldUploadElectron?: any;
}

export default function InputUpload({
  label,
  description,
  value,
  onFieldRemove,
  onFieldChange,
  onFieldUpload,
  onFieldUploadElectron,
}: IInputUploadProps) {
  const { t } = useTranslation();

  return (
    <div>
      {description}
      <button
        title={t("line.button.remove", { field: label })}
        onClick={() => onFieldRemove(label)}
      >
          X
      </button>
      <br />
      {__BUILD_MODE__ === "electron" ? (
        <div>
          <input
            className={styles.input}
            type="text"
            value={value}
            onChange={(e) => onFieldChange(label, e.target.value)}
          />
          <Button type="button" onClick={() => onFieldUploadElectron(label)}>
            {t("line.button.upload")}
          </Button>
        </div>
      ) : (
        <input
          type="file"
          onChange={(e) => onFieldUpload(label, e.target.files[0])}
        />
      )}
    </div>
  );
}
