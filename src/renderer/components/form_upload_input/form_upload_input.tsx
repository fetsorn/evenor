import { useTranslation } from "react-i18next";
import { Button } from "..";

interface IFormUploadInputProps {
  key?: any;
  description?: any;
  label?: any;
  onInputUpload?: any;
  onInputUploadElectron?: any;
}

export default function FormUploadInput({
  key,
  label,
  description,
  onInputUpload,
  onInputUploadElectron,
}: IFormUploadInputProps) {
  const { t } = useTranslation();

  return (
    <div {...{ key }}>
      {description}
      {__BUILD_MODE__ === "electron" ? (
        <Button type="button" onClick={() => onInputUploadElectron(label)}>
          {t("line.button.upload")}
        </Button>
      ) : (
        <input
          type="file"
          onChange={(e) => onInputUpload(label, e.target.files[0])}
        />
      )}
    </div>
  );
}
