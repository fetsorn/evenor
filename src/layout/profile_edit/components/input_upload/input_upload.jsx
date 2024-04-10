import React from "react";
import { useTranslation } from "react-i18next";
import { API } from "../../../../api";
import { useStore } from "../../../../store/index.js";
import { Button, AssetView } from "../../../../components/index.js";
import styles from "./input_upload.module.css";
import { InputText } from "../index.js";

function UploadButton({ onUpload, title }) {
  // if (__BUILD_MODE__ === "electron") {
  //   return (
  //     <Button type="button" onClick={() => onUpload()}>
  //       {title}
  //     </Button>
  //   );
  // }

  return <input type="file" onChange={(e) => onUpload(e.target.files[0])} />;
}

export function InputUpload({ schema, record, onFieldChange }) {
  const { t } = useTranslation();

  const branch = record._;

  const filehashBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === "filehash",
  );

  const filenameBranch = Object.keys(schema).find(
    (b) => schema[b].trunk === branch && schema[b].task === "filename",
  );

  const repoUUID = useStore((state) => state.repoUUID);

  async function onRename(_, filenameValue) {
    const recordNew = { ...record };

    recordNew[filenameBranch] = filenameValue;

    onFieldChange(branch, recordNew);
  }

  async function onUpload(file) {
    const api = new API(repoUUID);

    const [filehash, filename] = await api.uploadFile(file);

    const recordNew = { ...record };

    recordNew[filehashBranch] = filehash;

    recordNew[filenameBranch] = filename;

    onFieldChange(branch, recordNew);
  }

  const isNotUploaded = record[filehashBranch] === undefined;

  return (
    <div>
      <div>{record.UUID}</div>

      <InputText
        {...{
          branch: filenameBranch,
          value: record[filenameBranch] ?? "",
          onFieldChange: onRename,
        }}
      />

      {record[filehashBranch] ?? ""}

      {isNotUploaded && (
        <UploadButton
          onUpload={() => onUpload()}
          title={t("line.button.upload")}
        />
      )}

      {record[filenameBranch] && record[filehashBranch] && (
        <AssetView {...{ record, schema }} />
      )}
    </div>
  );
}
