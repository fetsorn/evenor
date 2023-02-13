import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import styles from "./input_upload.module.css";

interface IInputUploadProps {
  branch: string;
  value: any;
  description: any;
  onFieldRemove: any;
  onFieldChange: any;
  onFieldUpload?: any;
  onFieldUploadElectron?: any;
}

export default function InputUpload({
  branch,
  value,
  description,
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
        title={t("line.button.remove", { field: branch })}
        onClick={() => onFieldRemove(branch)}
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
