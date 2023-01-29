import { useTranslation } from "react-i18next";
import { Button } from "@/components";

interface IInputUploadProps {
  key?: any;
  description?: any;
  label?: any;
  onFieldUpload?: any;
  onFieldUploadElectron?: any;
}

export default function InputUpload({
  key,
  label,
  description,
  onFieldUpload,
  onFieldUploadElectron,
}: IInputUploadProps) {
  const { t } = useTranslation();

  return (
    <div {...{ key }}>
      {description}
      {__BUILD_MODE__ === "electron" ? (
        <Button type="button" onClick={() => onFieldUploadElectron(label)}>
          {t("line.button.upload")}
        </Button>
      ) : (
        <input
          type="file"
          onChange={(e) => onFieldUpload(label, e.target.files[0])}
        />
      )}
    </div>
  );
}
