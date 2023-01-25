import { useTranslation } from "react-i18next";
import { Button } from "../../../../../../components";

interface IInputUploadProps {
  key?: any;
  description?: any;
  label?: any;
  onInputUpload?: any;
  onInputUploadElectron?: any;
}

export default function InputUpload({
  key,
  label,
  description,
  onInputUpload,
  onInputUploadElectron,
}: IInputUploadProps) {
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
